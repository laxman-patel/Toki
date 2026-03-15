import { TokiClient, type TokiConfig } from "./client.js";

export interface CreateTokiProxyOptions {
  proxyUrl?: string;
  token?: string;
}

/**
 * Create a fetch function that routes requests through the Toki proxy.
 * Credentials are injected transparently by the proxy.
 */
export function createTokiProxy(opts: CreateTokiProxyOptions = {}): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  const config: TokiConfig = {
    proxyUrl: opts.proxyUrl ?? process.env.TOKI_PROXY_URL ?? "http://localhost:4080",
    token: opts.token ?? process.env.TOKI_TOKEN ?? "",
  };

  if (!config.token) {
    throw new Error("Toki token required. Pass token option or set TOKI_TOKEN.");
  }

  const client = new TokiClient(config);

  return (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const proxyUrl = client.rewriteUrl(url);

    const headers = new Headers(init?.headers);
    headers.set("Proxy-Authorization", client.authHeader);

    return fetch(proxyUrl, { ...init, headers });
  };
}
