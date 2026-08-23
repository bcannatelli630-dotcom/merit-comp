'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addAccount } from '../../actions';
import { C, card, btnGhost, input, label } from '../../../components/ui';

export default function NewAccount({ people }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [owner, setOwner] = useState(people[0]?.id || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true); setErr('');
    const fd = new FormData();
    fd.set('name', name);
    fd.set('owner_id', owner);
    const res = await addAccount(fd);
    if (res && res.error) setErr(res.error);
    else { setName(''); router.refresh(); }
    setBusy(false);
  }

  return (
    <div style={{ ...card, padding: '18px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={label}>NEW ACCOUNT</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer or property name" style={input} />
        </div>
        <div style={{ width: 200 }}>
          <div style={label}>OWNER</div>
          <select value={owner} onChange={(e) => setOwner(e.target.value)} style={{ ...input, cursor: 'pointer' }}>
            {people.length === 0 && <option value="">No employees yet</option>}
            {people.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
          </select>
        </div>
        <button onClick={go} disabled={busy || !name || !owner} style={{ ...btnGhost, padding: '10px 16px', opacity: busy || !name || !owner ? 0.55 : 1 }}>
          {busy ? 'Adding…' : 'Add account'}
        </button>
      </div>
      {err && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{err}</div>}
    </div>
  );
}
