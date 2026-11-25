import { LoginShell } from '@/components/LoginShell';
import { LoginForm } from './LoginForm';
import { loginMode } from '@/lib/login-mode';

export const metadata = { title: 'Přihlášení' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ zmeneno?: string; vyprselo?: string }> }) {
  const sp = await searchParams;
  const notice = sp.zmeneno ? 'Heslo je změněné, přihlaste se novým heslem.' : sp.vyprselo ? 'Ověření vypršelo, přihlaste se znovu.' : undefined;
  return (
    <LoginShell title="Přihlášení">
      <LoginForm notice={notice} passwordless={loginMode() === 'bez-hesla'} />
    </LoginShell>
  );
}
