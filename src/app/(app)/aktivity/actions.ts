'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getFields, parseCustom } from '@/lib/custom-fields';
import { ACTIVITY_TYPES, fromLocalInput, int, str } from '@/lib/format';

function back(fd: FormData) {
  const r = str(fd, 'returnTo');
  return r && r.startsWith('/') && !r.startsWith('//') ? r : '/aktivity';
}

export async function saveActivity(fd: FormData) {
  const user = await requireUser();
  const title = str(fd, 'title');
  const returnTo = back(fd);
  if (!title) redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}chyba=${encodeURIComponent('Vyplňte název aktivity.')}`);
  const { values, error } = parseCustom(await getFields('activity'), fd);
  if (error) redirect(`${returnTo}${returnTo.includes('?') ? '&' : '?'}chyba=${encodeURIComponent(error)}`);
  const type = str(fd, 'type') ?? 'UKOL';
  const done = type !== 'UKOL' && type !== 'SCHUZKA';
  await db.activity.create({
    data: {
      type: type in ACTIVITY_TYPES ? type : 'UKOL',
      title: title!,
      description: str(fd, 'description'),
      dueAt: fromLocalInput(str(fd, 'dueAt')),
      subjectId: int(fd, 'subjectId'),
      contactId: int(fd, 'contactId'),
      assigneeId: int(fd, 'assigneeId') ?? user.id,
      createdById: user.id,
      done,
      doneAt: done ? new Date() : null,
      custom: values,
    },
  });
  revalidatePath('/', 'layout');
  redirect(returnTo);
}

export async function toggleActivity(fd: FormData) {
  await requireUser();
  const id = int(fd, 'id');
  if (!id) return;
  const a = await db.activity.findUnique({ where: { id } });
  if (!a) return;
  await db.activity.update({ where: { id }, data: { done: !a.done, doneAt: a.done ? null : new Date() } });
  revalidatePath('/', 'layout');
}

export async function deleteActivity(fd: FormData) {
  const user = await requireUser();
  const id = int(fd, 'id');
  if (!id) return;
  const a = await db.activity.findUnique({ where: { id } });
  // Technik smí mazat jen své vlastní záznamy
  if (!a || (user.role === 'TECHNIK' && a.createdById !== user.id)) return;
  await db.activity.delete({ where: { id } });
  revalidatePath('/', 'layout');
}
