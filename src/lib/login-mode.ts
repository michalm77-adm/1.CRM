export type LoginMode = 'bez-hesla' | 'heslo' | 'heslo-kod';

/** Způsob přihlášení z .env (LOGIN_MODE). Bez nastavení = přihlášení bez hesla. */
export function loginMode(): LoginMode {
  const m = process.env.LOGIN_MODE;
  if (m === 'bez-hesla' || m === 'heslo' || m === 'heslo-kod') return m;
  return 'bez-hesla';
}
