'use server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { endSession, startSession } from '@/lib/auth';
import { checkCode, issueCode } from '@/lib/auth-codes';
import { sendMail } from '@/lib/mail';
import { loginMode } from '@/lib/login-mode';
import { PENDING_COOKIE, signPending, verifyPending, type PendingPayload } from '@/lib/session-token';

type State = { error?: string; info?: string; email?: string; at?: number } | undefined;


async function setPending(p: PendingPayload) {
  (await cookies()).set(PENDING_COOKIE, await signPending(p), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 15 * 60, secure: process.env.COOKIE_SECURE === '1' });
}

async function getPending() {
  return verifyPending((await cookies()).get(PENDING_COOKIE)?.value);
}

async function sendLoginCode(user: { id: number; email: string; name: string }) {
  const c = await issueCode(user.id, 'LOGIN');
  if (!c) return false;
  await sendMail(user.email, `Přihlašovací kód: ${c.code}`,
    `Dobrý den, ${user.name},\n\nváš kód pro přihlášení do CRM 2M elektro je:\n\n    ${c.code}\n\nKód platí ${c.ttlMin} minut. Pokud jste se nepřihlašovali, změňte si heslo.\n`);
  return true;
}

export async function login(_prev: State, fd: FormData): Promise<State> {
  // Přihlašovací jméno nebo e-mail
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const user = email
    ? await db.user.findFirst({ where: email.includes('@') ? { email } : { username: email } })
    : null;
  const mode = loginMode();
  if (mode === 'bez-hesla') {
    if (!user || !user.active) return { error: 'Uživatel s tímto jménem nebo e-mailem neexistuje.', email };
    await startSession(user.id, user.role);
    redirect('/');
  }
  const ok = user && user.active && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return { error: 'Nesprávné jméno, e-mail nebo heslo.', email };
  if (mode === 'heslo') {
    await startSession(user.id, user.role);
    redirect('/');
  }
  if (!(await sendLoginCode(user))) return { error: 'Příliš mnoho kódů za krátkou dobu. Zkuste to za 15 minut.', email };
  await setPending({ purpose: 'LOGIN', uid: user.id });
  redirect('/login/overeni');
}

export async function verifyLogin(_prev: State, fd: FormData): Promise<State> {
  const p = await getPending();
  if (!p || p.purpose !== 'LOGIN' || !p.uid) redirect('/login?vyprselo=1');
  const code = String(fd.get('code') ?? '');
  const user = await db.user.findUnique({ where: { id: p.uid } });
  if (!user || !user.active) redirect('/login');
  if (!(await checkCode(user.id, 'LOGIN', code))) return { error: 'Kód nesouhlasí nebo vypršel.', at: Date.now() };
  (await cookies()).delete(PENDING_COOKIE);
  await startSession(user.id, user.role);
  redirect('/');
}

export async function resendLoginCode(_prev: State): Promise<State> {
  const p = await getPending();
  if (!p || p.purpose !== 'LOGIN' || !p.uid) redirect('/login?vyprselo=1');
  const user = await db.user.findUnique({ where: { id: p.uid } });
  if (!user || !user.active) redirect('/login');
  if (!(await sendLoginCode(user))) return { error: 'Příliš mnoho kódů za krátkou dobu. Zkuste to za 15 minut.', at: Date.now() };
  return { info: 'Poslal jsem nový kód.', at: Date.now() };
}

export async function requestReset(_prev: State, fd: FormData): Promise<State> {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  if (!email) return { error: 'Zadejte e-mail.' };
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.active) {
    const c = await issueCode(user.id, 'RESET');
    if (c) {
      await sendMail(user.email, `Obnova hesla: ${c.code}`,
        `Dobrý den, ${user.name},\n\nkód pro nastavení nového hesla do CRM 2M elektro je:\n\n    ${c.code}\n\nKód platí ${c.ttlMin} minut. Pokud jste o změnu nežádali, zprávu ignorujte.\n`);
    }
  }
  // Stejná odpověď, ať účet existuje nebo ne
  await setPending({ purpose: 'RESET', email });
  redirect('/login/obnova');
}

export async function resetPassword(_prev: State, fd: FormData): Promise<State> {
  const p = await getPending();
  if (!p || p.purpose !== 'RESET' || !p.email) redirect('/login/zapomenute');
  const password = String(fd.get('password') ?? '');
  if (password.length < 8) return { error: 'Heslo musí mít alespoň 8 znaků.' };
  if (password !== String(fd.get('password2') ?? '')) return { error: 'Hesla se neshodují.' };
  const user = await db.user.findUnique({ where: { email: p.email } });
  if (!user || !user.active || !(await checkCode(user.id, 'RESET', String(fd.get('code') ?? '')))) {
    return { error: 'Kód nesouhlasí nebo vypršel.' };
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  (await cookies()).delete(PENDING_COOKIE);
  redirect('/login?zmeneno=1');
}

export async function logout() {
  await endSession();
  redirect('/login');
}
