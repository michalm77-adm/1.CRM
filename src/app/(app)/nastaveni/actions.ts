'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { CF_ENTITIES, CF_TYPES, CODE_LISTS } from '@/lib/custom-fields';
import { int, str } from '@/lib/format';

function fail(msg: string): never {
  redirect(`/nastaveni?chyba=${encodeURIComponent(msg)}`);
}

export async function addCodeItem(fd: FormData) {
  await requireAdmin();
  const list = str(fd, 'list');
  const label = str(fd, 'label');
  if (!list || !(list in CODE_LISTS) || !label) fail('Vyplňte název položky.');
  const max = await db.codeItem.aggregate({ where: { list }, _max: { sort: true } });
  await db.codeItem.create({ data: { list, label, color: str(fd, 'color'), sort: (max._max.sort ?? 0) + 1 } });
  revalidatePath('/', 'layout');
}

export async function updateCodeItem(fd: FormData) {
  await requireAdmin();
  const id = int(fd, 'id');
  const label = str(fd, 'label');
  if (!id || !label) return;
  await db.codeItem.update({ where: { id }, data: { label, color: str(fd, 'color'), active: fd.get('active') === 'on' } });
  revalidatePath('/', 'layout');
}

export async function deleteCodeItem(fd: FormData) {
  await requireAdmin();
  const id = int(fd, 'id');
  if (!id) return;
  const used = await db.subject.count({ where: { OR: [{ statusId: id }, { categoryId: id }] } });
  if (used > 0) fail(`Položku používá ${used} záznamů. Místo smazání ji vypněte (odškrtněte Aktivní).`);
  await db.codeItem.delete({ where: { id } });
  revalidatePath('/', 'layout');
}

function slugify(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'pole';
}

export async function addCustomField(fd: FormData) {
  await requireAdmin();
  const entity = str(fd, 'entity');
  const label = str(fd, 'label');
  const type = str(fd, 'type') ?? 'text';
  if (!entity || !(entity in CF_ENTITIES)) fail('Vyberte, ke kterému záznamu pole patří.');
  if (!label) fail('Vyplňte název pole.');
  if (!(type in CF_TYPES)) fail('Neplatný typ pole.');
  const options = str(fd, 'options');
  if (type === 'select' && !options) fail('U výběru zadejte možnosti, každou na nový řádek.');
  let key = slugify(label);
  for (let i = 2; await db.customField.findUnique({ where: { entity_key: { entity, key } } }); i++) key = `${slugify(label)}_${i}`;
  const max = await db.customField.aggregate({ where: { entity }, _max: { sort: true } });
  await db.customField.create({
    data: { entity, key, label, type, options: type === 'select' ? options : null, required: fd.get('required') === 'on', sort: (max._max.sort ?? 0) + 1 },
  });
  revalidatePath('/', 'layout');
}

export async function updateCustomField(fd: FormData) {
  await requireAdmin();
  const id = int(fd, 'id');
  const label = str(fd, 'label');
  if (!id || !label) return;
  const f = await db.customField.findUnique({ where: { id } });
  if (!f) return;
  await db.customField.update({
    where: { id },
    data: {
      label,
      options: f.type === 'select' ? str(fd, 'options') : null,
      required: fd.get('required') === 'on',
      active: fd.get('active') === 'on',
      sort: int(fd, 'sort') ?? f.sort,
    },
  });
  revalidatePath('/', 'layout');
}

export async function deleteCustomField(fd: FormData) {
  await requireAdmin();
  const id = int(fd, 'id');
  if (id) await db.customField.delete({ where: { id } });
  revalidatePath('/', 'layout');
}
