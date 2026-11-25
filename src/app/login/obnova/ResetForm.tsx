'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { resetPassword } from '../actions';

export function ResetForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="form">
      {state?.error && <div className="error">{state.error}</div>}
      <label className="field"><span>Kód z e-mailu</span>
        <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required autoFocus style={{ fontSize: 22, letterSpacing: '.3em', textAlign: 'center' }} />
      </label>
      <label className="field"><span>Nové heslo (min. 8 znaků)</span><input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
      <label className="field"><span>Nové heslo znovu</span><input name="password2" type="password" minLength={8} autoComplete="new-password" required /></label>
      <button className="btn primary" type="submit" disabled={pending} style={{ justifyContent: 'center' }}>
        {pending ? 'Ukládám…' : 'Nastavit heslo'}
      </button>
      <Link href="/login" className="muted" style={{ fontSize: 14, textAlign: 'center' }}>Zpět na přihlášení</Link>
    </form>
  );
}
