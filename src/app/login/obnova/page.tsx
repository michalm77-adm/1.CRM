import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LocalMailHint, LoginShell } from '@/components/LoginShell';
import { PENDING_COOKIE, verifyPending } from '@/lib/session-token';
import { ResetForm } from './ResetForm';

export const metadata = { title: 'Nové heslo' };

export default async function ResetPage() {
  const p = await verifyPending((await cookies()).get(PENDING_COOKIE)?.value);
  if (!p || p.purpose !== 'RESET') redirect('/login/zapomenute');
  return (
    <LoginShell title="Nové heslo">
      <p className="muted" style={{ marginTop: 0 }}>Pokud účet s tímto e-mailem existuje, poslali jsme na něj kód. Platí 10 minut.</p>
      <ResetForm />
      <div style={{ marginTop: 16 }}><LocalMailHint /></div>
    </LoginShell>
  );
}
