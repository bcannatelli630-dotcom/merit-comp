import { requireUser } from '../../../lib/supabase/server';
import { C } from '../../../components/ui';
import Shell, { PageHead } from '../../../components/Shell';
import PeopleAdmin from './PeopleAdmin';

export const dynamic = 'force-dynamic';

export default async function People() {
  const ctx = await requireUser();
  if (!ctx) return null;
  const { supabase } = ctx;

  const { data: people } = await supabase.from('profiles').select('*').order('created_at');

  return (
    <Shell adminOnly>
      <PageHead
        title="People"
        subtitle="Invite the people on a variable plan. They set their own password from the invitation email."
      />
      <PeopleAdmin people={people || []} />
      <div style={{ fontSize: 12, color: C.faint, marginTop: 16, maxWidth: 620, lineHeight: 1.6 }}>
        Admins see every account and all comp figures. Employees see only the accounts they own, and never see the comp type behind their rate.
      </div>
    </Shell>
  );
}
