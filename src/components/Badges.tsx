export function RoleBadges({ s }: { s: { isClient: boolean; isCustomer: boolean; isSupplier: boolean } }) {
  return (
    <span className="badges">
      {s.isClient && <span className="badge y">Klient</span>}
      {s.isCustomer && <span className="badge y">Zákazník</span>}
      {s.isSupplier && <span className="badge">Dodavatel</span>}
    </span>
  );
}

export function CodeBadge({ item }: { item: { label: string; color: string | null } | null }) {
  if (!item) return null;
  return (
    <span className="badge">
      {item.color && <span className="dot" style={{ background: item.color }} />}
      {item.label}
    </span>
  );
}
