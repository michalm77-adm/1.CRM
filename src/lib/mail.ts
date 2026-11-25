import 'server-only';
import nodemailer from 'nodemailer';
import { db } from './db';

export function smtpConfigured() {
  return !!process.env.SMTP_HOST;
}

/**
 * Odešle e-mail. Každá zpráva se uloží do místní schránky (tabulka EmailMessage).
 * Když je nastavený SMTP_HOST, pošle se i skutečně přes SMTP.
 */
export async function sendMail(to: string, subject: string, body: string) {
  const msg = await db.emailMessage.create({ data: { to, subject, body, status: 'LOCAL' } });
  if (!smtpConfigured()) {
    console.log(`\n[CRM e-mail] Komu: ${to}\nPředmět: ${subject}\n${body}\n`);
    return msg;
  }
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === '1',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: process.env.MAIL_FROM || 'CRM <crm@localhost>', to, subject, text: body });
    return db.emailMessage.update({ where: { id: msg.id }, data: { status: 'SENT', sentAt: new Date() } });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('[CRM e-mail] Odeslání selhalo:', error);
    console.log(`[CRM e-mail] Neodeslaná zpráva pro ${to}: ${subject}`);
    return db.emailMessage.update({ where: { id: msg.id }, data: { status: 'FAILED', error } });
  }
}
