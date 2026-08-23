import { redirect } from 'next/navigation';
import { requireUser } from '../lib/supabase/server';
import Sidebar from './Sidebar';
import { C } from './ui';

/** Server component: guards the route, paints the sidebar, and hands the
 *  signed-in profile + supabase client back to the page via a render prop. */
export default async function Shell({ adminOnly = false, children }) {
  const ctx = await requireUser();
  if (!ctx) redirect('/login');
  const { profile, supabase } = ctx;

  if (adminOnly && profile.role !== 'admin') redirect('/dashboard');

  const { count: pendingCount } = await supabase
    .from('requests').select('id', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: myRequestCount } = await supabase
    .from('requests').select('id', { count: 'exact', head: true }).eq('employee_id', profile.id);

  return (
    <div data-shell style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar profile={profile} pendingCount={pendingCount || 0} myRequestCount={myRequestCount || 0} />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <div data-mainpad style={{ padding: '30px 40px 64px', maxWidth: 1140 }}>{children}</div>
      </main>
    </div>
  );
}

export function PageHead({ eyebrow, title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
      <div>
        {eyebrow && <div style={{ color: C.mute, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{eyebrow}</div>}
        <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.02em' }}>{title}</div>
        {subtitle && <div style={{ color: C.mute, fontSize: 13.5, marginTop: 4, maxWidth: 640 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}
