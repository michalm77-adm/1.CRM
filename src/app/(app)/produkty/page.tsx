import Link from 'next/link';
import { db } from '@/lib/db';
import { canEdit, requireUser } from '@/lib/auth';
import { fmtMoney } from '@/lib/format';

export const metadata = { title: 'Produkty' };

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = '' } = await searchParams;
  const products = await db.product.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { code: { contains: q } }] } : {},
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
  });
  const editor = canEdit(user.role);
  return (
    <>
      <div className="topbar">
        <div><div className="eyebrow">Obchod</div><h1>Produkty</h1></div>
        {editor && <Link className="btn primary" href="/produkty/novy">+ Nový produkt</Link>}
      </div>
      <form className="filters">
        <input name="q" defaultValue={q} placeholder="Hledat název nebo kód…" />
        <button className="btn" type="submit">Hledat</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Název</th><th>Kód</th><th className="num">Cena bez DPH</th><th className="num">DPH</th><th className="num">Záruka</th><th className="num">Revize po</th><th>Stav</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{editor ? <Link className="row-link" href={`/produkty/${p.id}`}>{p.name}</Link> : <b>{p.name}</b>}</td>
                <td>{p.code}</td>
                <td className="num">{fmtMoney(p.price)} / {p.unit}</td>
                <td className="num">{p.vatRate} %</td>
                <td className="num">{p.warrantyMonths ? `${p.warrantyMonths} měs.` : '—'}</td>
                <td className="num">{p.revisionIntervalMonths ? `${p.revisionIntervalMonths} měs.` : '—'}</td>
                <td>{p.active ? <span className="badge y">Aktivní</span> : <span className="badge">Neaktivní</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="empty">Zatím žádné produkty.</div>}
      </div>
    </>
  );
}
