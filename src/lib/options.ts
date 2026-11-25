import 'server-only';
import { db } from './db';

export async function subjectFormOptions() {
  const [statuses, categories, users] = await Promise.all([
    db.codeItem.findMany({ where: { list: 'subject_status', active: true }, orderBy: [{ sort: 'asc' }, { id: 'asc' }] }),
    db.codeItem.findMany({ where: { list: 'subject_category', active: true }, orderBy: [{ sort: 'asc' }, { id: 'asc' }] }),
    db.user.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ]);
  return {
    statuses: statuses.map((s) => ({ id: s.id, label: s.label })),
    categories: categories.map((s) => ({ id: s.id, label: s.label })),
    users: users.map((u) => ({ id: u.id, label: u.name })),
  };
}
