import { avatarBgFor } from './ui';
import { initials } from '../lib/comp';

export default function Avatar({ id, name, email, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: avatarBgFor(id || email),
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.36, flex: '0 0 auto',
    }}>
      {initials(name, email)}
    </div>
  );
}
