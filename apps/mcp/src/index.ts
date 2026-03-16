import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAgentTools } from "./tools/agents.js";
import { registerSecretTools } from "./tools/secrets.js";
import { registerAuditTools } from "./tools/audit.js";
import { registerProxyTools } from "./tools/proxy.js";
import { registerFetchTools } from "./tools/fetch.js";

const server = new McpServer({
  name: "toki",
  version: "0.1.0",
});

registerAgentTools(server);
registerSecretTools(server);
registerAuditTools(server);
registerProxyTools(server);
registerFetchTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
