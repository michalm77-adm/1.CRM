'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { href: string; label: string } | { sep: true };

export function Nav({ items }: { items: Item[] }) {
  const path = usePathname();
  return (
    <nav className="nav">
      {items.map((it, i) =>
        'sep' in it ? (
          <div key={i} className="sep" />
        ) : (
          <Link key={it.href} href={it.href} className={(it.href === '/' ? path === '/' : path.startsWith(it.href)) ? 'active' : ''}>
            {it.label}
          </Link>
        ),
      )}
    </nav>
  );
}
