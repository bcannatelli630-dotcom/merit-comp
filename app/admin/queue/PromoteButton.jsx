'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccountFromRequest } from '../../actions';
import { btnQuiet } from '../../../components/ui';

export default function PromoteButton({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    const fd = new FormData();
    fd.set('id', id);
    await createAccountFromRequest(fd);
    router.refresh();
    setBusy(false);
  }

  return (
    <button onClick={go} disabled={busy} style={{ ...btnQuiet, marginTop: 14, opacity: busy ? 0.6 : 1 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M12 5v14" /><path d="M5 12h14" />
      </svg>
      {busy ? 'Adding…' : 'Add to chart of accounts'}
    </button>
  );
}
