'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { resendLoginCode, verifyLogin } from '../actions';

export function VerifyForm() {
  const [state, action, pending] = useActionState(verifyLogin, undefined);
  const [resent, resend, resending] = useActionState(resendLoginCode, undefined);
  // Zobrazí se výsledek té akce, která proběhla naposledy
  const last = (resent?.at ?? 0) > (state?.at ?? 0) ? resent : state;
  return (
    <div className="form">
      <form action={action} className="form">
        {last?.error ? <div className="error">{last.error}</div> : last?.info && <div className="notice">{last.info}</div>}
        <label className="field"><span>Kód z e-mailu</span>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus
            style={{ fontSize: 24, letterSpacing: '.3em', textAlign: 'center' }} />
        </label>
        <button className="btn primary" type="submit" disabled={pending} style={{ justifyContent: 'center' }}>
          {pending ? 'Ověřuji…' : 'Ověřit a přihlásit'}
        </button>
      </form>
      <form action={resend} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <button type="submit" className="btn link" disabled={resending}>{resending ? 'Posílám…' : 'Poslat nový kód'}</button>
        <Link href="/login" className="muted">Zpět</Link>
      </form>
    </div>
  );
}
