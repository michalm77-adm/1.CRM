'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import type { Product } from '@prisma/client';
import { saveProduct } from '@/app/(app)/produkty/actions';

export function ProductForm({ init, customFields }: { init?: Product; customFields: React.ReactNode }) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  return (
    <form action={action} className="form">
      {init && <input type="hidden" name="id" value={init.id} />}
      {state?.error && <div className="error">{state.error}</div>}
      <div className="card form">
        <div className="grid3">
          <label className="field span2"><span>Název *</span><input name="name" defaultValue={init?.name ?? ''} required /></label>
          <label className="field"><span>Kód</span><input name="code" defaultValue={init?.code ?? ''} /></label>
        </div>
        <div className="grid3">
          <label className="field"><span>Cena bez DPH (Kč)</span><input name="price" inputMode="decimal" defaultValue={init?.price ?? ''} /></label>
          <label className="field"><span>Sazba DPH (%)</span><input name="vatRate" inputMode="decimal" defaultValue={init?.vatRate ?? 21} /></label>
          <label className="field"><span>Jednotka</span><input name="unit" defaultValue={init?.unit ?? 'ks'} /></label>
        </div>
        <div className="grid2">
          <label className="field"><span>Záruční doba (měsíce)</span><input name="warrantyMonths" inputMode="numeric" defaultValue={init?.warrantyMonths ?? ''} placeholder="např. 24" /></label>
          <label className="field"><span>Interval revize (měsíce)</span><input name="revisionIntervalMonths" inputMode="numeric" defaultValue={init?.revisionIntervalMonths ?? ''} placeholder="např. 12" /></label>
        </div>
        <label className="field"><span>Poznámka</span><textarea name="note" rows={3} defaultValue={init?.note ?? ''} /></label>
        <label className="check"><input type="checkbox" name="active" defaultChecked={init?.active ?? true} /> Aktivní (nabízí se v nabídkách)</label>
      </div>
      {customFields}
      <div className="actions">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? 'Ukládám…' : 'Uložit'}</button>
        <Link className="btn" href="/produkty">Zrušit</Link>
      </div>
    </form>
  );
}
