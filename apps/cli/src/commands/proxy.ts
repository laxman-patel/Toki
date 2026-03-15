import { Command } from "commander";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const proxyCmd = new Command("proxy").description("Manage proxy");

proxyCmd
  .command("start")
  .description("Start local credential proxy")
  .option("--port <port>", "Port", "4080")
  .action(async (opts) => {
    const proxyDir = join(dirname(fileURLToPath(import.meta.url)), "../../..", "proxy");
    console.log(`Starting proxy on :${opts.port}...`);
    const child = spawn("bun", ["run", "src/server.ts"], {
      cwd: proxyDir,
      env: { ...process.env, PROXY_PORT: opts.port },
      stdio: "inherit",
    });
    child.on("exit", (code) => process.exit(code ?? 0));
  });

proxyCmd
  .command("status")
  .description("Check proxy health")
  .option("--port <port>", "Port", "4080")
  .option("--json", "JSON output")
  .action(async (opts) => {
    try {
      const res = await fetch(`http://localhost:${opts.port}/healthz`);
      const text = await res.text();
      if (opts.json) console.log(JSON.stringify({ status: text, port: opts.port }));
      else console.log(`Proxy is ${text} on :${opts.port}`);
    } catch {
      if (opts.json) console.log(JSON.stringify({ status: "down", port: opts.port }));
      else console.log(`Proxy is not running on :${opts.port}`);
      process.exit(1);
    }
  });
