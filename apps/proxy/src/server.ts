import { createDb } from "@toki/db";
import { DEFAULT_PROXY_PORT } from "@toki/shared";
import { extractToken } from "./auth.js";
import { resolve } from "./resolve.js";
import { applyInjections } from "./inject.js";
import { forward } from "./forward.js";
import { logAudit } from "./audit.js";

const port = Number(process.env.PROXY_PORT ?? DEFAULT_PROXY_PORT);
const db = createDb(process.env.DATABASE_URL!);

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    // Health check
    if (url.pathname === "/healthz") {
      return new Response("ok");
    }

    // Proxy route: /proxy/{host}/{path}
    if (!url.pathname.startsWith("/proxy/")) {
      return new Response("Not found", { status: 404 });
    }

    const rest = url.pathname.slice("/proxy/".length);
    const slashIdx = rest.indexOf("/");
    const hostname = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
    const path = slashIdx === -1 ? "/" : rest.slice(slashIdx);

    if (!hostname) {
      return new Response("Missing hostname", { status: 400 });
    }

    // Auth
    const token = extractToken(req.headers);
    if (!token) {
      return new Response("Proxy authentication required", { status: 407 });
    }

    // Resolve credentials
    const result = await resolve(db, token, hostname);
    if (!result.intercept) {
      return new Response("No matching credentials", { status: 403 });
    }

    // Build upstream request
    const upstreamUrl = `https://${hostname}${path}${url.search}`;
    const headers = new Headers(req.headers);
    headers.set("host", hostname);
    applyInjections(headers, path, result.rules);

    // Forward
    const upstream = await forward(
      upstreamUrl,
      req.method,
      headers,
      req.body,
    );

    // Audit (fire and forget)
    logAudit(db, token, hostname, path, []).catch(() => {});

    // Stream response back
    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  },
});

console.log(`Toki proxy listening on :${port}`);
