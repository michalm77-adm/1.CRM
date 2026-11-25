import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { canEdit, requireUser } from '@/lib/auth';
import { CodeBadge, RoleBadges } from '@/components/Badges';

export const metadata = { title: 'Klienti a zákazníci' };

export default async function Subjects({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; stav?: string }> }) {
  const user = await requireUser();
  const { q = '', role = '', stav = '' } = await searchParams;
  const where: Prisma.SubjectWhereInput = {};
  if (q) where.OR = [{ name: { contains: q } }, { ico: { contains: q } }, { city: { contains: q } }, { email: { contains: q } }];
  if (role === 'klient') where.isClient = true;
  if (role === 'zakaznik') where.isCustomer = true;
  if (role === 'dodavatel') where.isSupplier = true;
  if (stav) where.statusId = Number(stav);

  const [subjects, statuses] = await Promise.all([
    db.subject.findMany({ where, include: { status: true, category: true, owner: true }, orderBy: { name: 'asc' }, take: 500 }),
    db.codeItem.findMany({ where: { list: 'subject_status' }, orderBy: { sort: 'asc' } }),
  ]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Adresář</div>
          <h1>Klienti a zákazníci</h1>
        </div>
        {canEdit(user.role) && <Link className="btn primary" href="/subjekty/novy">+ Nový subjekt</Link>}
      </div>
      <form className="filters">
        <input name="q" defaultValue={q} placeholder="Hledat název, IČO, obec, e-mail…" />
        <select name="role" defaultValue={role}>
          <option value="">Všechny role</option>
          <option value="klient">Klienti</option>
          <option value="zakaznik">Zákazníci</option>
          <option value="dodavatel">Dodavatelé</option>
        </select>
        <select name="stav" defaultValue={stav}>
          <option value="">Všechny stavy</option>
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button className="btn" type="submit">Filtrovat</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Název</th><th>Role</th><th>Stav</th><th>Kategorie</th><th>IČO</th><th>Obec</th><th>Vlastník</th></tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id}>
                <td><Link className="row-link" href={`/subjekty/${s.id}`}>{s.name}</Link></td>
                <td><RoleBadges s={s} /></td>
                <td><CodeBadge item={s.status} /></td>
                <td><CodeBadge item={s.category} /></td>
                <td>{s.ico}</td>
                <td>{s.city}</td>
                <td className="muted">{s.owner?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {subjects.length === 0 && <div className="empty">Nic nenalezeno.{canEdit(user.role) && <> <Link className="accent" href="/subjekty/novy">Přidat první subjekt</Link></>}</div>}
      </div>
    </>
  );
}
