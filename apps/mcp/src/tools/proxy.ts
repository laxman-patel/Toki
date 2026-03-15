import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerProxyTools(server: McpServer) {
  server.tool(
    "toki_proxy_status",
    "Check if the Toki proxy is running",
    {
      port: z.number().optional().describe("Proxy port (default 4080)"),
    },
    async (args) => {
      const port = args.port ?? 4080;
      try {
        const res = await fetch(`http://localhost:${port}/healthz`);
        const text = await res.text();
        return {
          content: [{ type: "text", text: JSON.stringify({ status: text, port }) }],
        };
      } catch {
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "down", port }) }],
        };
      }
    },
  );
}
