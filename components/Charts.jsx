import { fmt } from '../lib/comp';
import { C, card, mono } from './ui';

export function QuarterChart({ data, year }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div style={{ ...card, padding: '20px 24px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>Comp by quarter · {year}</div>
        <div style={{ fontSize: 12.5, color: C.mute }}>Solid = paid, hatched = pending</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 190, padding: '0 6px' }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 8 }}>
            <div style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: C.body }}>{fmt(d.total)}</div>
            <div style={{ width: '100%', maxWidth: 64, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderRadius: '7px 7px 0 0', overflow: 'hidden' }}>
              <div style={{ height: Math.round((d.pending / max) * 150), background: `repeating-linear-gradient(135deg,${C.sagePale},${C.sagePale} 4px,#dbe5d3 4px,#dbe5d3 8px)` }} />
              <div style={{ height: Math.round((d.paid / max) * 150), background: C.sage }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.mute }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnnualChart({ data, thisYear }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ ...card, padding: '20px 24px' }}>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 20 }}>Year over year</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 150, padding: '0 6px' }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 8 }}>
            <div style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: C.body }}>{fmt(d.value)}</div>
            <div style={{ width: '100%', maxWidth: 56, height: Math.max(4, Math.round((d.value / max) * 108)), borderRadius: '7px 7px 0 0', background: Number(d.label) === thisYear ? C.sage : C.sagePale }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: C.mute }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BreakdownList({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ ...card, padding: '20px 24px' }}>
      <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 16 }}>{title}</div>
      {rows.length === 0 && <div style={{ fontSize: 13, color: C.faint }}>Nothing recorded yet.</div>}
      {rows.map((r) => (
        <div key={r.label} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.body, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
            <div style={{ ...mono, fontSize: 12.5, fontWeight: 700, flex: '0 0 auto' }}>{fmt(r.value)}</div>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: '#f0efea', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((r.value / max) * 100)}%`, background: C.sage, borderRadius: 100 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
