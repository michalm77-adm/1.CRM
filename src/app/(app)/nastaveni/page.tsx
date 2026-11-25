import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { CF_ENTITIES, CF_TYPES, CODE_LISTS } from '@/lib/custom-fields';
import { ConfirmButton, SubmitButton } from '@/components/SubmitButton';
import { addCodeItem, addCustomField, deleteCodeItem, deleteCustomField, updateCodeItem, updateCustomField } from './actions';

export const metadata = { title: 'Nastavení' };

export default async function Settings({ searchParams }: { searchParams: Promise<{ chyba?: string }> }) {
  await requireAdmin();
  const { chyba } = await searchParams;
  const [items, fields] = await Promise.all([
    db.codeItem.findMany({ orderBy: [{ list: 'asc' }, { sort: 'asc' }, { id: 'asc' }] }),
    db.customField.findMany({ orderBy: [{ entity: 'asc' }, { sort: 'asc' }, { id: 'asc' }] }),
  ]);

  return (
    <>
      <div className="eyebrow">Administrace</div>
      <h1>Nastavení</h1>
      <p className="muted">Tady si CRM přizpůsobíte bez programování: vlastní pole se hned objeví ve formulářích a v detailu.</p>
      {chyba && <div className="error" style={{ marginBottom: 16 }}>{chyba}</div>}

      <div className="stack">
        <div className="card">
          <h2>Vlastní pole</h2>
          {fields.length === 0 && <div className="muted" style={{ marginBottom: 12 }}>Zatím žádná vlastní pole.</div>}
          <div className="list" style={{ marginBottom: 16 }}>
            {fields.map((f) => (
              <div key={f.id} className="item">
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  {CF_ENTITIES[f.entity as keyof typeof CF_ENTITIES] ?? f.entity} · {CF_TYPES[f.type] ?? f.type}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <form action={updateCustomField} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', flex: 1 }}>
                    <input type="hidden" name="id" value={f.id} />
                    <label className="field" style={{ flex: '2 1 180px' }}><span>Název</span><input name="label" defaultValue={f.label} /></label>
                    {f.type === 'select' && (
                      <label className="field" style={{ flex: '2 1 180px' }}><span>Možnosti (každá na řádek)</span><textarea name="options" rows={2} defaultValue={f.options ?? ''} /></label>
                    )}
                    <label className="field" style={{ width: 80 }}><span>Pořadí</span><input name="sort" defaultValue={f.sort} inputMode="numeric" /></label>
                    <label className="check" style={{ paddingBottom: 9 }}><input type="checkbox" name="required" defaultChecked={f.required} /> Povinné</label>
                    <label className="check" style={{ paddingBottom: 9 }}><input type="checkbox" name="active" defaultChecked={f.active} /> Aktivní</label>
                    <button className="btn small" type="submit" style={{ marginBottom: 6 }}>Uložit</button>
                  </form>
                  <form action={deleteCustomField}>
                    <input type="hidden" name="id" value={f.id} />
                    <ConfirmButton className="btn link" message={`Smazat pole „${f.label}“? Uložené hodnoty zůstanou v datech, ale přestanou se zobrazovat.`}>Smazat</ConfirmButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <details className="add" open={fields.length === 0}>
            <summary>+ Přidat vlastní pole</summary>
            <form action={addCustomField} className="form">
              <div className="grid3">
                <label className="field"><span>Patří k</span>
                  <select name="entity">{Object.entries(CF_ENTITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                </label>
                <label className="field"><span>Název pole *</span><input name="label" required placeholder="např. Typ objektu" /></label>
                <label className="field"><span>Typ</span>
                  <select name="type">{Object.entries(CF_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                </label>
              </div>
              <label className="field"><span>Možnosti (jen pro výběr, každá na nový řádek)</span><textarea name="options" rows={3} placeholder={'Rodinný dům\nBytový dům\nPrůmysl'} /></label>
              <label className="check"><input type="checkbox" name="required" /> Povinné</label>
              <div><SubmitButton>Přidat pole</SubmitButton></div>
            </form>
          </details>
        </div>

        {Object.entries(CODE_LISTS).map(([list, title]) => (
          <div key={list} className="card">
            <h2>{title}</h2>
            <div className="list" style={{ marginBottom: 12 }}>
              {items.filter((i) => i.list === list).map((i) => (
                <div key={i.id} className="item" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <form action={updateCodeItem} style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                    <input type="hidden" name="id" value={i.id} />
                    <input type="color" name="color" defaultValue={i.color ?? '#93a4bb'} style={{ width: 44, padding: 2, height: 36 }} aria-label="Barva" />
                    <input name="label" defaultValue={i.label} style={{ flex: 1, minWidth: 160 }} aria-label="Název" />
                    <label className="check"><input type="checkbox" name="active" defaultChecked={i.active} /> Aktivní</label>
                    <button className="btn small" type="submit">Uložit</button>
                  </form>
                  <form action={deleteCodeItem}>
                    <input type="hidden" name="id" value={i.id} />
                    <ConfirmButton className="btn link" message={`Smazat „${i.label}“?`}>Smazat</ConfirmButton>
                  </form>
                </div>
              ))}
            </div>
            <form action={addCodeItem} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input type="hidden" name="list" value={list} />
              <input type="color" name="color" defaultValue="#fab60a" style={{ width: 44, padding: 2, height: 40 }} aria-label="Barva" />
              <input name="label" placeholder="Nová položka" required style={{ flex: 1, minWidth: 160 }} />
              <SubmitButton className="btn">Přidat</SubmitButton>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
