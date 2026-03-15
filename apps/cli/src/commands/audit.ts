import { Command } from "commander";
import { api } from "../lib/api.js";
import { output } from "../lib/output.js";

export const auditCmd = new Command("audit").description("View audit logs");

auditCmd
  .command("list")
  .description("List audit events")
  .option("--json", "JSON output")
  .option("--agent-id <id>", "Filter by agent ID")
  .option("--limit <n>", "Limit results", "20")
  .action(async (opts) => {
    const params = new URLSearchParams({ limit: opts.limit });
    if (opts.agentId) params.set("agentId", opts.agentId);
    const res = await api(`/api/audit?${params}`);
    const data = await res.json();
    output(
      opts.json
        ? data
        : data.map((l: Record<string, unknown>) => ({
            time: l.createdAt,
            action: l.action,
            service: l.service ?? "-",
            path: l.path ?? "-",
          })),
      opts.json,
    );
  });
