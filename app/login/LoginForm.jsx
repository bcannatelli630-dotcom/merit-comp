'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '../../lib/supabase/browser';
import { C, cardLg, btnPrimary, input, label } from '../../components/ui';

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    const supabase = supabaseBrowser();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErr(error.message);
      else { router.push('/dashboard'); router.refresh(); }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) setErr(error.message);
      else setMsg('Check your email for a link to set a new password.');
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} style={{ ...cardLg, width: 392, padding: '30px 30px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: C.sage, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10L12 4l8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: '-.01em' }}>Merit Roofing</div>
          <div style={{ color: C.faint, fontSize: 11.5, fontWeight: 600 }}>Variable Compensation</div>
        </div>
      </div>

      <div style={label}>EMAIL</div>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@meritroofing.com" style={input} />

      {mode === 'signin' && (
        <>
          <div style={{ ...label, marginTop: 16 }}>PASSWORD</div>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" style={input} />
        </>
      )}

      {err && <div style={{ color: C.danger, fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{err}</div>}
      {msg && <div style={{ color: C.sageDeep, fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{msg}</div>}

      <button type="submit" disabled={busy} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', marginTop: 18, opacity: busy ? 0.6 : 1 }}>
        {busy ? 'Working…' : mode === 'signin' ? 'Log in' : 'Send reset link'}
      </button>

      <button type="button" onClick={() => { setMode(mode === 'signin' ? 'reset' : 'signin'); setErr(''); setMsg(''); }}
        style={{ background: 'none', border: 'none', color: C.mute, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginTop: 14, padding: 0, display: 'block' }}>
        {mode === 'signin' ? 'Forgot your password?' : 'Back to log in'}
      </button>
    </form>
  );
}
