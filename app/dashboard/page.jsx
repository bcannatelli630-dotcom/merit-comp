import { requireUser } from '../../lib/supabase/server';
import { computeAmount, fmt, compTypeLabel, quarterOf, yearOf } from '../../lib/comp';
import { C, card, cardLg, mono } from '../../components/ui';
import { QuarterChart, AnnualChart, BreakdownList } from '../../components/Charts';
import Shell, { PageHead } from '../../components/Shell';
import ScopeFilter from './ScopeFilter';

export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }) {
  const ctx = await requireUser();
  if (!ctx) return null;
  const { profile, supabase } = ctx;
  const isAdmin = profile.role === 'admin';
  const year = new Date().getFullYear();

  const people = isAdmin
    ? (await supabase.from('profiles').select('id, full_name, email, role').order('full_name')).data || []
    : [profile];

  const scope = isAdmin ? (searchParams?.person || 'all') : profile.id;

  let q = supabase.from('accounts').select('id, name, owner_id, engagements(*)');
  if (!isAdmin) q = q.eq('owner_id', profile.id);
  else if (scope !== 'all') q = q.eq('owner_id', scope);
  const { data: accounts } = await q;

  const rows = [];
  (accounts || []).forEach((a) => (a.engagements || []).forEach((e) => rows.push({ ...e, accountName: a.name })));

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((qLabel) => {
    let paidQ = 0, pendingQ = 0;
    rows.filter((e) => yearOf(e.period) === year && quarterOf(e.period) === qLabel)
      .forEach((e) => { const amt = computeAmount(e); if (e.paid) paidQ += amt; else pendingQ += amt; });
    return { label: qLabel, paid: paidQ, pending: pendingQ, total: paidQ + pendingQ };
  });

  const annual = [year - 2, year - 1, year].map((y) => ({
    label: String(y),
    value: rows.filter((e) => yearOf(e.period) === y).reduce((s, e) => s + computeAmount(e), 0),
  }));

  let paid = 0, unpaid = 0;
  const byType = {};
  const byAccount = {};
  rows.filter((e) => yearOf(e.period) === year).forEach((e) => {
    const amt = computeAmount(e);
    if (e.paid) paid += amt; else unpaid += amt;
    byType[e.comp_type] = (byType[e.comp_type] || 0) + amt;
    byAccount[e.accountName] = (byAccount[e.accountName] || 0) + amt;
  });
  const ytd = paid + unpaid;
  const thisQLabel = 'Q' + (Math.floor(new Date().getMonth() / 3) + 1);
  const thisQ = quarters.find((x) => x.label === thisQLabel) || quarters[0];

  const breakdown = isAdmin
    ? Object.entries(byType).map(([k, v]) => ({ label: compTypeLabel(k), value: v })).filter((r) => r.value > 0)
    : Object.entries(byAccount).map(([k, v]) => ({ label: k, value: v })).sort((a, b) => b.value - a.value);

  const scopedPerson = people.find((p) => p.id === scope);
  const scopeLabel = !isAdmin
    ? (profile.job_title || 'Your plan')
    : scope === 'all' ? 'Everyone' : (scopedPerson?.full_name || 'Person');

  return (
    <Shell>
      <PageHead
        eyebrow={isAdmin ? 'Owner view' : 'Welcome back, ' + (profile.full_name || '').split(' ')[0]}
        title={isAdmin ? 'Variable comp overview' : 'My compensation'}
        subtitle={isAdmin
          ? 'Earned comp across every variable plan, calculated from live engagement inputs.'
          : 'Earned to date under your variable plan. Terms are set by the owner at approval.'}
        right={isAdmin ? <ScopeFilter people={people} value={scope} /> : null}
      />

      <div style={{ ...cardLg, padding: '26px 28px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: C.faint }}>
              EARNED YEAR TO DATE · {year}
            </div>
            <div style={{ ...mono, fontSize: 42, fontWeight: 700, letterSpacing: '-.02em', marginTop: 6, lineHeight: 1 }}>{fmt(ytd)}</div>
            <div style={{ color: C.mute, fontSize: 13.5, marginTop: 8 }}>
              <b style={{ color: C.ink }}>{fmt(paid)}</b> paid · <b style={{ color: C.ink }}>{fmt(unpaid)}</b> awaiting payment
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', color: '#fff', background: C.sage, padding: '6px 12px', borderRadius: 100 }}>{scopeLabel}</span>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: C.sageDeep, background: C.sageTint, padding: '6px 12px', borderRadius: 100 }}>
              {thisQ.label} {year} · {fmt(thisQ.total)}
            </div>
          </div>
        </div>
        <div style={{ height: 10, borderRadius: 100, background: '#efeee9', marginTop: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: (ytd ? Math.round((paid / ytd) * 100) : 0) + '%', background: C.sage, borderRadius: 100 }} />
        </div>
        <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8 }}>
          {ytd ? Math.round((paid / ytd) * 100) + '% of earned comp has been paid out' : 'No comp recorded yet this year'}
        </div>
      </div>

      <div data-tiles style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {quarters.map((qq) => (
          <div key={qq.label} style={{ ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.07em', color: C.faint }}>{qq.label} {year}</div>
            <div style={{ ...mono, fontSize: 23, fontWeight: 700, marginTop: 9 }}>{fmt(qq.total)}</div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 3 }}>{fmt(qq.paid)} paid</div>
          </div>
        ))}
      </div>

      <QuarterChart data={quarters} year={year} />

      <div data-two style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <AnnualChart data={annual} thisYear={year} />
        <BreakdownList title={isAdmin ? 'Comp by type' : 'Comp by account'} rows={breakdown} />
      </div>
    </Shell>
  );
}
