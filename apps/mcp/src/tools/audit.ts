import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "../lib/api.js";

export function registerAuditTools(server: McpServer) {
  server.tool(
    "toki_audit_list",
    "List recent audit log entries",
    {
      limit: z.number().optional().describe("Max entries (default 20)"),
      agentId: z.string().optional().describe("Filter by agent ID"),
    },
    async (args) => {
      const params = new URLSearchParams();
      if (args.limit) params.set("limit", String(args.limit));
      if (args.agentId) params.set("agentId", args.agentId);
      const logs = await api(`/api/audit?${params}`);
      return { content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] };
    },
  );
}
