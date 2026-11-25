import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { db } from './db';
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from './session-token';

export type Role = 'ADMIN' | 'OBCHODNIK' | 'TECHNIK';

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrátor',
  OBCHODNIK: 'Obchodník',
  TECHNIK: 'Technik',
};

export async function startSession(uid: number, role: string) {
  const token = await signSession({ uid, role });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === '1', // zapnout na serveru s HTTPS
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Přihlášený uživatel (aktivní), jinak přesměrování na přihlášení. */
export const requireUser = cache(async () => {
  const s = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!s) redirect('/login');
  const user = await db.user.findUnique({ where: { id: s.uid } });
  if (!user || !user.active) redirect('/login');
  return user;
});

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== 'ADMIN') redirect('/?chyba=opravneni');
  return u;
}

/** Technik smí jen číst a zapisovat aktivity. */
export async function requireEditor() {
  const u = await requireUser();
  if (u.role === 'TECHNIK') redirect('/?chyba=opravneni');
  return u;
}

export function canEdit(role: string) {
  return role === 'ADMIN' || role === 'OBCHODNIK';
}
