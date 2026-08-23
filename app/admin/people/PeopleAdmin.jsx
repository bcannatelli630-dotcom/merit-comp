'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { invitePerson, updatePerson } from '../../actions';
import { C, card, cardLg, btnGhost, btnQuiet, input, label, pill } from '../../../components/ui';
import Avatar from '../../../components/Avatar';

export default function PeopleAdmin({ people }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', full_name: '', job_title: '', role: 'employee' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function invite() {
    setBusy(true); setErr(''); setMsg('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    const res = await invitePerson(fd);
    if (res && res.error) setErr(res.error);
    else {
      setMsg('Invitation sent to ' + form.email + '.');
      setForm({ email: '', full_name: '', job_title: '', role: 'employee' });
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <>
      <div style={{ ...cardLg, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 14 }}>Invite someone</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 140px', gap: 12, alignItems: 'flex-end' }} data-tiles>
          <div>
            <div style={label}>EMAIL</div>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@meritroofing.com" style={input} />
          </div>
          <div>
            <div style={label}>FULL NAME</div>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Sam Rivera" style={input} />
          </div>
          <div>
            <div style={label}>JOB TITLE</div>
            <input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} placeholder="Salesperson" style={input} />
          </div>
          <div>
            <div style={label}>ROLE</div>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ ...input, cursor: 'pointer' }}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button onClick={invite} disabled={busy || !form.email} style={{ ...btnGhost, marginTop: 14, opacity: busy || !form.email ? 0.55 : 1 }}>
          {busy ? 'Sending…' : 'Send invitation'}
        </button>
        {err && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{err}</div>}
        {msg && <div style={{ color: C.sageDeep, fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{msg}</div>}
      </div>

      {people.map((p) => <PersonRow key={p.id} person={p} />)}
    </>
  );
}

function PersonRow({ person }) {
  const router = useRouter();
  const [p, setP] = useState(person);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setP((prev) => ({ ...prev, [k]: v })); setDirty(true); };

  async function save() {
    setBusy(true);
    const fd = new FormData();
    fd.set('id', p.id);
    fd.set('full_name', p.full_name || '');
    fd.set('job_title', p.job_title || '');
    fd.set('role', p.role);
    fd.set('active', String(p.active));
    await updatePerson(fd);
    setDirty(false); setBusy(false); router.refresh();
  }

  return (
    <div style={{ ...card, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <Avatar id={p.id} name={p.full_name} email={p.email} />
      <div style={{ minWidth: 180, flex: 1 }}>
        <input value={p.full_name || ''} onChange={(e) => set('full_name', e.target.value)} placeholder="Full name"
          style={{ ...input, padding: '7px 9px', fontWeight: 700, border: '1px solid transparent', background: 'transparent' }} />
        <div style={{ fontSize: 11.5, color: C.faint, paddingLeft: 9 }}>{p.email}</div>
      </div>
      <input value={p.job_title || ''} onChange={(e) => set('job_title', e.target.value)} placeholder="Job title"
        style={{ ...input, width: 150, padding: '8px 10px', fontSize: 13 }} />
      <select value={p.role} onChange={(e) => set('role', e.target.value)} style={{ ...input, width: 130, padding: '8px 10px', fontSize: 13, cursor: 'pointer' }}>
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
      <span style={pill(p.active ? 'approved' : 'denied')}>{p.active ? 'Active' : 'Disabled'}</span>
      <button onClick={() => set('active', !p.active)} style={{ ...btnQuiet, color: C.mute, border: '1px solid ' + C.border }}>
        {p.active ? 'Disable' : 'Enable'}
      </button>
      {dirty && (
        <button onClick={save} disabled={busy} style={{ ...btnQuiet, background: C.sage, color: '#fff', border: 'none' }}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      )}
    </div>
  );
}
