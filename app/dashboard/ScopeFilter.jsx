'use client';
import { useRouter } from 'next/navigation';

export default function ScopeFilter({ people, value }) {
  const router = useRouter();
  const opts = [{ id: 'all', full_name: 'Everyone' }, ...people.filter((p) => p.role !== 'admin')];

  const style = (on) => ({
    padding: '6px 13px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 12.5, fontWeight: 700,
    background: on ? '#fff' : 'transparent',
    color: on ? '#1b1d29' : '#6b6f7d',
    boxShadow: on ? '0 1px 2px rgba(20,20,40,.08)' : 'none',
  });

  return (
    <div style={{ display: 'flex', gap: 4, background: '#eceae5', borderRadius: 10, padding: 4, flexWrap: 'wrap' }}>
      {opts.map((p) => (
        <button key={p.id} style={style(value === p.id)} onClick={() => router.push('/dashboard?person=' + p.id)}>
          {(p.full_name || 'Unnamed').split(' ')[0]}
        </button>
      ))}
    </div>
  );
}
