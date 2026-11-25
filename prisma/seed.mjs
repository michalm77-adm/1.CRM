// Naplní databázi výchozími daty: admin, 10 testovacích uživatelů, číselníky.
// Spouští se opakovaně bezpečně (existující záznamy nepřepisuje).
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'node:fs';

// Jednoduché načtení .env (bez další závislosti)
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@2melektro.eu';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'ZmenHeslo-Test1';

const roles = ['OBCHODNIK', 'OBCHODNIK', 'OBCHODNIK', 'OBCHODNIK', 'TECHNIK', 'TECHNIK', 'TECHNIK', 'TECHNIK', 'OBCHODNIK', 'TECHNIK'];

const codeLists = {
  subject_status: [
    ['Potenciální', '#93a4bb'],
    ['Aktivní', '#3ccf8e'],
    ['Neaktivní', '#ff6b6b'],
  ],
  subject_category: [
    ['A – klíčový', '#fab60a'],
    ['B – běžný', '#5aa9ff'],
    ['C – občasný', '#93a4bb'],
  ],
};

async function main() {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const taken = await prisma.user.findUnique({ where: { username: 'admin' } });
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: taken ? {} : { username: 'admin' },
    create: { email: ADMIN_EMAIL, username: taken ? null : 'admin', name: 'Administrátor', role: 'ADMIN', passwordHash: adminHash },
  });

  const testHash = await bcrypt.hash(TEST_PASSWORD, 10);
  for (let i = 1; i <= 10; i++) {
    const n = String(i).padStart(2, '0');
    await prisma.user.upsert({
      where: { email: `test${n}@2melektro.eu` },
      update: {},
      create: { email: `test${n}@2melektro.eu`, name: `Testovací uživatel ${n}`, role: roles[i - 1], passwordHash: testHash },
    });
  }

  for (const [list, items] of Object.entries(codeLists)) {
    const count = await prisma.codeItem.count({ where: { list } });
    if (count > 0) continue;
    await prisma.codeItem.createMany({
      data: items.map(([label, color], i) => ({ list, label, color, sort: i })),
    });
  }

  console.log('Hotovo. Admin: jméno "admin" nebo', ADMIN_EMAIL, '| testovací účty: test01–test10@2melektro.eu');
}

main().finally(() => prisma.$disconnect());
