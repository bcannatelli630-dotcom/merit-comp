'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addEngagement, deleteAccount } from '../../actions';
import { C, btn } from '../../../components/ui';

export default function AccountActions({ accountId, accountName, hasEngagements }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');

  async function add() {
    setBusy('add');
    const fd = new FormData();
    fd.set('account_id', accountId);
    await addEngagement(fd);
    router.refresh(); setBusy('');
  }

  async function remove() {
    if (!confirm('Delete "' + accountName + '" and everything under it?')) return;
    setBusy('del');
    const fd = new FormData();
    fd.set('id', accountId);
    await deleteAccount(fd);
    router.refresh(); setBusy('');
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={add} disabled={!!busy} style={{ ...btn, padding: '9px 14px', fontSize: 12.5, background: '#fff', border: '1px dashed ' + C.border, color: C.mute }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14" /><path d="M5 12h14" />
        </svg>
        {busy === 'add' ? 'Adding…' : 'Add engagement'}
      </button>
      {!hasEngagements && (
        <button onClick={remove} disabled={!!busy} style={{ ...btn, padding: '9px 14px', fontSize: 12.5, background: '#fff', border: '1px solid ' + C.border, color: C.mute }}>
          {busy === 'del' ? 'Deleting…' : 'Delete account'}
        </button>
      )}
    </div>
  );
}
