/** Extract agent token from Proxy-Authorization: Basic base64(x:token) */
export function extractToken(headers: Headers): string | null {
  const auth = headers.get("proxy-authorization");
  if (!auth) return null;

  const match = auth.match(/^Basic\s+(.+)$/i);
  if (!match) return null;

  const decoded = atob(match[1]);
  const colon = decoded.indexOf(":");
  if (colon === -1) return decoded || null;

  const password = decoded.slice(colon + 1);
  return password || decoded.slice(0, colon) || null;
}
