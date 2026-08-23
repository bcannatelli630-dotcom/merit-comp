import { requireUser } from '../../lib/supabase/server';
import { computeAmount, fmt } from '../../lib/comp';
import { C, card, mono, pill } from '../../components/ui';
import Shell, { PageHead } from '../../components/Shell';

export const dynamic = 'force-dynamic';

export default async function MyAccounts() {
  const ctx = await requireUser();
  if (!ctx) return null;
  const { profile, supabase } = ctx;

  const { data: accounts } = await supabase
    .from('accounts').select('id, name, engagements(*)')
    .eq('owner_id', profile.id).order('name');

  return (
    <Shell>
      <PageHead title="My accounts" subtitle="Accounts you own and the engagements earning comp under each." />

      {(!accounts || accounts.length === 0) && (
        <div style={{ ...card, padding: '22px 24px', fontSize: 13.5, color: C.mute }}>
          No accounts assigned to you yet. Submit a claim under <b>Claim an Account</b> and the owner will assign it once approved.
        </div>
      )}

      {(accounts || []).map((a) => {
        const engs = (a.engagements || []).slice().sort((x, y) => String(y.period).localeCompare(String(x.period)));
        const total = engs.reduce((s, e) => s + computeAmount(e), 0);
        return (
          <div key={a.id} style={{ ...card, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '16px 20px', borderBottom: '1px solid ' + C.line2 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{a.name}</div>
              <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: C.sageDeep }}>{fmt(total)}</div>
            </div>

            {engs.length === 0 && (
              <div style={{ padding: '16px 20px', fontSize: 13, color: C.faint }}>No engagements recorded yet.</div>
            )}

            {engs.map((e) => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 100px 110px 96px', gap: 14, alignItems: 'center', padding: '13px 20px', borderBottom: '1px solid #f4f3ee' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                  <div style={{ fontSize: 11.5, color: C.faint }}>{Number(e.rate)}% of the agreed basis</div>
                </div>
                <div style={{ fontSize: 12.5, color: C.mute, fontWeight: 600 }}>{e.period}</div>
                <div style={{ ...mono, fontSize: 13.5, fontWeight: 700, textAlign: 'right' }}>{fmt(computeAmount(e))}</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={pill(e.paid ? 'paid' : 'unpaid')}>{e.paid ? 'Paid' : 'Unpaid'}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </Shell>
  );
}
