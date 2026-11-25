// Podepsaný token relace (JWT) – použitelný i v middleware (edge runtime).
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'crm_session';
export const SESSION_DAYS = 14;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET musí mít alespoň 32 znaků');
    return new TextEncoder().encode('vyvojovy-tajny-klic-jen-pro-lokalni-beh-0000');
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = { uid: number; role: string };

export async function signSession(p: SessionPayload) {
  return new SignJWT({ ...p, typ: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.typ !== 'session' || typeof payload.uid !== 'number' || typeof payload.role !== 'string') return null;
    return { uid: payload.uid, role: payload.role };
  } catch {
    return null;
  }
}

/** Krátkodobý token mezi zadáním hesla a ověřením kódu (nebo při obnově hesla). */
export const PENDING_COOKIE = 'crm_pending';
export type PendingPayload = { purpose: 'LOGIN' | 'RESET'; uid?: number; email?: string };

export async function signPending(p: PendingPayload) {
  return new SignJWT({ ...p, typ: 'pending' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret());
}

export async function verifyPending(token: string | undefined): Promise<PendingPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.typ !== 'pending' || (payload.purpose !== 'LOGIN' && payload.purpose !== 'RESET')) return null;
    return {
      purpose: payload.purpose,
      uid: typeof payload.uid === 'number' ? payload.uid : undefined,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    };
  } catch {
    return null;
  }
}
