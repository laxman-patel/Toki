const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "proxy-connection",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export async function forward(
  upstreamUrl: string,
  method: string,
  headers: Headers,
  body: ReadableStream | null,
): Promise<Response> {
  // Strip hop-by-hop headers
  const outHeaders = new Headers();
  for (const [k, v] of headers) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) {
      outHeaders.set(k, v);
    }
  }

  const res = await fetch(upstreamUrl, {
    method,
    headers: outHeaders,
    body,
    // @ts-expect-error Bun supports duplex
    duplex: "half",
  });

  return res;
}
