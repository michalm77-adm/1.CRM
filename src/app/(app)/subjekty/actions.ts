'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireEditor } from '@/lib/auth';
import { getFields, parseCustom } from '@/lib/custom-fields';
import { int, str } from '@/lib/format';

export type FormState = { error?: string } | undefined;

export async function saveSubject(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireEditor();
  const id = int(fd, 'id');
  const name = str(fd, 'name');
  if (!name) return { error: 'Vyplňte název nebo jméno.' };
  const ico = str(fd, 'ico');
  if (ico && !/^\d{8}$/.test(ico.replace(/\s/g, ''))) return { error: 'IČO musí mít 8 číslic.' };
  const { values, error } = parseCustom(await getFields('subject'), fd);
  if (error) return { error };

  const data = {
    kind: fd.get('kind') === 'OSOBA' ? 'OSOBA' : 'FIRMA',
    name,
    ico: ico?.replace(/\s/g, '') ?? null,
    dic: str(fd, 'dic'),
    isClient: fd.get('isClient') === 'on',
    isCustomer: fd.get('isCustomer') === 'on',
    isSupplier: fd.get('isSupplier') === 'on',
    statusId: int(fd, 'statusId'),
    categoryId: int(fd, 'categoryId'),
    email: str(fd, 'email'),
    phone: str(fd, 'phone'),
    web: str(fd, 'web'),
    street: str(fd, 'street'),
    city: str(fd, 'city'),
    zip: str(fd, 'zip'),
    country: str(fd, 'country') ?? 'CZ',
    note: str(fd, 'note'),
    ownerId: int(fd, 'ownerId') ?? user.id,
    custom: values,
  };
  const saved = id
    ? await db.subject.update({ where: { id }, data })
    : await db.subject.create({ data });
  revalidatePath('/subjekty');
  redirect(`/subjekty/${saved.id}`);
}

export async function deleteSubject(fd: FormData) {
  await requireEditor();
  const id = int(fd, 'id');
  if (id) await db.subject.delete({ where: { id } });
  revalidatePath('/subjekty');
  redirect('/subjekty');
}

export async function saveContact(fd: FormData) {
  await requireEditor();
  const subjectId = int(fd, 'subjectId');
  const lastName = str(fd, 'lastName');
  if (!subjectId || !lastName) return;
  const { values, error } = parseCustom(await getFields('contact'), fd);
  if (error) redirect(`/subjekty/${subjectId}?chyba=${encodeURIComponent(error)}`);
  const id = int(fd, 'id');
  const data = {
    subjectId,
    firstName: str(fd, 'firstName'),
    lastName,
    position: str(fd, 'position'),
    email: str(fd, 'email'),
    phone: str(fd, 'phone'),
    note: str(fd, 'note'),
    custom: values,
  };
  if (id) await db.contact.update({ where: { id }, data });
  else await db.contact.create({ data });
  revalidatePath(`/subjekty/${subjectId}`);
}

export async function deleteContact(fd: FormData) {
  await requireEditor();
  const id = int(fd, 'id');
  const c = id ? await db.contact.delete({ where: { id } }) : null;
  if (c) revalidatePath(`/subjekty/${c.subjectId}`);
}

export async function saveSite(fd: FormData) {
  await requireEditor();
  const subjectId = int(fd, 'subjectId');
  const name = str(fd, 'name');
  if (!subjectId || !name) return;
  await db.site.create({
    data: { subjectId, name, street: str(fd, 'street'), city: str(fd, 'city'), zip: str(fd, 'zip'), note: str(fd, 'note') },
  });
  revalidatePath(`/subjekty/${subjectId}`);
}

export async function deleteSite(fd: FormData) {
  await requireEditor();
  const id = int(fd, 'id');
  const s = id ? await db.site.delete({ where: { id } }) : null;
  if (s) revalidatePath(`/subjekty/${s.subjectId}`);
}
