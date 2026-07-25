/** Routes that render their own full-page chrome, so the site header/footer step aside. */
const BARE_ROUTE_PREFIXES = ["/admin", "/maintenance", "/aozora"];

export function hidesSiteChrome(pathname: string): boolean {
  return BARE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
