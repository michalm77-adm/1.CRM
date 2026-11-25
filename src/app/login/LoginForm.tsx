'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { login } from './actions';

export function LoginForm({ notice, passwordless }: { notice?: string; passwordless?: boolean }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="form">
      {state?.error ? <div className="error">{state.error}</div> : notice && <div className="notice">{notice}</div>}
      <label className="field"><span>Uživatelské jméno nebo e-mail</span><input name="email" type="text" autoCapitalize="none" autoComplete="username" required autoFocus={!state?.email} defaultValue={state?.email} key={state?.email} /></label>
      {passwordless ? (
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>Přihlášení bez hesla je zapnuté (LOGIN_MODE v souboru .env).</p>
      ) : (
        <label className="field"><span>Heslo</span><input name="password" type="password" autoComplete="current-password" required autoFocus={!!state?.email} /></label>
      )}
      <button className="btn primary" type="submit" disabled={pending} style={{ justifyContent: 'center' }}>
        {pending ? 'Přihlašuji…' : 'Přihlásit se'}
      </button>
      {!passwordless && <Link href="/login/zapomenute" className="accent" style={{ fontSize: 14, textAlign: 'center' }}>Zapomenuté heslo</Link>}
    </form>
  );
}
