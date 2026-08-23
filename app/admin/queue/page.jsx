import { requireUser } from '../../../lib/supabase/server';
import { compTypeLabel } from '../../../lib/comp';
import { C, card, pill } from '../../../components/ui';
import Shell, { PageHead } from '../../../components/Shell';
import Avatar from '../../../components/Avatar';
import QueueCard from './QueueCard';
import PromoteButton from './PromoteButton';

export const dynamic = 'force-dynamic';

export default async function Queue() {
  const ctx = await requireUser();
  if (!ctx) return null;
  const { supabase } = ctx;

  const { data: requests } = await supabase
    .from('requests')
    .select('*, employee:profiles!requests_employee_id_fkey(id, full_name, email)')
    .order('submitted_at', { ascending: false });

  const pending = (requests || []).filter((r) => r.status === 'pending');
  const reviewed = (requests || []).filter((r) => r.status !== 'pending');

  return (
    <Shell adminOnly>
      <PageHead
        title="Approval queue"
        subtitle="Set the comp type and rate, add remarks, then approve or deny. The employee is emailed either way."
      />

      {pending.length === 0 && (
        <div style={{ fontSize: 13.5, color: C.faint, marginBottom: 32 }}>Nothing pending review.</div>
      )}
      {pending.map((r) => <QueueCard key={r.id} request={r} />)}

      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.09em', color: C.faint, margin: '34px 0 12px' }}>
        RECENTLY REVIEWED
      </div>
      {reviewed.length === 0 && <div style={{ fontSize: 13.5, color: C.faint }}>Nothing reviewed yet.</div>}

      {reviewed.map((r) => (
        <div key={r.id} style={{ ...card, padding: '18px 22px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <Avatar id={r.employee?.id} name={r.employee?.full_name} email={r.employee?.email} size={30} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{r.account_name}</div>
                <div style={{ fontSize: 11.5, color: C.faint }}>
                  {r.employee?.full_name || r.employee?.email} · reviewed {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
            <span style={pill(r.status)}>{r.status[0].toUpperCase() + r.status.slice(1)}</span>
          </div>

          {r.status === 'approved' && r.rate != null && (
            <div style={{ fontSize: 12.5, color: C.sageDeep, fontWeight: 700, marginTop: 8 }}>
              {compTypeLabel(r.comp_type)} at {Number(r.rate)}%
            </div>
          )}
          {r.admin_remarks && (
            <div style={{ fontSize: 13, color: C.mute, marginTop: 8, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{r.admin_remarks}</div>
          )}
          {r.status === 'approved' && !r.account_id && <PromoteButton id={r.id} />}
        </div>
      ))}
    </Shell>
  );
}
