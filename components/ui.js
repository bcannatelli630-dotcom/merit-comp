export const C = {
  bg: '#f5f4f1', panel: '#fff', line: '#ecebe6', line2: '#f0efea', border: '#dcdad3',
  ink: '#1b1d29', body: '#4a4e5c', mute: '#6b6f7d', faint: '#9a9eaa',
  sage: '#5f7a4e', sageDeep: '#41592f', sageTint: '#e9efe2', sagePale: '#c3d3b6',
  sidebar: '#1b2418', orange: '#EE6401', warn: '#9a3412', warnTint: '#fdf1e7', danger: '#b4442a',
};

export const card = {
  background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14,
  boxShadow: '0 1px 2px rgba(20,20,40,.04)',
};
export const cardLg = { ...card, borderRadius: 16, boxShadow: '0 1px 3px rgba(20,20,40,.05)' };

export const label = {
  fontSize: 11, fontWeight: 800, letterSpacing: '.09em', color: C.faint, marginBottom: 6,
};
export const input = {
  width: '100%', padding: '11px 13px', borderRadius: 10, border: `1px solid ${C.border}`,
  background: '#fff', fontSize: 14, color: C.ink, fontFamily: 'inherit', boxSizing: 'border-box',
};
export const mono = { fontFamily: "'JetBrains Mono',ui-monospace,monospace" };
export const numInput = { ...input, ...mono, fontWeight: 700, fontSize: 13.5 };

export const btn = {
  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 17px', borderRadius: 10,
  border: 'none', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
};
export const btnPrimary = { ...btn, background: C.orange, color: '#fff', boxShadow: '0 2px 8px rgba(40,55,28,.2)' };
export const btnSage = { ...btn, background: C.sage, color: '#fff' };
export const btnGhost = { ...btn, background: '#fff', border: `1px solid ${C.border}`, color: C.ink };
export const btnQuiet = {
  ...btn, padding: '9px 15px', fontSize: 12.5, background: '#fff',
  border: `1px solid rgba(95,122,78,.3)`, color: C.sageDeep,
};

export function pill(kind) {
  const map = {
    paid:     { background: C.sageTint, color: C.sageDeep, border: '1px solid rgba(95,122,78,.28)' },
    approved: { background: C.sageTint, color: C.sageDeep, border: '1px solid rgba(95,122,78,.28)' },
    unpaid:   { background: C.warnTint, color: C.warn, border: '1px solid rgba(194,65,12,.22)' },
    pending:  { background: C.warnTint, color: C.warn, border: '1px solid rgba(194,65,12,.22)' },
    denied:   { background: '#f2f1ec', color: C.mute, border: '1px solid #e0ded7' },
  };
  return {
    fontSize: 11, fontWeight: 800, letterSpacing: '.04em', padding: '5px 11px',
    borderRadius: 100, whiteSpace: 'nowrap', flex: '0 0 auto', ...(map[kind] || map.denied),
  };
}

export const avatarBgFor = (id) => {
  const palettes = [
    'linear-gradient(135deg,#6f8f5c,#3f5a2f)',
    'linear-gradient(135deg,#5b7fa8,#33526f)',
    'linear-gradient(135deg,#e9a23b,#d6622f)',
    'linear-gradient(135deg,#8f6f9c,#5a3f6f)',
  ];
  let h = 0;
  for (const ch of String(id || '')) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return palettes[h % palettes.length];
};
