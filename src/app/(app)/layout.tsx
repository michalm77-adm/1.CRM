import Link from 'next/link';
import { requireUser, ROLE_LABELS } from '@/lib/auth';
import { Nav } from '@/components/Nav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { logout } from '../login/actions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = [
    { href: '/', label: 'Nástěnka' },
    { href: '/subjekty', label: 'Klienti a zákazníci' },
    { href: '/kontakty', label: 'Kontaktní osoby' },
    { href: '/aktivity', label: 'Aktivity' },
    { href: '/produkty', label: 'Produkty' },
    ...(user.role === 'ADMIN'
      ? [{ sep: true as const }, { href: '/nastaveni', label: 'Nastavení' }, { href: '/uzivatele', label: 'Uživatelé' }, { href: '/posta', label: 'Odeslané e-maily' }]
      : []),
  ];
  return (
    <div className="app">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <img src="/logo.svg" alt="" />
          <span><b>2M elektro</b><small>CRM</small></span>
        </Link>
        <Nav items={items} />
        <div className="me">
          <div style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{user.name}</div>
          <div className="muted" style={{ fontSize: 13 }}>{ROLE_LABELS[user.role] ?? user.role}</div>
          <ThemeToggle />
          <form action={logout} style={{ marginTop: 10 }}>
            <button className="btn link" type="submit">Odhlásit se</button>
          </form>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
