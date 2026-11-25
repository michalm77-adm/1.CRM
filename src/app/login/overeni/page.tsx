import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LocalMailHint, LoginShell } from '@/components/LoginShell';
import { PENDING_COOKIE, verifyPending } from '@/lib/session-token';
import { VerifyForm } from './VerifyForm';

export const metadata = { title: 'Ověření přihlášení' };

export default async function VerifyPage() {
  const p = await verifyPending((await cookies()).get(PENDING_COOKIE)?.value);
  if (!p || p.purpose !== 'LOGIN') redirect('/login?vyprselo=1');
  return (
    <LoginShell title="Ověření přihlášení">
      <p className="muted" style={{ marginTop: 0 }}>Na váš e-mail jsme poslali 6místný kód. Platí 10 minut.</p>
      <VerifyForm />
      <div style={{ marginTop: 16 }}><LocalMailHint /></div>
    </LoginShell>
  );
}
