'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reviewRequest } from '../../actions';
import { COMP_TYPES } from '../../../lib/comp';
import { C, cardLg, btnSage, btnGhost, input, numInput, label, pill } from '../../../components/ui';
import Avatar from '../../../components/Avatar';

export default function QueueCard({ request: r }) {
  const router = useRouter();
  const [compType, setCompType] = useState('contract');
  const [rate, setRate] = useState('3');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  async function decide(decision) {
    setBusy(decision); setErr('');
    const fd = new FormData();
    fd.set('id', r.id);
    fd.set('decision', decision);
    fd.set('comp_type', compType);
    fd.set('rate', rate);
    fd.set('admin_remarks', remarks);
    const res = await reviewRequest(fd);
    if (res && res.error) { setErr(res.error); setBusy(''); return; }
    router.refresh();
  }

  return (
    <div style={{ ...cardLg, padding: '22px 24px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <Avatar id={r.employee?.id} name={r.employee?.full_name} email={r.employee?.email} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>{r.account_name}</div>
            <div style={{ fontSize: 11.5, color: C.faint }}>
              {r.employee?.full_name || r.employee?.email} · submitted {new Date(r.submitted_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <span style={pill('pending')}>Pending</span>
      </div>

      <div style={{ fontSize: 13.5, color: C.body, marginTop: 14, lineHeight: 1.55, padding: '13px 15px', background: '#f7f6f3', borderRadius: 10, whiteSpace: 'pre-wrap' }}>
        {r.narrative}
      </div>

      <div data-two style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 18 }}>
        <div>
          <div style={label}>COMP TYPE <span style={{ color: '#c2410c' }}>· ADMIN ONLY</span></div>
          <select value={compType} onChange={(e) => setCompType(e.target.value)} style={{ ...input, cursor: 'pointer' }}>
            {COMP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <div style={label}>RATE %</div>
          <input type="number" step="0.25" value={rate} onChange={(e) => setRate(e.target.value)} style={numInput} />
        </div>
      </div>

      <div style={{ ...label, marginTop: 18 }}>REMARKS · SENT TO EMPLOYEE</div>
      <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
        placeholder="Feedback, conditions, or the reason for a denial."
        style={{ ...input, minHeight: 78, resize: 'vertical', lineHeight: 1.5 }} />

      {err && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <button onClick={() => decide('approved')} disabled={!!busy} style={{ ...btnSage, padding: '10px 17px', opacity: busy ? 0.6 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
          {busy === 'approved' ? 'Sending…' : 'Approve at ' + (rate || 0) + '%'}
        </button>
        <button onClick={() => decide('denied')} disabled={!!busy} style={{ ...btnGhost, padding: '10px 17px', color: '#8a3a24', opacity: busy ? 0.6 : 1 }}>
          {busy === 'denied' ? 'Sending…' : 'Deny'}
        </button>
      </div>
    </div>
  );
}
