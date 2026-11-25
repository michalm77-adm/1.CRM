'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireEditor } from '@/lib/auth';
import { getFields, parseCustom } from '@/lib/custom-fields';
import { int, num, str } from '@/lib/format';

export async function saveProduct(_prev: { error?: string } | undefined, fd: FormData) {
  await requireEditor();
  const id = int(fd, 'id');
  const name = str(fd, 'name');
  if (!name) return { error: 'Vyplňte název produktu.' };
  const { values, error } = parseCustom(await getFields('product'), fd);
  if (error) return { error };
  const data = {
    code: str(fd, 'code'),
    name,
    unit: str(fd, 'unit') ?? 'ks',
    price: num(fd, 'price') ?? 0,
    vatRate: num(fd, 'vatRate') ?? 21,
    warrantyMonths: int(fd, 'warrantyMonths'),
    revisionIntervalMonths: int(fd, 'revisionIntervalMonths'),
    active: fd.get('active') === 'on',
    note: str(fd, 'note'),
    custom: values,
  };
  if (id) await db.product.update({ where: { id }, data });
  else await db.product.create({ data });
  revalidatePath('/produkty');
  redirect('/produkty');
}

export async function deleteProduct(fd: FormData) {
  await requireEditor();
  const id = int(fd, 'id');
  if (id) await db.product.delete({ where: { id } });
  revalidatePath('/produkty');
  redirect('/produkty');
}
