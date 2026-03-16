import { Command } from "commander";
import { loadConfig } from "../lib/config.js";

export const fetchCmd = new Command("fetch")
  .description("Make an HTTP request through the Toki proxy (credentials injected automatically)")
  .argument("<url>", "Target URL (e.g. https://api.anthropic.com/v1/messages)")
  .option("-X, --method <method>", "HTTP method", "GET")
  .option("-H, --header <headers...>", "Headers (key:value)")
  .option("-d, --data <body>", "Request body")
  .option("--agent-token <token>", "Agent token (default: config defaultAgent)")
  .option("--proxy-url <url>", "Proxy URL", "http://localhost:4080")
  .option("--json", "JSON output (wrap response in metadata)")
  .action(async (url, opts) => {
    const config = loadConfig();
    const token = opts.agentToken ?? config.defaultAgent;
    if (!token) {
      console.error("No agent token. Pass --agent-token or set: toki config set defaultAgent tok_xxx");
      process.exit(1);
    }

    const parsed = new URL(url);
    const proxyUrl = `${opts.proxyUrl}/proxy/${parsed.host}${parsed.pathname}${parsed.search}`;

    const headers = new Headers();
    headers.set("Proxy-Authorization", `Basic ${btoa(`x:${token}`)}`);
    if (opts.header) {
      for (const h of opts.header) {
        const [k, ...v] = h.split(":");
        headers.set(k.trim(), v.join(":").trim());
      }
    }

    const res = await fetch(proxyUrl, {
      method: opts.method,
      headers,
      body: opts.data ?? undefined,
    });

    const body = await res.text();

    if (opts.json) {
      console.log(JSON.stringify({
        status: res.status,
        headers: Object.fromEntries(res.headers),
        body: tryParseJson(body),
      }, null, 2));
    } else {
      console.log(body);
    }

    if (!res.ok) process.exit(1);
  });

function tryParseJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}
