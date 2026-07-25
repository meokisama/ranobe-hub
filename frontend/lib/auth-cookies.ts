/**
 * Admin auth cookie access.
 *
 * Kept out of component files on purpose: `document.cookie` writes and `Date.now()`
 * are side effects that React's lint rules (rightly) reject inside components.
 */

const TOKEN = "adminToken";
const EXPIRES = "adminTokenExpires";
const MAX_AGE_SECONDS = 24 * 60 * 60;

export function getCookie(name: string): string | undefined {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export function getAdminToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return getCookie(TOKEN);
}

export function setAdminToken(token: string): void {
  const expires = new Date(Date.now() + MAX_AGE_SECONDS * 1000).toISOString();
  document.cookie = `${TOKEN}=${token}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Strict`;
  document.cookie = `${EXPIRES}=${expires}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Strict`;
}

export function clearAdminToken(): void {
  for (const name of [TOKEN, EXPIRES]) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
  }
}
