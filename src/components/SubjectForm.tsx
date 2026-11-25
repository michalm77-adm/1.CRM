'use client';
import { useActionState, useRef, useState } from 'react';
import Link from 'next/link';
import { saveSubject } from '@/app/(app)/subjekty/actions';

type Opt = { id: number; label: string };
export type SubjectInit = {
  id?: number; kind?: string; name?: string; ico?: string | null; dic?: string | null;
  isClient?: boolean; isCustomer?: boolean; isSupplier?: boolean;
  statusId?: number | null; categoryId?: number | null; ownerId?: number | null;
  email?: string | null; phone?: string | null; web?: string | null;
  street?: string | null; city?: string | null; zip?: string | null; country?: string | null; note?: string | null;
};

export function SubjectForm({ init = {}, statuses, categories, users, customFields }: {
  init?: SubjectInit; statuses: Opt[]; categories: Opt[]; users: Opt[]; customFields: React.ReactNode;
}) {
  const [state, action] = useActionState(saveSubject, undefined);
  const [aresMsg, setAresMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function loadAres() {
    const f = formRef.current!;
    const ico = (f.elements.namedItem('ico') as HTMLInputElement).value.replace(/\s/g, '');
    setAresMsg(null);
    if (!/^\d{8}$/.test(ico)) { setAresMsg('Zadejte IČO (8 číslic).'); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/ares?ico=${ico}`);
      const d = await r.json();
      if (!r.ok) { setAresMsg(d.error ?? 'Načtení se nepovedlo.'); return; }
      for (const k of ['name', 'dic', 'street', 'city', 'zip'] as const) {
        const el = f.elements.namedItem(k) as HTMLInputElement | null;
        if (el && d[k]) el.value = d[k];
      }
      setAresMsg('Údaje z ARES doplněny.');
    } catch {
      setAresMsg('ARES je teď nedostupný.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} action={action} className="form">
      {init.id && <input type="hidden" name="id" value={init.id} />}
      {state?.error && <div className="error">{state.error}</div>}
      <div className="card form">
        <div className="actions">
          <div className="segmented">
            <label><input type="radio" name="kind" value="FIRMA" defaultChecked={init.kind !== 'OSOBA'} />Firma</label>
            <label><input type="radio" name="kind" value="OSOBA" defaultChecked={init.kind === 'OSOBA'} />Fyzická osoba</label>
          </div>
        </div>
        <label className="field"><span>Název / jméno *</span><input name="name" defaultValue={init.name ?? ''} required /></label>
        <div className="grid3">
          <label className="field"><span>IČO</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input name="ico" defaultValue={init.ico ?? ''} inputMode="numeric" />
              <button type="button" className="btn small" onClick={loadAres} disabled={loading}>{loading ? '…' : 'ARES'}</button>
            </div>
          </label>
          <label className="field"><span>DIČ</span><input name="dic" defaultValue={init.dic ?? ''} /></label>
          <label className="field"><span>Vlastník</span>
            <select name="ownerId" defaultValue={init.ownerId ?? ''}>
              <option value="">– já –</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </label>
        </div>
        {aresMsg && <div className="notice">{aresMsg}</div>}
        <div className="actions" style={{ gap: 20 }}>
          <label className="check"><input type="checkbox" name="isClient" defaultChecked={init.isClient} /> Klient (servis, revize)</label>
          <label className="check"><input type="checkbox" name="isCustomer" defaultChecked={init.isCustomer} /> Zákazník (produkty, záruky)</label>
          <label className="check"><input type="checkbox" name="isSupplier" defaultChecked={init.isSupplier} /> Dodavatel</label>
        </div>
        <div className="grid2">
          <label className="field"><span>Stav</span>
            <select name="statusId" defaultValue={init.statusId ?? ''}>
              <option value="">–</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Kategorie</span>
            <select name="categoryId" defaultValue={init.categoryId ?? ''}>
              <option value="">–</option>
              {categories.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="card form">
        <h3>Kontakt a adresa</h3>
        <div className="grid3">
          <label className="field"><span>E-mail</span><input name="email" type="email" defaultValue={init.email ?? ''} /></label>
          <label className="field"><span>Telefon</span><input name="phone" defaultValue={init.phone ?? ''} /></label>
          <label className="field"><span>Web</span><input name="web" defaultValue={init.web ?? ''} /></label>
        </div>
        <div className="grid3">
          <label className="field"><span>Ulice a číslo</span><input name="street" defaultValue={init.street ?? ''} /></label>
          <label className="field"><span>Obec</span><input name="city" defaultValue={init.city ?? ''} /></label>
          <label className="field"><span>PSČ</span><input name="zip" defaultValue={init.zip ?? ''} /></label>
        </div>
        <label className="field"><span>Poznámka</span><textarea name="note" rows={3} defaultValue={init.note ?? ''} /></label>
      </div>

      {customFields}

      <div className="actions">
        <button type="submit" className="btn primary">Uložit</button>
        <Link className="btn" href={init.id ? `/subjekty/${init.id}` : '/subjekty'}>Zrušit</Link>
      </div>
    </form>
  );
}
