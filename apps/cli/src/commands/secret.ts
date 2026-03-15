import { Command } from "commander";
import { api } from "../lib/api.js";
import { output } from "../lib/output.js";

export const secretCmd = new Command("secret").description("Manage secrets");

secretCmd
  .command("list")
  .description("List secrets (no values)")
  .option("--json", "JSON output")
  .action(async (opts) => {
    const res = await api("/api/secrets");
    const data = await res.json();
    output(
      opts.json
        ? data
        : data.map((s: Record<string, unknown>) => ({
            id: s.id,
            name: s.name,
            type: s.type,
            host: s.hostPattern,
          })),
      opts.json,
    );
  });

secretCmd
  .command("create")
  .description("Create a secret")
  .requiredOption("--name <name>", "Secret name")
  .requiredOption("--type <type>", "Type: anthropic | generic")
  .requiredOption("--value <value>", "Secret value")
  .requiredOption("--host <host>", "Host pattern")
  .option("--path <path>", "Path pattern")
  .option("--header <header>", "Header name (generic type)")
  .option("--format <format>", 'Value format, e.g. "Bearer {value}"')
  .option("--json", "JSON output")
  .action(async (opts) => {
    const body: Record<string, unknown> = {
      name: opts.name,
      type: opts.type,
      value: opts.value,
      hostPattern: opts.host,
      pathPattern: opts.path || null,
    };
    if (opts.type === "generic" && opts.header) {
      body.injectionConfig = {
        headerName: opts.header,
        valueFormat: opts.format || undefined,
      };
    }
    const res = await api("/api/secrets", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (opts.json) console.log(JSON.stringify(data, null, 2));
    else console.log(`Created secret: ${data.name}`);
  });

secretCmd
  .command("delete")
  .description("Delete a secret")
  .argument("<id>", "Secret ID")
  .action(async (id) => {
    const res = await api(`/api/secrets/${id}`, { method: "DELETE" });
    if (res.ok) console.log("Deleted.");
    else console.error("Failed:", await res.text());
  });

secretCmd
  .command("rotate")
  .description("Rotate a secret value")
  .argument("<id>", "Secret ID")
  .requiredOption("--value <value>", "New secret value")
  .action(async (id, opts) => {
    const res = await api(`/api/secrets/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ value: opts.value }),
    });
    if (res.ok) console.log("Rotated.");
    else console.error("Failed:", await res.text());
  });
