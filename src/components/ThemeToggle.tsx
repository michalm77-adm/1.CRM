'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);
  const apply = (t: 'dark' | 'light') => {
    setTheme(t);
    if (t === 'light') document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('crm-theme', t); } catch {}
  };
  return (
    <div className="theme-toggle" role="group" aria-label="Motiv">
      <button type="button" className={theme === 'light' ? 'on' : ''} onClick={() => apply('light')}>Světlý</button>
      <button type="button" className={theme === 'dark' ? 'on' : ''} onClick={() => apply('dark')}>Tmavý</button>
    </div>
  );
}
