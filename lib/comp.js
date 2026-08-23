export const COMP_TYPES = [
  { value: 'contract',      label: '% of Contract Value' },
  { value: 'target_margin', label: '% of Target Margin' },
  { value: 'margin_growth', label: '% of Margin Growth (House Account)' },
];

export function compTypeLabel(t) {
  const m = COMP_TYPES.find((c) => c.value === t);
  return m ? m.label : '—';
}

export function computeAmount(e) {
  const rate = Number(e.rate) || 0;
  let base = 0;
  if (e.comp_type === 'contract') base = Number(e.contract_value) || 0;
  else if (e.comp_type === 'target_margin') base = Number(e.margin_value) || 0;
  else base = Math.max(0, (Number(e.margin_value) || 0) - (Number(e.margin_baseline) || 0));
  return Math.round(base * rate) / 100;
}

export function formulaLabel(e) {
  const r = Number(e.rate) || 0;
  if (e.comp_type === 'contract') return `${fmt(e.contract_value)} contract × ${r}%`;
  if (e.comp_type === 'target_margin') return `${fmt(e.margin_value)} target margin × ${r}%`;
  const g = Math.max(0, (Number(e.margin_value) || 0) - (Number(e.margin_baseline) || 0));
  return `${fmt(g)} margin growth × ${r}%`;
}

export function fmt(n) {
  return '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
}

export function periodOptions(centerYear) {
  const y = centerYear || new Date().getFullYear();
  const out = [];
  for (const year of [y - 1, y, y + 1]) for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) out.push(`${q} ${year}`);
  return out;
}

export function currentPeriod(d) {
  const now = d || new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

export function yearOf(period) { return Number(String(period).split(' ')[1]) || 0; }
export function quarterOf(period) { return String(period).split(' ')[0]; }

export function initials(name, email) {
  const src = (name || '').trim() || (email || '?');
  return src.split(/[\s@.]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}
