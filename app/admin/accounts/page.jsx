import { requireUser } from '../../../lib/supabase/server';
import { computeAmount, fmt, periodOptions } from '../../../lib/comp';
import { C, cardLg, mono } from '../../../components/ui';
import Shell, { PageHead } from '../../../components/Shell';
import Avatar from '../../../components/Avatar';
import NewAccount from './NewAccount';
import EngagementRow from './EngagementRow';
import AccountActions from './AccountActions';

export const dynamic = 'force-dynamic';

export default async function ChartOfAccounts() {
  const ctx = await requireUser();
  if (!ctx) return null;
  const { supabase } = ctx;

  const { data: people } = await supabase
    .from('profiles').select('id, full_name, email, role').eq('active', true).order('full_name');
  const { data: accounts } = await supabase
    .from('accounts').select('*, engagements(*)').order('name');

  const periods = periodOptions();
  const byId = Object.fromEntries((people || []).map((p) => [p.id, p]));

  return (
    <Shell adminOnly>
      <PageHead
        title="Chart of accounts"
        subtitle="Every account, its owner, and the engagements earning comp. Enter the inputs and comp calculates on save."
      />

      <NewAccount people={(people || []).filter((p) => p.role !== 'admin')} />

      {(!accounts || accounts.length === 0) && (
        <div style={{ fontSize: 13.5, color: C.faint }}>No accounts yet. Add one above, or approve a claim in the queue.</div>
      )}

      {(accounts || []).map((a) => {
        const engs = (a.engagements || []).slice().sort((x, y) => String(y.period).localeCompare(String(x.period)));
        const total = engs.reduce((s, e) => s + computeAmount(e), 0);
        const owner = byId[a.owner_id] || {};
        return (
          <div key={a.id} style={{ ...cardLg, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: '1px solid ' + C.line2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <Avatar id={owner.id} name={owner.full_name} email={owner.email} size={30} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize: 11.5, color: C.faint }}>{owner.full_name || owner.email || 'Unassigned'}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                <div style={{ ...mono, fontSize: 15, fontWeight: 700 }}>{fmt(total)}</div>
                <div style={{ fontSize: 11, color: C.faint }}>
                  {engs.length === 1 ? '1 engagement' : engs.length + ' engagements'}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px 18px' }}>
              {engs.map((e) => <EngagementRow key={e.id} engagement={e} periods={periods} />)}
              <AccountActions accountId={a.id} accountName={a.name} hasEngagements={engs.length > 0} />
            </div>
          </div>
        );
      })}
    </Shell>
  );
}
