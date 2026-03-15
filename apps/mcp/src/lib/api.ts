import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function getToken(): string {
  if (process.env.TOKI_TOKEN) return process.env.TOKI_TOKEN;
  try {
    const config = JSON.parse(
      readFileSync(join(homedir(), ".toki", "config.json"), "utf8"),
    );
    return config.token;
  } catch {
    throw new Error("No token found. Run: toki login or set TOKI_TOKEN");
  }
}

function getApiUrl(): string {
  if (process.env.TOKI_API_URL) return process.env.TOKI_API_URL;
  try {
    const config = JSON.parse(
      readFileSync(join(homedir(), ".toki", "config.json"), "utf8"),
    );
    return config.apiUrl ?? "http://localhost:3000";
  } catch {
    return "http://localhost:3000";
  }
}

export async function api(
  path: string,
  opts: RequestInit = {},
): Promise<unknown> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Cookie: `better-auth.session_token=${getToken()}`,
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}
