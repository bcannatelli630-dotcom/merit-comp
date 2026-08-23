import ClaimForm from './ClaimForm';
import Shell, { PageHead } from '../../components/Shell';

export default function ClaimPage() {
  return (
    <Shell>
      <PageHead
        title="Claim a prospective account"
        subtitle="Submit before a proposal goes out so comp terms are settled for both parties. The owner is notified by email."
      />
      <ClaimForm />
    </Shell>
  );
}
