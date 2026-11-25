'use server';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { int, str } from '@/lib/format';

const ROLES = ['ADMIN', 'OBCHODNIK', 'TECHNIK'];

function fail(msg: string): never {
  redirect(`/uzivatele?chyba=${encodeURIComponent(msg)}`);
}

export async function addUser(fd: FormData) {
  await requireAdmin();
  const email = str(fd, 'email')?.toLowerCase();
  const name = str(fd, 'name');
  const password = str(fd, 'password');
  const role = str(fd, 'role') ?? 'OBCHODNIK';
  if (!email || !name || !password) fail('Vyplňte jméno, e-mail a heslo.');
  if (password.length < 8) fail('Heslo musí mít alespoň 8 znaků.');
  if (!ROLES.includes(role)) fail('Neplatná role.');
  if (await db.user.findUnique({ where: { email } })) fail('Uživatel s tímto e-mailem už existuje.');
  await db.user.create({ data: { email, name, role, passwordHash: await bcrypt.hash(password, 10) } });
  revalidatePath('/uzivatele');
}

export async function updateUser(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, 'id');
  if (!id) return;
  const role = str(fd, 'role') ?? 'OBCHODNIK';
  const active = fd.get('active') === 'on';
  if (!ROLES.includes(role)) fail('Neplatná role.');
  if (id === me.id && (role !== 'ADMIN' || !active)) fail('Sám sobě nemůžete odebrat roli admina ani účet vypnout.');
  const password = str(fd, 'password');
  if (password && password.length < 8) fail('Nové heslo musí mít alespoň 8 znaků.');
  await db.user.update({
    where: { id },
    data: {
      name: str(fd, 'name') ?? undefined,
      role,
      active,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });
  revalidatePath('/uzivatele');
}
