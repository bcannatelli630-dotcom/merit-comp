'use client';
import { useEffect, useState } from 'react';

export default function Toast({ message }) {
  const [shown, setShown] = useState(!!message);
  useEffect(() => {
    if (!message) return;
    setShown(true);
    const t = setTimeout(() => setShown(false), 4500);
    return () => clearTimeout(t);
  }, [message]);
  if (!message || !shown) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 10, background: '#1b2418', color: '#fff',
      borderRadius: 12, padding: '13px 18px', boxShadow: '0 8px 28px rgba(20,24,16,.3)',
      fontSize: 13.5, fontWeight: 600, maxWidth: 'min(460px,90vw)', zIndex: 200,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8BA47C" strokeWidth="2.2" strokeLinecap="round">
        <path d="M3 6.5l9 6 9-6" /><rect x="3" y="5" width="18" height="14" rx="2" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
