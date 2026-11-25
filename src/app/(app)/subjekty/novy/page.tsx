import { requireEditor } from '@/lib/auth';
import { getFields } from '@/lib/custom-fields';
import { subjectFormOptions } from '@/lib/options';
import { SubjectForm } from '@/components/SubjectForm';
import { CustomFieldInputs } from '@/components/CustomFieldInputs';

export const metadata = { title: 'Nový subjekt' };

export default async function NewSubject() {
  await requireEditor();
  const [opts, fields] = await Promise.all([subjectFormOptions(), getFields('subject')]);
  return (
    <>
      <div className="eyebrow">Adresář</div>
      <h1>Nový klient / zákazník</h1>
      <SubjectForm {...opts} init={{ isClient: true }} customFields={<CustomFieldInputs fields={fields} />} />
    </>
  );
}
