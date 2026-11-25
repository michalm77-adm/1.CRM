import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { smtpConfigured } from '@/lib/mail';
import { fmtDate } from '@/lib/format';

export const metadata = { title: 'Odeslané e-maily' };

const STATUS: Record<string, [string, string]> = {
  LOCAL: ['Jen v CRM', 'badge'],
  SENT: ['Odesláno', 'badge y'],
  FAILED: ['Chyba', 'badge'],
};

export default async function Outbox() {
  await requireAdmin();
  const mails = await db.emailMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <>
      <div className="eyebrow">Administrace</div>
      <h1>Odeslané e-maily</h1>
      <p className="muted">
        {smtpConfigured()
          ? `E-maily se posílají přes SMTP server ${process.env.SMTP_HOST}. Tady je jejich kopie.`
          : 'SMTP není nastavené, e-maily proto zůstávají jen tady v místní schránce. Skutečné odesílání zapnete v souboru .env (SMTP_HOST).'}
      </p>
      {mails.length === 0 && <div className="card muted">Zatím žádné e-maily.</div>}
      <div className="list">
        {mails.map((m) => {
          const [label, cls] = STATUS[m.status] ?? [m.status, 'badge'];
          return (
            <details key={m.id} className="item">
              <summary style={{ cursor: 'pointer', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="t" style={{ flex: '1 1 240px' }}>{m.subject}</span>
                <span className="muted" style={{ fontSize: 14 }}>{m.to}</span>
                <span className={cls} style={m.status === 'FAILED' ? { color: 'var(--danger)' } : undefined}>{label}</span>
                <span className="muted" style={{ fontSize: 13 }}>{fmtDate(m.createdAt, true)}</span>
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: '12px 0 0' }}>{m.body}</pre>
              {m.error && <div className="error" style={{ marginTop: 8 }}>{m.error}</div>}
            </details>
          );
        })}
      </div>
    </>
  );
}
