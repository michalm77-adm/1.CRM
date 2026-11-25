# CRM 2M elektro

Vlastní CRM pro 2M elektro: adresář klientů a zákazníků, kontaktní osoby, místa instalace,
produkty, aktivity a vlastní pole. Vzhled odpovídá webu 2melektro.eu (tmavý i světlý motiv).

Návrh celého systému (lead → obchodní případ → soutěž → nabídka → faktura, servis a záruky)
je v dokumentu „Návrh vlastního CRM“. Tato verze je **1. etapa: základ**.

## Co umí 1. etapa

- **Přihlášení a role:** administrátor (vše včetně nastavení), obchodník (správa dat), technik (čtení a aktivity).
- **Klienti a zákazníci:** firma nebo fyzická osoba, role klient / zákazník / dodavatel (lze kombinovat),
  stav, kategorie, načtení údajů z ARES podle IČO, kontaktní osoby, místa a objekty.
- **Aktivity:** úkoly, schůzky, telefonáty, e-maily, poznámky s termínem a řešitelem; nástěnka s úkoly na 7 dní a těmi po termínu.
- **Produkty:** cena, DPH, záruční doba a interval revize (připraveno pro servisní modul).
- **Nastavení bez programování:** vlastní pole (text, číslo, datum, výběr, ano/ne…) ke klientům,
  osobám, produktům i aktivitám; vlastní stavy a kategorie klientů.
- **Uživatelé:** zakládání, role, vypnutí účtu, změna hesla.

## Nejrychlejší spuštění ve Windows

1. Nainstalujte **Node.js LTS** z https://nodejs.org (stačí jednou).
2. Rozbalte ZIP do libovolné složky a dvakrát klikněte na **`spustit.bat`**.
3. Při prvním spuštění se otevře soubor `.env` v Poznámkovém bloku: změňte hesla, uložte a zavřete.
4. Po instalaci (první spuštění trvá několik minut) se sám otevře prohlížeč na http://localhost:3000.

Okno příkazového řádku nechte otevřené, dokud CRM používáte. Na macOS / Linuxu je obdoba `spustit.sh`.

## Spuštění ručně (Windows, macOS, Linux)

Potřebujete **Node.js 20 nebo novější** (https://nodejs.org, verze LTS) a Git.

```bash
git clone https://github.com/michalm77-adm/1.crm.git
cd 1.crm
npm install
```

Zkopírujte `.env.example` na `.env` (ve Windows: `copy .env.example .env`) a v souboru `.env`
**změňte hesla** `ADMIN_PASSWORD` a `TEST_USER_PASSWORD` a nastavte vlastní `SESSION_SECRET`.

Pak vytvořte databázi a výchozí účty:

```bash
npm run setup
```

Spuštění:

```bash
npm run dev
```

Otevřete http://localhost:3000 a přihlaste se e-mailem `ADMIN_EMAIL` a heslem `ADMIN_PASSWORD` z `.env`.
Testovací účty jsou `test01@2melektro.eu` až `test10@2melektro.eu` s heslem `TEST_USER_PASSWORD`
(01–04 a 09 obchodníci, 05–08 a 10 technici).

Rychlejší běh (bez vývojového režimu): `npm run build` a potom `npm start`.

## Data

Databáze je soubor `prisma/crm.db` (SQLite). Zálohujete ho prostým zkopírováním, když aplikace neběží.
Při nasazení na server lze přejít na PostgreSQL změnou `provider` v `prisma/schema.prisma`.

## Technologie

Next.js 15 (React 19, TypeScript), Prisma 6, SQLite. Bez dalších služeb, ARES se volá přímo z aplikace.

## Další etapy

2. Obchod: leady, obchodní případy s nástěnkou, soutěže, nabídky s PDF.
3. Faktury z finální nabídky (přímo v CRM).
4. Servis: zařízení u zákazníků, záruky, revize, upozornění.
5. Přehledy, vlastní pohledy, import z Raynetu.
