/** Match a request host against a pattern. Supports exact match and wildcard (*.example.com) */
export function hostMatches(host: string, pattern: string): boolean {
  if (host === pattern) return true;
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(1); // ".example.com"
    return host.endsWith(suffix) && host.length > suffix.length;
  }
  return false;
}

/** Match a request path against a pattern. Supports exact, wildcard (*), and prefix (/v1/*) */
export function pathMatches(path: string, pattern: string | null): boolean {
  if (pattern === null || pattern === "*") return true;
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2); // "/v1"
    return path === prefix || path.startsWith(prefix + "/");
  }
  return path === pattern;
}
