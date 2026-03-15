import { Command } from "commander";
import { api } from "../lib/api.js";
import { output } from "../lib/output.js";

export const agentCmd = new Command("agent").description("Manage agents");

agentCmd
  .command("list")
  .description("List agents")
  .option("--json", "JSON output")
  .action(async (opts) => {
    const res = await api("/api/agents");
    const data = await res.json();
    output(
      opts.json
        ? data
        : data.map((a: Record<string, unknown>) => ({
            id: a.id,
            name: a.name,
            token: String(a.accessToken).slice(0, 12) + "...",
            active: a.isActive,
          })),
      opts.json,
    );
  });

agentCmd
  .command("create")
  .description("Create an agent")
  .argument("<name>", "Agent name")
  .option("--json", "JSON output")
  .action(async (name, opts) => {
    const res = await api("/api/agents", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`Created agent: ${data.name}`);
      console.log(`Token: ${data.accessToken}`);
    }
  });

agentCmd
  .command("delete")
  .description("Delete an agent")
  .argument("<id>", "Agent ID")
  .action(async (id) => {
    const res = await api(`/api/agents/${id}`, { method: "DELETE" });
    if (res.ok) console.log("Deleted.");
    else console.error("Failed:", await res.text());
  });
