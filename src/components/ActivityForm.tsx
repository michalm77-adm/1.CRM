import { ACTIVITY_TYPES } from '@/lib/format';
import { saveActivity } from '@/app/(app)/aktivity/actions';
import { SubmitButton } from './SubmitButton';

type Opt = { id: number; label: string };

export function ActivityForm({ returnTo, subjectId, subjects, contacts, users, customFields }: {
  returnTo: string; subjectId?: number; subjects?: Opt[]; contacts?: Opt[]; users: Opt[]; customFields?: React.ReactNode;
}) {
  return (
    <form action={saveActivity} className="form">
      <input type="hidden" name="returnTo" value={returnTo} />
      {subjectId && <input type="hidden" name="subjectId" value={subjectId} />}
      <div className="grid3">
        <label className="field"><span>Typ</span>
          <select name="type" defaultValue="UKOL">
            {Object.entries(ACTIVITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="field"><span>Termín</span><input type="datetime-local" name="dueAt" /></label>
        <label className="field"><span>Řešitel</span>
          <select name="assigneeId" defaultValue="">
            <option value="">– já –</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </label>
      </div>
      <label className="field"><span>Název *</span><input name="title" required /></label>
      {subjects && (
        <label className="field"><span>Klient / zákazník</span>
          <select name="subjectId" defaultValue="">
            <option value="">– bez vazby –</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      )}
      {contacts && contacts.length > 0 && (
        <label className="field"><span>Kontaktní osoba</span>
          <select name="contactId" defaultValue="">
            <option value="">–</option>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
      )}
      <label className="field"><span>Popis</span><textarea name="description" rows={3} /></label>
      {customFields}
      <div><SubmitButton>Přidat aktivitu</SubmitButton></div>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>Úkoly a schůzky zůstanou otevřené, telefonáty, e-maily a poznámky se uloží jako hotové.</p>
    </form>
  );
}
