import { loadConfig } from "./config.js";

export async function api(
  path: string,
  opts: RequestInit = {},
): Promise<Response> {
  const config = loadConfig();
  if (!config.token) {
    console.error("Not logged in. Run: toki login");
    process.exit(1);
  }
  const url = `${config.apiUrl}${path}`;
  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Cookie: `better-auth.session_token=${config.token}`,
      ...opts.headers,
    },
  });
}
