'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { requestReset } from '../actions';

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestReset, undefined);
  return (
    <form action={action} className="form">
      {state?.error && <div className="error">{state.error}</div>}
      <label className="field"><span>E-mail účtu</span><input name="email" type="email" autoComplete="username" required autoFocus /></label>
      <button className="btn primary" type="submit" disabled={pending} style={{ justifyContent: 'center' }}>
        {pending ? 'Posílám…' : 'Poslat kód'}
      </button>
      <Link href="/login" className="muted" style={{ fontSize: 14, textAlign: 'center' }}>Zpět na přihlášení</Link>
    </form>
  );
}
