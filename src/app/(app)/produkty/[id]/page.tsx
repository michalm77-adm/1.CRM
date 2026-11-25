import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireEditor } from '@/lib/auth';
import { asValues, getFields } from '@/lib/custom-fields';
import { ProductForm } from '@/components/ProductForm';
import { CustomFieldInputs } from '@/components/CustomFieldInputs';
import { ConfirmButton } from '@/components/SubmitButton';
import { deleteProduct } from '../actions';

export const metadata = { title: 'Upravit produkt' };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await db.product.findUnique({ where: { id } }) : null;
  if (!p) notFound();
  const fields = await getFields('product');
  return (
    <>
      <div className="topbar">
        <div><div className="eyebrow">Obchod</div><h1>{p.name}</h1></div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton className="btn danger" message="Smazat produkt? Pokud ho jen nechcete nabízet, stačí odškrtnout Aktivní.">Smazat</ConfirmButton>
        </form>
      </div>
      <ProductForm init={p} customFields={<CustomFieldInputs fields={fields} values={asValues(p.custom)} />} />
    </>
  );
}
