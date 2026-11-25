import Link from 'next/link';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginMode } from '@/lib/login-mode';
import { requireUser } from '@/lib/auth';
import { ActivityList } from '@/components/ActivityList';
import { RoleBadges } from '@/components/Badges';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ chyba?: string }> }) {
  const user = await requireUser();
  const { chyba } = await searchParams;
  const defaultPassword = loginMode() !== 'bez-hesla' && user.username === 'admin' && (await bcrypt.compare('admin', user.passwordHash));
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const [clients, customers, products, open, overdue, myTasks, recent] = await Promise.all([
    db.subject.count({ where: { isClient: true } }),
    db.subject.count({ where: { isCustomer: true } }),
    db.product.count({ where: { active: true } }),
    db.activity.count({ where: { done: false, assigneeId: user.id } }),
    db.activity.count({ where: { done: false, assigneeId: user.id, dueAt: { lt: new Date() } } }),
    db.activity.findMany({
      where: { done: false, assigneeId: user.id, OR: [{ dueAt: null }, { dueAt: { lte: new Date(endOfToday.getTime() + 7 * 864e5) } }] },
      include: { subject: true }, orderBy: [{ dueAt: 'asc' }], take: 10,
    }),
    db.subject.findMany({ orderBy: { updatedAt: 'desc' }, take: 8 }),
  ]);

  return (
    <>
      <div className="eyebrow">Nástěnka</div>
      <h1>Dobrý den, {user.name.split(' ')[0]}</h1>
      {defaultPassword && (
        <div className="notice" style={{ margin: '12px 0' }}>
          Účet admin má výchozí heslo „admin“. Pro běh jen na vašem počítači to stačí, před zpřístupněním dalším lidem ho změňte v sekci <Link className="accent" href="/uzivatele">Uživatelé</Link>.
        </div>
      )}
      {chyba === 'opravneni' && <div className="error" style={{ margin: '12px 0' }}>Na tuto akci nemáte oprávnění.</div>}
      <div className="cards" style={{ marginTop: 20 }}>
        <Link href="/aktivity" className="card stat"><div className="n">{open}</div><div className="l">Moje otevřené aktivity</div></Link>
        <Link href="/aktivity" className="card stat"><div className="n" style={overdue ? { color: 'var(--danger)' } : undefined}>{overdue}</div><div className="l">Po termínu</div></Link>
        <Link href="/subjekty?role=klient" className="card stat"><div className="n">{clients}</div><div className="l">Klientů (servis, revize)</div></Link>
        <Link href="/subjekty?role=zakaznik" className="card stat"><div className="n">{customers}</div><div className="l">Zákazníků</div></Link>
        <Link href="/produkty" className="card stat"><div className="n">{products}</div><div className="l">Aktivních produktů</div></Link>
      </div>
      <div className="cols">
        <div className="card">
          <h2>Moje úkoly na 7 dní</h2>
          <ActivityList items={myTasks} empty="Nic naplánovaného. Dobrá práce." />
        </div>
        <div className="card">
          <h2>Naposledy upravené</h2>
          {recent.length === 0 && <div className="muted">Zatím žádní klienti. <Link className="accent" href="/subjekty/novy">Přidat prvního</Link></div>}
          <div className="list">
            {recent.map((s) => (
              <Link key={s.id} href={`/subjekty/${s.id}`} className="item" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="t">{s.name}</div>
                <div style={{ marginTop: 4 }}><RoleBadges s={s} /></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
