'use client';
import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="login">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <img src="/logo.svg" alt="" width={40} height={40} />
          <div>
            <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 20 }}>2M elektro</div>
            <div className="muted" style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>CRM</div>
          </div>
        </div>
        <h1 style={{ fontSize: 24 }}>Přihlášení</h1>
        <form action={action} className="form">
          {state?.error && <div className="error">{state.error}</div>}
          <label className="field"><span>E-mail</span><input name="email" type="email" autoComplete="username" required autoFocus={!state?.email} defaultValue={state?.email} key={state?.email} /></label>
          <label className="field"><span>Heslo</span><input name="password" type="password" autoComplete="current-password" required autoFocus={!!state?.email} /></label>
          <button className="btn primary" type="submit" disabled={pending} style={{ justifyContent: 'center' }}>
            {pending ? 'Přihlašuji…' : 'Přihlásit se'}
          </button>
        </form>
      </div>
    </div>
  );
}
