import Link from 'next/link';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'Kontaktní osoby' };

export default async function Contacts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { q = '' } = await searchParams;
  const contacts = await db.contact.findMany({
    where: q ? { OR: [{ lastName: { contains: q } }, { firstName: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { subject: { name: { contains: q } } }] } : {},
    include: { subject: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 500,
  });
  return (
    <>
      <div className="topbar">
        <div><div className="eyebrow">Adresář</div><h1>Kontaktní osoby</h1></div>
      </div>
      <form className="filters">
        <input name="q" defaultValue={q} placeholder="Hledat jméno, e-mail, telefon, firmu…" />
        <button className="btn" type="submit">Hledat</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Jméno</th><th>Funkce</th><th>Firma</th><th>E-mail</th><th>Telefon</th></tr></thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{[c.firstName, c.lastName].filter(Boolean).join(' ')}</td>
                <td>{c.position}</td>
                <td><Link className="row-link" href={`/subjekty/${c.subjectId}`}>{c.subject.name}</Link></td>
                <td>{c.email && <a className="accent" href={`mailto:${c.email}`}>{c.email}</a>}</td>
                <td>{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {contacts.length === 0 && <div className="empty">Žádné kontaktní osoby. Přidávají se v detailu klienta.</div>}
      </div>
    </>
  );
}
