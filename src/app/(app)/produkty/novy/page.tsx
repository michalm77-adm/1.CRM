import { requireEditor } from '@/lib/auth';
import { getFields } from '@/lib/custom-fields';
import { ProductForm } from '@/components/ProductForm';
import { CustomFieldInputs } from '@/components/CustomFieldInputs';

export const metadata = { title: 'Nový produkt' };

export default async function NewProduct() {
  await requireEditor();
  const fields = await getFields('product');
  return (
    <>
      <div className="eyebrow">Obchod</div>
      <h1>Nový produkt</h1>
      <ProductForm customFields={<CustomFieldInputs fields={fields} />} />
    </>
  );
}
