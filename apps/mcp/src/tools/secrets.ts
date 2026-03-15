import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { api } from "../lib/api.js";

export function registerSecretTools(server: McpServer) {
  server.tool("toki_secret_list", "List secrets (no values shown)", {}, async () => {
    const secrets = await api("/api/secrets");
    return { content: [{ type: "text", text: JSON.stringify(secrets, null, 2) }] };
  });

  server.tool(
    "toki_secret_create",
    "Create a new secret",
    {
      name: z.string().describe("Secret name"),
      type: z.enum(["anthropic", "generic"]).describe("Secret type"),
      value: z.string().describe("Secret value"),
      hostPattern: z.string().describe("Host pattern, e.g. api.anthropic.com"),
      pathPattern: z.string().optional().describe("Path pattern, e.g. /v1/*"),
      headerName: z.string().optional().describe("Header name (generic type)"),
      valueFormat: z.string().optional().describe("Value format, e.g. Bearer {value}"),
    },
    async (args) => {
      const body: Record<string, unknown> = {
        name: args.name,
        type: args.type,
        value: args.value,
        hostPattern: args.hostPattern,
        pathPattern: args.pathPattern ?? null,
      };
      if (args.type === "generic" && args.headerName) {
        body.injectionConfig = {
          headerName: args.headerName,
          valueFormat: args.valueFormat,
        };
      }
      const secret = await api("/api/secrets", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return { content: [{ type: "text", text: JSON.stringify(secret, null, 2) }] };
    },
  );

  server.tool(
    "toki_secret_delete",
    "Delete a secret",
    { id: z.string().describe("Secret ID") },
    async ({ id }) => {
      await api(`/api/secrets/${id}`, { method: "DELETE" });
      return { content: [{ type: "text", text: "Deleted" }] };
    },
  );
}
