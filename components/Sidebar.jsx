'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '../lib/supabase/browser';
import Avatar from './Avatar';
import { C } from './ui';

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
  accounts: <><path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" /><path d="M14 4v5h5" /><path d="M8 13h7" /><path d="M8 16.5h5" /></>,
  claim: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v2.5H9z" /><path d="M8.5 12.5l2.2 2.2 4.8-4.8" /></>,
  requests: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 14h5l1.2 2h5.6L21 14" /></>,
  people: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><path d="M16 11.2a3 3 0 1 0 0-6" /><path d="M18 20c0-2.6-1-4.4-2.6-5.2" /></>,
};

export default function Sidebar({ profile, pendingCount, myRequestCount }) {
  const path = usePathname();
  const router = useRouter();
  const isAdmin = profile.role === 'admin';

  const links = isAdmin
    ? [
        { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
        { href: '/admin/queue', label: 'Approval Queue', icon: 'requests', badge: pendingCount },
        { href: '/admin/accounts', label: 'Chart of Accounts', icon: 'accounts' },
        { href: '/admin/people', label: 'People', icon: 'people' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { href: '/accounts', label: 'My Accounts', icon: 'accounts' },
        { href: '/claim', label: 'Claim an Account', icon: 'claim' },
        { href: '/requests', label: 'My Requests', icon: 'requests', badge: myRequestCount },
      ];

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside data-side style={{
      width: 252, flex: '0 0 252px', background: C.sidebar, display: 'flex',
      flexDirection: 'column', padding: '18px 14px 16px', gap: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 6px 14px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.sage, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10L12 4l8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" />
          </svg>
        </div>
        <div data-navlabel>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '-.01em' }}>Merit Roofing</div>
          <div style={{ color: 'rgba(255,255,255,.42)', fontSize: 11, fontWeight: 600 }}>Variable Comp</div>
        </div>
      </div>

      <div data-navlabel style={{ color: 'rgba(255,255,255,.34)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', padding: '6px 10px 4px' }}>
        {isAdmin ? 'ADMIN' : 'WORKSPACE'}
      </div>

      <div data-navgroup>
        {links.map((l) => {
          const active = path === l.href || path.startsWith(l.href + '/');
          return (
            <Link key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 11px',
              borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
              background: active ? 'rgba(255,255,255,.12)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,.62)',
            }}>
              <span style={{ width: 17, height: 17, flex: '0 0 auto' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ICONS[l.icon]}</svg>
              </span>
              <span>{l.label}</span>
              {!!l.badge && (
                <span style={{ marginLeft: 'auto', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 100, background: C.sage, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l.badge}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 11, borderRadius: 11, background: 'rgba(255,255,255,.05)' }}>
        <Avatar id={profile.id} name={profile.full_name} email={profile.email} />
        <div data-navlabel style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.full_name || profile.email}</div>
          <div style={{ color: 'rgba(255,255,255,.42)', fontSize: 11 }}>{isAdmin ? 'Owner · Admin' : profile.job_title || 'Employee'}</div>
        </div>
        <button onClick={signOut} title="Sign out" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
