import type { CustomField } from '@prisma/client';
import { optionsOf, type CfValues } from '@/lib/custom-fields';

export function CustomFieldInputs({ fields, values }: { fields: CustomField[]; values?: CfValues }) {
  if (fields.length === 0) return null;
  return (
    <fieldset className="fieldset">
      <legend>Vlastní pole</legend>
      <div className="grid2">
        {fields.map((f) => {
          const v = values?.[f.key];
          const name = `cf_${f.key}`;
          if (f.type === 'checkbox') {
            return (
              <label key={f.id} className="check">
                <input type="checkbox" name={name} defaultChecked={v === true} /> {f.label}
              </label>
            );
          }
          return (
            <label key={f.id} className={f.type === 'textarea' ? 'field span2' : 'field'}>
              <span>{f.label}{f.required ? ' *' : ''}</span>
              {f.type === 'textarea' ? (
                <textarea name={name} defaultValue={(v as string) ?? ''} rows={3} required={f.required} />
              ) : f.type === 'select' ? (
                <select name={name} defaultValue={(v as string) ?? ''} required={f.required}>
                  <option value="">– vyberte –</option>
                  {optionsOf(f).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  name={name}
                  type={f.type === 'number' ? 'text' : f.type === 'date' ? 'date' : 'text'}
                  inputMode={f.type === 'number' ? 'decimal' : undefined}
                  defaultValue={v === null || v === undefined ? '' : String(v)}
                  required={f.required}
                />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CustomFieldList({ fields, values }: { fields: CustomField[]; values: CfValues }) {
  if (fields.length === 0) return null;
  return (
    <>
      {fields.map((f) => (
        <div key={f.id} className="kv">
          <dt>{f.label}</dt>
          <dd>{displayValueClient(f, values[f.key])}</dd>
        </div>
      ))}
    </>
  );
}

function displayValueClient(f: CustomField, v: unknown) {
  if (v === null || v === undefined || v === '') return '—';
  if (f.type === 'checkbox') return v ? 'Ano' : 'Ne';
  if (f.type === 'date' && typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('cs-CZ');
  }
  if (typeof v === 'number') return v.toLocaleString('cs-CZ');
  return String(v);
}
