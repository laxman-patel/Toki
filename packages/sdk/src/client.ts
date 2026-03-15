export interface TokiConfig {
  proxyUrl: string;
  token: string;
}

export class TokiClient {
  readonly proxyUrl: string;
  readonly token: string;

  constructor(config: TokiConfig) {
    this.proxyUrl = config.proxyUrl.replace(/\/$/, "");
    this.token = config.token;
  }

  /** Rewrite a URL to go through the Toki proxy */
  rewriteUrl(url: string): string {
    const parsed = new URL(url);
    return `${this.proxyUrl}/proxy/${parsed.host}${parsed.pathname}${parsed.search}`;
  }

  /** Get Proxy-Authorization header value */
  get authHeader(): string {
    return `Basic ${btoa(`x:${this.token}`)}`;
  }
}
