import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "../lib/api.js";

export function registerAgentTools(server: McpServer) {
  server.tool("toki_agent_list", "List all agents", {}, async () => {
    const agents = await api("/api/agents");
    return { content: [{ type: "text", text: JSON.stringify(agents, null, 2) }] };
  });

  server.tool(
    "toki_agent_create",
    "Create a new agent",
    { name: z.string().describe("Agent name") },
    async ({ name }) => {
      const agent = await api("/api/agents", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return { content: [{ type: "text", text: JSON.stringify(agent, null, 2) }] };
    },
  );
}
