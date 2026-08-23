'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseAdmin, requireUser } from '../lib/supabase/server';
import { sendMail } from '../lib/email';
import { currentPeriod } from '../lib/comp';

async function ctx() {
  const c = await requireUser();
  if (!c) redirect('/login');
  return c;
}
async function adminCtx() {
  const c = await ctx();
  if (c.profile.role !== 'admin') throw new Error('Not authorized.');
  return c;
}
const esc = (s) => String(s || '').replace(/</g, '&lt;');

/* ---------- employee: submit a claim ---------- */
export async function submitRequest(formData) {
  const { profile, supabase } = await ctx();
  const account_name = String(formData.get('account_name') || '').trim();
  const narrative = String(formData.get('narrative') || '').trim();
  if (!account_name || !narrative) return { error: 'Add an account name and a short narrative.' };

  const { error } = await supabase.from('requests').insert({
    employee_id: profile.id, account_name, narrative, status: 'pending',
  });
  if (error) return { error: error.message };

  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (to) {
    await sendMail({
      to,
      subject: 'New comp claim: ' + account_name,
      heading: 'A new claim needs your review',
      lines: [
        '<b>' + esc(profile.full_name || profile.email) + '</b> submitted a claim for <b>' + esc(account_name) + '</b>.',
        esc(narrative),
      ],
      cta: { href: '/admin/queue', label: 'Open the approval queue' },
    });
  }

  revalidatePath('/requests');
  revalidatePath('/admin/queue');
  redirect('/requests?sent=1');
}

/* ---------- admin: decide a claim ---------- */
export async function reviewRequest(formData) {
  const { supabase } = await adminCtx();
  const id = String(formData.get('id'));
  const decision = String(formData.get('decision'));
  const comp_type = String(formData.get('comp_type') || 'contract');
  const rate = Number(formData.get('rate') || 0);
  const admin_remarks = String(formData.get('admin_remarks') || '');

  const { data: req, error: readErr } = await supabase
    .from('requests')
    .select('*, employee:profiles!requests_employee_id_fkey(email, full_name)')
    .eq('id', id).single();
  if (readErr) return { error: readErr.message };

  const { error } = await supabase.from('requests').update({
    status: decision,
    admin_remarks,
    comp_type: decision === 'approved' ? comp_type : null,
    rate: decision === 'approved' ? rate : null,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) return { error: error.message };

  if (req && req.employee && req.employee.email) {
    const approved = decision === 'approved';
    await sendMail({
      to: req.employee.email,
      subject: (approved ? 'Approved: ' : 'Not approved: ') + req.account_name,
      heading: 'Your claim on ' + esc(req.account_name) + (approved ? ' was approved' : ' was not approved'),
      lines: [
        approved
          ? 'Comp is established at <b>' + rate + '%</b>.'
          : 'The claim was denied. Remarks below.',
        admin_remarks ? '<i>' + esc(admin_remarks) + '</i>' : '',
      ].filter(Boolean),
      cta: { href: '/requests', label: 'View your requests' },
    });
  }

  revalidatePath('/admin/queue');
  revalidatePath('/requests');
  return { ok: true };
}

/* ---------- admin: promote an approved claim into the chart of accounts ---------- */
export async function createAccountFromRequest(formData) {
  const { supabase } = await adminCtx();
  const id = String(formData.get('id'));

  const { data: req } = await supabase.from('requests').select('*').eq('id', id).single();
  if (!req) return { error: 'Request not found.' };

  const { data: acct, error } = await supabase.from('accounts')
    .insert({ name: req.account_name, owner_id: req.employee_id })
    .select().single();
  if (error) return { error: error.message };

  await supabase.from('engagements').insert({
    account_id: acct.id,
    name: req.account_name,
    comp_type: req.comp_type || 'contract',
    rate: req.rate || 0,
    period: currentPeriod(),
  });
  await supabase.from('requests').update({ account_id: acct.id }).eq('id', id);

  revalidatePath('/admin/queue');
  revalidatePath('/admin/accounts');
  return { ok: true };
}

/* ---------- admin: accounts & engagements ---------- */
export async function addAccount(formData) {
  const { supabase } = await adminCtx();
  const name = String(formData.get('name') || '').trim();
  const owner_id = String(formData.get('owner_id') || '');
  if (!name || !owner_id) return { error: 'Name and owner are required.' };
  const { error } = await supabase.from('accounts').insert({ name, owner_id });
  if (error) return { error: error.message };
  revalidatePath('/admin/accounts');
  return { ok: true };
}

export async function deleteAccount(formData) {
  const { supabase } = await adminCtx();
  await supabase.from('accounts').delete().eq('id', String(formData.get('id')));
  revalidatePath('/admin/accounts');
  return { ok: true };
}

export async function addEngagement(formData) {
  const { supabase } = await adminCtx();
  const { error } = await supabase.from('engagements').insert({
    account_id: String(formData.get('account_id')),
    name: 'New engagement',
    comp_type: 'contract',
    rate: 0,
    period: currentPeriod(),
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/accounts');
  return { ok: true };
}

export async function saveEngagement(formData) {
  const { supabase } = await adminCtx();
  const id = String(formData.get('id'));
  const patch = {
    name: String(formData.get('name') || 'Engagement'),
    comp_type: String(formData.get('comp_type') || 'contract'),
    rate: Number(formData.get('rate') || 0),
    contract_value: Number(formData.get('contract_value') || 0),
    margin_value: Number(formData.get('margin_value') || 0),
    margin_baseline: Number(formData.get('margin_baseline') || 0),
    period: String(formData.get('period') || currentPeriod()),
  };
  const { error } = await supabase.from('engagements').update(patch).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/accounts');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteEngagement(formData) {
  const { supabase } = await adminCtx();
  await supabase.from('engagements').delete().eq('id', String(formData.get('id')));
  revalidatePath('/admin/accounts');
  return { ok: true };
}

export async function markPaid(formData) {
  const { supabase } = await adminCtx();
  const id = String(formData.get('id'));
  const paid = String(formData.get('paid')) === 'true';
  const { error } = await supabase.from('engagements')
    .update({ paid, paid_date: paid ? new Date().toISOString().slice(0, 10) : null })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/accounts');
  revalidatePath('/dashboard');
  return { ok: true };
}

/* ---------- admin: people ---------- */
export async function invitePerson(formData) {
  await adminCtx();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const full_name = String(formData.get('full_name') || '').trim();
  const job_title = String(formData.get('job_title') || '').trim();
  const role = String(formData.get('role') || 'employee');
  if (!email) return { error: 'An email address is required.' };

  const admin = supabaseAdmin();
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo: site ? site + '/login' : undefined,
  });
  if (error) return { error: error.message };

  if (data && data.user && data.user.id) {
    await admin.from('profiles').upsert({
      id: data.user.id, email, full_name, job_title, role, active: true,
    });
  }
  revalidatePath('/admin/people');
  return { ok: true };
}

export async function updatePerson(formData) {
  const { supabase } = await adminCtx();
  const id = String(formData.get('id'));
  const patch = {
    full_name: String(formData.get('full_name') || ''),
    job_title: String(formData.get('job_title') || ''),
    role: String(formData.get('role') || 'employee'),
    active: String(formData.get('active')) === 'true',
  };
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/people');
  return { ok: true };
}
