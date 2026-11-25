import { LoginShell } from '@/components/LoginShell';
import { ForgotForm } from './ForgotForm';

export const metadata = { title: 'Zapomenuté heslo' };

export default function ForgotPage() {
  return (
    <LoginShell title="Zapomenuté heslo">
      <p className="muted" style={{ marginTop: 0 }}>Pošleme vám kód, kterým si nastavíte nové heslo.</p>
      <ForgotForm />
    </LoginShell>
  );
}
