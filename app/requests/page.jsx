import { requireUser } from '../../lib/supabase/server';
import { C, card, pill } from '../../components/ui';
import Shell, { PageHead } from '../../components/Shell';
import Toast from '../../components/Toast';

export const dynamic = 'force-dynamic';

export default async function MyRequests({ searchParams }) {
  const ctx = await requireUser();
  if (!ctx) return null;
  const { profile, supabase } = ctx;

  const { data: requests } = await supabase
    .from('requests').select('*').eq('employee_id', profile.id)
    .order('submitted_at', { ascending: false });

  return (
    <Shell>
      <PageHead title="My requests" subtitle="Status and feedback on accounts you have asked to claim." />

      {(!requests || requests.length === 0) && (
        <div style={{ fontSize: 13.5, color: C.faint }}>Nothing submitted yet.</div>
      )}

      {(requests || []).map((r) => (
        <div key={r.id} style={{ ...card, padding: '20px 22px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{r.account_name}</div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>
                Submitted {new Date(r.submitted_at).toLocaleDateString()}
              </div>
            </div>
            <span style={pill(r.status)}>{r.status[0].toUpperCase() + r.status.slice(1)}</span>
          </div>

          <div style={{ fontSize: 13.5, color: C.body, marginTop: 10, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{r.narrative}</div>

          {r.status === 'approved' && r.rate != null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 12, padding: '7px 12px', borderRadius: 9, background: C.sageTint, border: '1px solid rgba(95,122,78,.26)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.sageDeep} strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 19L19 5" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
              </svg>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.sageDeep }}>
                Comp rate established at {Number(r.rate)}%
              </span>
            </div>
          )}

          {r.admin_remarks && (
            <div style={{ marginTop: 14, padding: '13px 15px', background: '#f7f6f3', borderLeft: '3px solid ' + C.sage, borderRadius: '0 10px 10px 0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', color: C.faint, marginBottom: 4 }}>FEEDBACK FROM THE OWNER</div>
              <div style={{ fontSize: 13.5, color: C.body, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{r.admin_remarks}</div>
            </div>
          )}
        </div>
      ))}

      {searchParams?.sent && <Toast message="Request submitted — the owner has been emailed." />}
    </Shell>
  );
}
