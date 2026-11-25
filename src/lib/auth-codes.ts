import 'server-only';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { db } from './db';

const TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const MAX_PER_WINDOW = 5; // kódů za 15 minut na uživatele

function hash(code: string) {
  return createHmac('sha256', process.env.SESSION_SECRET || 'vyvojovy-tajny-klic').update(code).digest('hex');
}

export type CodePurpose = 'LOGIN' | 'RESET';

/** Vytvoří nový 6místný kód (předchozí nevyužité zneplatní). Vrací null při překročení limitu. */
export async function issueCode(userId: number, purpose: CodePurpose) {
  const recent = await db.authCode.count({
    where: { userId, purpose, createdAt: { gt: new Date(Date.now() - 15 * 60_000) } },
  });
  if (recent >= MAX_PER_WINDOW) return null;
  await db.authCode.updateMany({ where: { userId, purpose, usedAt: null }, data: { usedAt: new Date() } });
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await db.authCode.create({
    data: { userId, purpose, codeHash: hash(code), expiresAt: new Date(Date.now() + TTL_MIN * 60_000) },
  });
  return { code, ttlMin: TTL_MIN };
}

/** Ověří kód. Vrací true/false; po 5 chybných pokusech kód propadne. */
export async function checkCode(userId: number, purpose: CodePurpose, input: string) {
  const c = await db.authCode.findFirst({
    where: { userId, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!c) return false;
  const given = Buffer.from(hash(input.replace(/\s/g, '')));
  const ok = given.length === c.codeHash.length && timingSafeEqual(given, Buffer.from(c.codeHash));
  if (ok) {
    await db.authCode.update({ where: { id: c.id }, data: { usedAt: new Date() } });
    return true;
  }
  const attempts = c.attempts + 1;
  await db.authCode.update({
    where: { id: c.id },
    data: { attempts, ...(attempts >= MAX_ATTEMPTS ? { usedAt: new Date() } : {}) },
  });
  return false;
}
