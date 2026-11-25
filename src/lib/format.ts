export const ACTIVITY_TYPES: Record<string, string> = {
  UKOL: 'Úkol',
  SCHUZKA: 'Schůzka',
  TELEFONAT: 'Telefonát',
  EMAIL: 'E-mail',
  POZNAMKA: 'Poznámka',
};

export function fmtDate(d: Date | null | undefined, withTime = false) {
  if (!d) return '';
  return new Intl.DateTimeFormat('cs-CZ', withTime
    ? { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' }
    : { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Europe/Prague' }).format(d);
}

export function fmtMoney(n: number | null | undefined) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 2 }).format(n ?? 0);
}

/** Hodnota pro <input type="datetime-local"> v pražském čase */
export function toLocalInput(d: Date | null | undefined) {
  if (!d) return '';
  const p = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Prague', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
  return p.replace(' ', 'T');
}

/** Převod z <input type="datetime-local"> (pražský čas) na Date */
export function fromLocalInput(v: string | null): Date | null {
  if (!v) return null;
  const naive = new Date(v + ':00Z');
  if (isNaN(naive.getTime())) return null;
  // posun podle pražského offsetu v daný okamžik
  const asPrague = new Date(naive.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
  const asUtc = new Date(naive.toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(naive.getTime() - (asPrague.getTime() - asUtc.getTime()));
}

export function str(fd: FormData, k: string): string | null {
  const v = fd.get(k);
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t === '' ? null : t;
}

export function num(fd: FormData, k: string): number | null {
  const v = str(fd, k);
  if (v === null) return null;
  const n = Number(v.replace(',', '.').replace(/\s/g, ''));
  return isFinite(n) ? n : null;
}

export function int(fd: FormData, k: string): number | null {
  const n = num(fd, k);
  return n === null ? null : Math.round(n);
}
