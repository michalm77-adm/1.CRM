import 'server-only';
import type { CustomField } from '@prisma/client';
import { db } from './db';

export type CfEntity = 'subject' | 'contact' | 'product' | 'activity';
export type CfValues = Record<string, string | number | boolean | null>;

export const CF_ENTITIES: Record<CfEntity, string> = {
  subject: 'Subjekt (klient / zákazník)',
  contact: 'Kontaktní osoba',
  product: 'Produkt',
  activity: 'Aktivita',
};

export const CODE_LISTS: Record<string, string> = {
  subject_status: 'Stavy klientů',
  subject_category: 'Kategorie klientů',
};

export const CF_TYPES: Record<string, string> = {
  text: 'Text',
  textarea: 'Delší text',
  number: 'Číslo',
  date: 'Datum',
  select: 'Výběr z možností',
  checkbox: 'Zaškrtávátko (ano/ne)',
};

export function getFields(entity: CfEntity) {
  return db.customField.findMany({ where: { entity, active: true }, orderBy: [{ sort: 'asc' }, { id: 'asc' }] });
}

export function optionsOf(f: Pick<CustomField, 'options'>) {
  return (f.options ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

/** Přečte hodnoty vlastních polí z formuláře (inputy pojmenované cf_<klíč>). */
export function parseCustom(fields: CustomField[], fd: FormData): { values: CfValues; error?: string } {
  const values: CfValues = {};
  for (const f of fields) {
    const raw = fd.get(`cf_${f.key}`);
    const s = typeof raw === 'string' ? raw.trim() : '';
    let v: string | number | boolean | null = null;
    if (f.type === 'checkbox') v = raw === 'on';
    else if (s === '') v = null;
    else if (f.type === 'number') {
      const n = Number(s.replace(',', '.'));
      if (!isFinite(n)) return { values, error: `Pole „${f.label}“ musí být číslo.` };
      v = n;
    } else if (f.type === 'select') {
      if (!optionsOf(f).includes(s)) return { values, error: `Neplatná hodnota pole „${f.label}“.` };
      v = s;
    } else v = s;
    if (f.required && (v === null || v === false && f.type !== 'checkbox')) {
      return { values, error: `Pole „${f.label}“ je povinné.` };
    }
    values[f.key] = v;
  }
  return { values };
}

export function asValues(json: unknown): CfValues {
  return json && typeof json === 'object' && !Array.isArray(json) ? (json as CfValues) : {};
}
