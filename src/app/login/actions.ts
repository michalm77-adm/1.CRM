'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { endSession, startSession } from '@/lib/auth';

export async function login(_prev: { error?: string; email?: string } | undefined, fd: FormData) {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  const ok = user && user.active && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return { error: 'Nesprávný e-mail nebo heslo.', email };
  await startSession(user.id, user.role);
  redirect('/');
}

export async function logout() {
  await endSession();
  redirect('/login');
}
