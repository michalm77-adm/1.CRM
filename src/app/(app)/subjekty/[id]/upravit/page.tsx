import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireEditor } from '@/lib/auth';
import { asValues, getFields } from '@/lib/custom-fields';
import { subjectFormOptions } from '@/lib/options';
import { SubjectForm } from '@/components/SubjectForm';
import { CustomFieldInputs } from '@/components/CustomFieldInputs';

export const metadata = { title: 'Upravit subjekt' };

export default async function EditSubject({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const id = Number((await params).id);
  const s = Number.isInteger(id) ? await db.subject.findUnique({ where: { id } }) : null;
  if (!s) notFound();
  const [opts, fields] = await Promise.all([subjectFormOptions(), getFields('subject')]);
  return (
    <>
      <div className="eyebrow">Adresář</div>
      <h1>Upravit: {s.name}</h1>
      <SubjectForm {...opts} init={s} customFields={<CustomFieldInputs fields={fields} values={asValues(s.custom)} />} />
    </>
  );
}
