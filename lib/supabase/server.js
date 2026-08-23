import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return store.get(name)?.value; },
        set(name, value, options) { try { store.set({ name, value, ...options }); } catch {} },
        remove(name, options) { try { store.set({ name, value: '', ...options }); } catch {} },
      },
    }
  );
}

/** Service-role client. Server only — never import this into a client component. */
export function supabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function requireUser() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  return profile ? { user, profile, supabase } : null;
}
