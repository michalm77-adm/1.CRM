import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getFields } from '@/lib/custom-fields';
import { ACTIVITY_TYPES } from '@/lib/format';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityList } from '@/components/ActivityList';
import { CustomFieldInputs } from '@/components/CustomFieldInputs';

export const metadata = { title: 'Aktivity' };

export default async function Activities({ searchParams }: { searchParams: Promise<{ stav?: string; kdo?: string; typ?: string; chyba?: string }> }) {
  const user = await requireUser();
  const { stav = 'otevrene', kdo = 'moje', typ = '', chyba } = await searchParams;
  const where: Prisma.ActivityWhereInput = {};
  if (stav === 'otevrene') where.done = false;
  if (stav === 'hotove') where.done = true;
  if (kdo === 'moje') where.assigneeId = user.id;
  if (typ) where.type = typ;

  const [items, subjects, users, fields] = await Promise.all([
    db.activity.findMany({
      where, include: { subject: true, assignee: true },
      orderBy: stav === 'hotove' ? [{ doneAt: 'desc' }, { createdAt: 'desc' }] : [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      take: 300,
    }),
    db.subject.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.user.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    getFields('activity'),
  ]);
  const qs = new URLSearchParams({ stav, kdo, ...(typ ? { typ } : {}) }).toString();

  return (
    <>
      <div className="topbar">
        <div><div className="eyebrow">Plán práce</div><h1>Aktivity</h1></div>
      </div>
      {chyba && <div className="error" style={{ marginBottom: 16 }}>{chyba}</div>}
      <div className="cols">
        <div>
          <form className="filters">
            <select name="stav" defaultValue={stav}>
              <option value="otevrene">Otevřené</option>
              <option value="hotove">Hotové</option>
              <option value="vse">Všechny</option>
            </select>
            <select name="kdo" defaultValue={kdo}>
              <option value="moje">Moje</option>
              <option value="vsichni">Všech uživatelů</option>
            </select>
            <select name="typ" defaultValue={typ}>
              <option value="">Všechny typy</option>
              {Object.entries(ACTIVITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button className="btn" type="submit">Filtrovat</button>
          </form>
          <ActivityList items={items} empty="Žádné aktivity pro zvolený filtr." />
        </div>
        <div className="card">
          <h2>Nová aktivita</h2>
          <ActivityForm
            returnTo={`/aktivity?${qs}`}
            subjects={subjects.map((s) => ({ id: s.id, label: s.name }))}
            users={users.map((u) => ({ id: u.id, label: u.name }))}
            customFields={<CustomFieldInputs fields={fields} />}
          />
        </div>
      </div>
    </>
  );
}
