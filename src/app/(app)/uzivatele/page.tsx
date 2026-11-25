import { db } from '@/lib/db';
import { requireAdmin, ROLE_LABELS } from '@/lib/auth';
import { SubmitButton } from '@/components/SubmitButton';
import { addUser, updateUser } from './actions';

export const metadata = { title: 'Uživatelé' };

export default async function Users({ searchParams }: { searchParams: Promise<{ chyba?: string }> }) {
  await requireAdmin();
  const { chyba } = await searchParams;
  const users = await db.user.findMany({ orderBy: [{ active: 'desc' }, { name: 'asc' }] });
  const roleSelect = (v: string) => (
    <select name="role" defaultValue={v} aria-label="Role">
      {Object.entries(ROLE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
    </select>
  );
  return (
    <>
      <div className="eyebrow">Administrace</div>
      <h1>Uživatelé</h1>
      <p className="muted">Administrátor smí vše včetně nastavení. Obchodník spravuje data. Technik data čte a zapisuje aktivity.</p>
      {chyba && <div className="error" style={{ marginBottom: 16 }}>{chyba}</div>}
      <div className="table-wrap" style={{ marginBottom: 20 }}>
        <table>
          <thead><tr><th>E-mail</th><th>Jméno · Přihlašovací jméno · Role · Nové heslo · Aktivní</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ color: 'var(--text-strong)', fontWeight: 600, whiteSpace: 'nowrap' }}>{u.email}</td>
                <td>
                  <form action={updateUser} style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 1fr 1fr auto auto', gap: 8, alignItems: 'center' }}>
                    <input type="hidden" name="id" value={u.id} />
                    <input name="name" defaultValue={u.name} aria-label="Jméno" />
                    <input name="username" defaultValue={u.username ?? ''} placeholder="(jen e-mail)" aria-label="Přihlašovací jméno" />
                    {roleSelect(u.role)}
                    <input name="password" type="password" placeholder="ponechat" autoComplete="new-password" aria-label="Nové heslo" />
                    <label className="check"><input type="checkbox" name="active" defaultChecked={u.active} /> Aktivní</label>
                    <button className="btn small" type="submit">Uložit</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Nový uživatel</h2>
        <form action={addUser} className="form">
          <div className="grid2">
            <label className="field"><span>Jméno *</span><input name="name" required /></label>
            <label className="field"><span>E-mail *</span><input name="email" type="email" required /></label>
            <label className="field"><span>Heslo * (min. 8 znaků)</span><input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
            <label className="field"><span>Role</span>{roleSelect('OBCHODNIK')}</label>
          </div>
          <div><SubmitButton>Přidat uživatele</SubmitButton></div>
        </form>
      </div>
    </>
  );
}
