'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveEngagement, markPaid, deleteEngagement } from '../../actions';
import { COMP_TYPES, computeAmount, formulaLabel, fmt } from '../../../lib/comp';
import { C, btnQuiet, input, numInput, mono, pill } from '../../../components/ui';

const miniLabel = { fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', color: C.faint, marginBottom: 5 };
const mini = { ...input, padding: '9px 11px', borderRadius: 9, fontSize: 13 };
const miniNum = { ...mini, ...mono, fontWeight: 700 };

export default function EngagementRow({ engagement, periods }) {
  const router = useRouter();
  const [e, setE] = useState(engagement);
  const [busy, setBusy] = useState('');
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setE((prev) => ({ ...prev, [k]: v })); setDirty(true); };
  const amount = computeAmount(e);

  async function save() {
    setBusy('save');
    const fd = new FormData();
    ['id', 'name', 'comp_type', 'rate', 'contract_value', 'margin_value', 'margin_baseline', 'period']
      .forEach((k) => fd.set(k, e[k] ?? ''));
    await saveEngagement(fd);
    setDirty(false); setBusy(''); router.refresh();
  }

  async function togglePaid() {
    setBusy('paid');
    const fd = new FormData();
    fd.set('id', e.id);
    fd.set('paid', String(!e.paid));
    await markPaid(fd);
    setE((prev) => ({ ...prev, paid: !prev.paid }));
    setBusy(''); router.refresh();
  }

  async function remove() {
    if (!confirm('Delete this engagement?')) return;
    setBusy('del');
    const fd = new FormData();
    fd.set('id', e.id);
    await deleteEngagement(fd);
    router.refresh();
  }

  return (
    <div style={{ border: '1px solid #eceae5', borderRadius: 12, padding: '15px 16px', marginBottom: 12, background: '#fcfcfa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <input value={e.name} onChange={(ev) => set('name', ev.target.value)}
          style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 14, color: C.ink, border: '1px solid transparent', background: 'transparent', borderRadius: 8, padding: '5px 8px', marginLeft: -8 }} />
        <span style={pill(e.paid ? 'paid' : 'unpaid')}>{e.paid ? 'Paid' : 'Unpaid'}</span>
      </div>

      <div data-tiles style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <div>
          <div style={miniLabel}>COMP TYPE</div>
          <select value={e.comp_type} onChange={(ev) => set('comp_type', ev.target.value)} style={{ ...mini, cursor: 'pointer' }}>
            {COMP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <div style={miniLabel}>RATE %</div>
          <input type="number" step="0.25" value={e.rate} onChange={(ev) => set('rate', ev.target.value)} style={miniNum} />
        </div>
        <div>
          <div style={miniLabel}>PERIOD</div>
          <select value={e.period} onChange={(ev) => set('period', ev.target.value)} style={{ ...mini, cursor: 'pointer' }}>
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {e.comp_type === 'contract' && (
          <div>
            <div style={miniLabel}>CONTRACT VALUE $</div>
            <input type="number" value={e.contract_value} onChange={(ev) => set('contract_value', ev.target.value)} style={miniNum} />
          </div>
        )}
        {(e.comp_type === 'target_margin' || e.comp_type === 'margin_growth') && (
          <div>
            <div style={miniLabel}>{e.comp_type === 'margin_growth' ? 'CURRENT MARGIN $' : 'TARGET MARGIN $'}</div>
            <input type="number" value={e.margin_value} onChange={(ev) => set('margin_value', ev.target.value)} style={miniNum} />
          </div>
        )}
        {e.comp_type === 'margin_growth' && (
          <div>
            <div style={miniLabel}>PRIOR MARGIN BASELINE $</div>
            <input type="number" value={e.margin_baseline} onChange={(ev) => set('margin_baseline', ev.target.value)} style={miniNum} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid ' + C.line2, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12.5, color: C.mute }}>
          {formulaLabel(e)} · <b style={{ ...mono, fontSize: 15, color: C.ink }}>{fmt(amount)}</b>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {dirty && (
            <button onClick={save} disabled={!!busy} style={{ ...btnQuiet, background: C.sage, color: '#fff', border: 'none' }}>
              {busy === 'save' ? 'Saving…' : 'Save changes'}
            </button>
          )}
          <button onClick={togglePaid} disabled={!!busy} style={btnQuiet}>
            {busy === 'paid' ? 'Updating…' : e.paid ? 'Mark unpaid' : 'Mark paid'}
          </button>
          <button onClick={remove} disabled={!!busy} style={{ ...btnQuiet, color: C.mute, border: '1px solid ' + C.border }}>Delete</button>
        </div>
      </div>
      {e.paid && e.paid_date && (
        <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8 }}>Paid {e.paid_date}</div>
      )}
    </div>
  );
}
