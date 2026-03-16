import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function getAgentToken(): string | undefined {
  if (process.env.TOKI_AGENT_TOKEN) return process.env.TOKI_AGENT_TOKEN;
  try {
    const config = JSON.parse(
      readFileSync(join(homedir(), ".toki", "config.json"), "utf8"),
    );
    return config.defaultAgent;
  } catch {
    return undefined;
  }
}

export function registerFetchTools(server: McpServer) {
  server.tool(
    "toki_fetch",
    "Make an HTTP request through the Toki proxy with automatic credential injection",
    {
      url: z.string().describe("Target URL (e.g. https://api.anthropic.com/v1/messages)"),
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional().describe("HTTP method (default GET)"),
      headers: z.record(z.string()).optional().describe("Request headers"),
      body: z.string().optional().describe("Request body (JSON string)"),
      agentToken: z.string().optional().describe("Agent token (default: config defaultAgent or TOKI_AGENT_TOKEN)"),
      proxyUrl: z.string().optional().describe("Proxy URL (default http://localhost:4080)"),
    },
    async (args) => {
      const token = args.agentToken ?? getAgentToken();
      if (!token) {
        return {
          content: [{ type: "text", text: "Error: no agent token. Pass agentToken or set defaultAgent in ~/.toki/config.json" }],
          isError: true,
        };
      }

      const proxy = args.proxyUrl ?? process.env.TOKI_PROXY_URL ?? "http://localhost:4080";
      const parsed = new URL(args.url);
      const proxyUrl = `${proxy}/proxy/${parsed.host}${parsed.pathname}${parsed.search}`;

      const headers = new Headers(args.headers);
      headers.set("Proxy-Authorization", `Basic ${btoa(`x:${token}`)}`);

      const res = await fetch(proxyUrl, {
        method: args.method ?? "GET",
        headers,
        body: args.body ?? undefined,
      });

      const body = await res.text();
      return {
        content: [{ type: "text", text: JSON.stringify({ status: res.status, body: tryParseJson(body) }, null, 2) }],
      };
    },
  );
}

function tryParseJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}
