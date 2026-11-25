import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from '@/lib/session-token';

// Načtení údajů o firmě z veřejného registru ARES podle IČO.
export async function GET(req: NextRequest) {
  if (!(await verifySession((await cookies()).get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }
  const ico = (req.nextUrl.searchParams.get('ico') ?? '').replace(/\s/g, '');
  if (!/^\d{8}$/.test(ico)) return NextResponse.json({ error: 'IČO musí mít 8 číslic.' }, { status: 400 });
  try {
    const r = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (r.status === 404) return NextResponse.json({ error: 'Firma s tímto IČO v ARES není.' }, { status: 404 });
    if (!r.ok) return NextResponse.json({ error: `ARES odpověděl chybou ${r.status}.` }, { status: 502 });
    const d = await r.json();
    const s = d.sidlo ?? {};
    const cislo = [s.cisloDomovni, s.cisloOrientacni].filter(Boolean).join('/');
    const street = [s.nazevUlice ?? s.nazevCastiObce, cislo].filter(Boolean).join(' ');
    return NextResponse.json({
      name: d.obchodniJmeno ?? '',
      dic: d.dic ?? '',
      street,
      city: s.nazevObce ?? '',
      zip: s.psc ? String(s.psc) : '',
    });
  } catch {
    return NextResponse.json({ error: 'ARES je teď nedostupný.' }, { status: 502 });
  }
}
