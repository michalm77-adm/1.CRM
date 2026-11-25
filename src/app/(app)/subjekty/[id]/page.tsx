import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { canEdit, requireUser } from '@/lib/auth';
import { asValues, getFields } from '@/lib/custom-fields';
import { fmtDate } from '@/lib/format';
import { CodeBadge, RoleBadges } from '@/components/Badges';
import { CustomFieldInputs, CustomFieldList } from '@/components/CustomFieldInputs';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityList } from '@/components/ActivityList';
import { ConfirmButton, SubmitButton } from '@/components/SubmitButton';
import { deleteContact, deleteSite, deleteSubject, saveContact, saveSite } from '../actions';

export default async function SubjectDetail({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ chyba?: string }>;
}) {
  const user = await requireUser();
  const id = Number((await params).id);
  const { chyba } = await searchParams;
  const s = Number.isInteger(id)
    ? await db.subject.findUnique({
        where: { id },
        include: {
          status: true, category: true, owner: true,
          contacts: { orderBy: { lastName: 'asc' } },
          sites: { orderBy: { name: 'asc' } },
          activities: { include: { assignee: true }, orderBy: [{ done: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }] },
        },
      })
    : null;
  if (!s) notFound();
  const [subjectFields, contactFields, activityFields, users] = await Promise.all([
    getFields('subject'), getFields('contact'), getFields('activity'),
    db.user.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ]);
  const editor = canEdit(user.role);
  const address = [s.street, [s.zip, s.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">{s.kind === 'OSOBA' ? 'Fyzická osoba' : 'Firma'}</div>
          <h1>{s.name}</h1>
          <div className="badges" style={{ marginTop: 8 }}>
            <RoleBadges s={s} /><CodeBadge item={s.status} /><CodeBadge item={s.category} />
          </div>
        </div>
        {editor && (
          <div className="actions">
            <Link className="btn primary" href={`/subjekty/${s.id}/upravit`}>Upravit</Link>
            <form action={deleteSubject}>
              <input type="hidden" name="id" value={s.id} />
              <ConfirmButton className="btn danger" message={`Smazat „${s.name}“ včetně kontaktů, míst a aktivit? Nejde to vrátit.`}>Smazat</ConfirmButton>
            </form>
          </div>
        )}
      </div>
      {chyba && <div className="error" style={{ marginBottom: 16 }}>{chyba}</div>}

      <div className="cols">
        <div className="stack">
          <div className="card">
            <h2>Aktivity</h2>
            <ActivityList items={s.activities} showSubject={false} empty="Zatím žádné aktivity." />
            <details className="add" style={{ marginTop: 16 }}>
              <summary>+ Přidat aktivitu</summary>
              <ActivityForm
                returnTo={`/subjekty/${s.id}`}
                subjectId={s.id}
                contacts={s.contacts.map((c) => ({ id: c.id, label: [c.firstName, c.lastName].filter(Boolean).join(' ') }))}
                users={users.map((u) => ({ id: u.id, label: u.name }))}
                customFields={<CustomFieldInputs fields={activityFields} />}
              />
            </details>
          </div>

          <div className="card">
            <h2>Kontaktní osoby</h2>
            {s.contacts.length === 0 && <div className="muted">Zatím žádné kontaktní osoby.</div>}
            <div className="list">
              {s.contacts.map((c) => (
                <div key={c.id} className="item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div className="t">{[c.firstName, c.lastName].filter(Boolean).join(' ')}{c.position && <span className="muted" style={{ fontWeight: 400 }}> · {c.position}</span>}</div>
                      <div style={{ fontSize: 14, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {c.email && <a href={`mailto:${c.email}`} className="accent">{c.email}</a>}
                        {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>}
                      </div>
                      {contactFields.length > 0 && <dl className="kvs" style={{ marginTop: 8 }}><CustomFieldList fields={contactFields} values={asValues(c.custom)} /></dl>}
                      {c.note && <div className="muted" style={{ fontSize: 14 }}>{c.note}</div>}
                    </div>
                    {editor && (
                      <form action={deleteContact}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton className="btn link" message="Smazat kontaktní osobu?">Smazat</ConfirmButton>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {editor && (
              <details className="add" style={{ marginTop: 16 }}>
                <summary>+ Přidat kontaktní osobu</summary>
                <form action={saveContact} className="form">
                  <input type="hidden" name="subjectId" value={s.id} />
                  <div className="grid2">
                    <label className="field"><span>Jméno</span><input name="firstName" /></label>
                    <label className="field"><span>Příjmení *</span><input name="lastName" required /></label>
                    <label className="field"><span>Funkce</span><input name="position" /></label>
                    <label className="field"><span>Telefon</span><input name="phone" /></label>
                    <label className="field span2"><span>E-mail</span><input name="email" type="email" /></label>
                  </div>
                  <CustomFieldInputs fields={contactFields} />
                  <div><SubmitButton>Přidat osobu</SubmitButton></div>
                </form>
              </details>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h2>Údaje</h2>
            <dl className="kvs">
              <div className="kv"><dt>IČO</dt><dd>{s.ico ?? '—'}</dd></div>
              <div className="kv"><dt>DIČ</dt><dd>{s.dic ?? '—'}</dd></div>
              <div className="kv"><dt>E-mail</dt><dd>{s.email ? <a className="accent" href={`mailto:${s.email}`}>{s.email}</a> : '—'}</dd></div>
              <div className="kv"><dt>Telefon</dt><dd>{s.phone ?? '—'}</dd></div>
              <div className="kv"><dt>Web</dt><dd>{s.web ? <a className="accent" href={s.web.startsWith('http') ? s.web : `https://${s.web}`} target="_blank" rel="noreferrer">{s.web}</a> : '—'}</dd></div>
              <div className="kv"><dt>Adresa</dt><dd>{address || '—'}</dd></div>
              <div className="kv"><dt>Vlastník</dt><dd>{s.owner?.name ?? '—'}</dd></div>
              <CustomFieldList fields={subjectFields} values={asValues(s.custom)} />
              <div className="kv"><dt>Založeno</dt><dd>{fmtDate(s.createdAt)}</dd></div>
            </dl>
            {s.note && <p style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{s.note}</p>}
          </div>

          <div className="card">
            <h2>Místa a objekty</h2>
            <p className="muted" style={{ marginTop: -6, fontSize: 14 }}>Budovy a provozovny, kde se instaluje a reviduje.</p>
            {s.sites.length === 0 && <div className="muted">Zatím žádná místa.</div>}
            <div className="list">
              {s.sites.map((m) => (
                <div key={m.id} className="item" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div className="t">{m.name}</div>
                    <div className="muted" style={{ fontSize: 14 }}>{[m.street, [m.zip, m.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</div>
                    {m.note && <div style={{ fontSize: 14 }}>{m.note}</div>}
                  </div>
                  {editor && (
                    <form action={deleteSite}>
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton className="btn link" message="Smazat místo?">Smazat</ConfirmButton>
                    </form>
                  )}
                </div>
              ))}
            </div>
            {editor && (
              <details className="add" style={{ marginTop: 16 }}>
                <summary>+ Přidat místo</summary>
                <form action={saveSite} className="form">
                  <input type="hidden" name="subjectId" value={s.id} />
                  <label className="field"><span>Název *</span><input name="name" required placeholder="např. Hala 2, RD Novákovi" /></label>
                  <label className="field"><span>Ulice a číslo</span><input name="street" /></label>
                  <div className="grid2">
                    <label className="field"><span>Obec</span><input name="city" /></label>
                    <label className="field"><span>PSČ</span><input name="zip" /></label>
                  </div>
                  <label className="field"><span>Poznámka</span><input name="note" /></label>
                  <div><SubmitButton>Přidat místo</SubmitButton></div>
                </form>
              </details>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
