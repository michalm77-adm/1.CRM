export function LoginShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="login">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <img src="/logo.svg" alt="" width={40} height={40} />
          <div>
            <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 20 }}>2M elektro</div>
            <div className="muted" style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>CRM</div>
          </div>
        </div>
        <h1 style={{ fontSize: 24 }}>{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function LocalMailHint() {
  if (process.env.SMTP_HOST) return null;
  return (
    <p className="muted" style={{ fontSize: 13, margin: 0 }}>
      Odesílání e-mailů zatím není nastavené, kód proto najdete v okně, ve kterém běží CRM (spustit.bat).
    </p>
  );
}
