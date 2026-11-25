import Link from 'next/link';
import type { Activity, Subject, User } from '@prisma/client';
import { ACTIVITY_TYPES, fmtDate } from '@/lib/format';
import { deleteActivity, toggleActivity } from '@/app/(app)/aktivity/actions';
import { ConfirmButton } from './SubmitButton';

type A = Activity & { subject?: Subject | null; assignee?: User | null };

export function ActivityList({ items, showSubject = true, empty = 'Žádné aktivity.' }: { items: A[]; showSubject?: boolean; empty?: string }) {
  if (items.length === 0) return <div className="muted">{empty}</div>;
  const now = Date.now();
  return (
    <div className="list">
      {items.map((a) => {
        const overdue = !a.done && a.dueAt && a.dueAt.getTime() < now;
        return (
          <div key={a.id} className={`item${a.done ? ' done' : ''}`}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <form action={toggleActivity}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" title={a.done ? 'Označit jako nehotové' : 'Označit jako hotové'} aria-label="Přepnout hotovo"
                  style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--accent)', background: a.done ? 'var(--accent)' : 'transparent', cursor: 'pointer', marginTop: 2, color: 'var(--accent-ink)', fontWeight: 700, lineHeight: 1, padding: 0 }}>
                  {a.done ? '✓' : ''}
                </button>
              </form>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t">{a.title}</div>
                <div className="muted" style={{ fontSize: 13, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="badge">{ACTIVITY_TYPES[a.type] ?? a.type}</span>
                  {a.dueAt && <span style={overdue ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{fmtDate(a.dueAt, true)}</span>}
                  {showSubject && a.subject && <Link href={`/subjekty/${a.subject.id}`} className="accent">{a.subject.name}</Link>}
                  {a.assignee && <span>{a.assignee.name}</span>}
                </div>
                {a.description && <div style={{ fontSize: 14, marginTop: 6, whiteSpace: 'pre-wrap' }}>{a.description}</div>}
              </div>
              <form action={deleteActivity}>
                <input type="hidden" name="id" value={a.id} />
                <ConfirmButton message="Smazat aktivitu?" className="btn link">Smazat</ConfirmButton>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
