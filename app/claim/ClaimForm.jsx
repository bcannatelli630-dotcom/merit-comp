'use client';
import { useState } from 'react';
import { submitRequest } from '../actions';
import { C, cardLg, btnPrimary, input, label } from '../../components/ui';

export default function ClaimForm() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function action(formData) {
    setBusy(true); setErr('');
    const res = await submitRequest(formData);
    if (res && res.error) setErr(res.error);
    setBusy(false);
  }

  return (
    <form action={action} style={{ ...cardLg, padding: '24px 26px', maxWidth: 620 }}>
      <div style={label}>ACCOUNT / PROJECT NAME</div>
      <input name="account_name" required placeholder="e.g. Fairview School District — Gym Roof" style={input} />

      <div style={{ ...label, marginTop: 18 }}>NARRATIVE</div>
      <textarea name="narrative" required rows={6}
        placeholder="Describe the opportunity, the contact, expected scope and timing."
        style={{ ...input, minHeight: 130, resize: 'vertical', lineHeight: 1.5 }} />

      {err && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{err}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <button type="submit" disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 11l2.2 2.2L15 8.5" />
          </svg>
          {busy ? 'Submitting…' : 'Submit for review'}
        </button>
        <div style={{ fontSize: 12, color: C.faint }}>Comp type and rate are set by the owner at approval.</div>
      </div>
    </form>
  );
}
