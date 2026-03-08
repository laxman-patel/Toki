#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { Command } from "commander";

import { TokiClient } from "@toki/sdk-node";

type CliConfig = {
  apiUrl: string;
  token?: string;
};

const configPath = join(homedir(), ".config", "toki", "config.json");

const loadConfig = async (): Promise<CliConfig> => {
  try {
    const raw = await readFile(configPath, "utf8");
    return JSON.parse(raw) as CliConfig;
  } catch {
    return {
      apiUrl: process.env.TOKI_API_URL ?? "http://localhost:3000"
    };
  }
};

const saveConfig = async (config: CliConfig) => {
  await mkdir(join(homedir(), ".config", "toki"), { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2));
};

const withClient = async () => {
  const config = await loadConfig();
  return new TokiClient({
    baseUrl: config.apiUrl,
    token: config.token
  });
};

const program = new Command();

program.name("toki").description("Agent-first secure tool access CLI").version("0.0.1");

program
  .command("login")
  .description("Store API URL and a bootstrap token for local development.")
  .option("--api-url <apiUrl>", "Toki API base URL", "http://localhost:3000")
  .option("--token <token>", "Bootstrap token or WorkOS-issued bearer token")
  .action(async (options) => {
    await saveConfig({
      apiUrl: options.apiUrl,
      token: options.token
    });
    console.log(`Saved CLI config to ${configPath}`);
  });

const agent = program.command("agent").description("Manage agents");
agent
  .command("create")
  .requiredOption("--name <name>", "Agent name")
  .option("--description <description>", "Agent description")
  .action(async (options) => {
    const client = await withClient();
    const result = await client.createAgent(options);
    console.log(JSON.stringify(result, null, 2));
  });

const tool = program.command("tool").description("Manage tools");
tool
  .command("add")
  .requiredOption("--name <name>", "Tool name")
  .requiredOption("--kind <kind>", "Tool kind: http or mcp")
  .requiredOption("--target-url <targetUrl>", "Target URL")
  .action(async (options) => {
    const client = await withClient();
    const result = await client.createTool({
      name: options.name,
      kind: options.kind,
      targetUrl: options.targetUrl
    });
    console.log(JSON.stringify(result, null, 2));
  });

const workflow = program.command("workflow").description("Manage workflows");
workflow
  .command("create")
  .requiredOption("--agent-id <agentId>", "Agent ID")
  .requiredOption("--name <name>", "Workflow name")
  .option("--description <description>", "Workflow description")
  .action(async (options) => {
    const client = await withClient();
    const result = await client.createWorkflow(options);
    console.log(JSON.stringify(result, null, 2));
  });

const policy = program.command("policy").description("Manage policies");
policy
  .command("apply")
  .requiredOption("--subject-type <subjectType>", "agent or workflow")
  .requiredOption("--subject-id <subjectId>", "Agent or workflow ID")
  .requiredOption("--tool-id <toolId>", "Tool ID")
  .requiredOption("--action <action>", "Allowed action")
  .requiredOption("--resource <resource>", "Resource scope")
  .requiredOption("--environment <environment>", "Environment name")
  .option("--effect <effect>", "allow or deny", "allow")
  .option("--max-ttl <maxTtl>", "Max TTL, e.g. 15m")
  .action(async (options) => {
    const client = await withClient();
    const result = await client.applyPolicy(options);
    console.log(JSON.stringify(result, null, 2));
  });

const lease = program.command("lease").description("Manage leases");
lease
  .command("issue")
  .requiredOption("--agent-id <agentId>", "Agent ID")
  .requiredOption("--tool-id <toolId>", "Tool ID")
  .requiredOption("--action <action>", "Action name")
  .requiredOption("--resource <resource>", "Resource scope")
  .requiredOption("--environment <environment>", "Environment name")
  .option("--workflow-id <workflowId>", "Workflow ID")
  .option("--ttl <ttl>", "Requested TTL, e.g. 10m")
  .action(async (options) => {
    const client = await withClient();
    const result = await client.createLease(options);
    console.log(JSON.stringify(result, null, 2));
  });

lease
  .command("revoke")
  .requiredOption("--id <id>", "Lease ID")
  .action(async (options) => {
    const client = await withClient();
    const result = await client.revokeLease(options.id);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command("invoke")
  .requiredOption("--lease-id <leaseId>", "Lease ID")
  .requiredOption("--tool-id <toolId>", "Tool ID")
  .requiredOption("--action <action>", "Action name")
  .requiredOption("--resource <resource>", "Resource scope")
  .requiredOption("--environment <environment>", "Environment name")
  .option("--payload <payload>", "JSON payload string")
  .action(async (options) => {
    const client = await withClient();
    const payload = options.payload ? JSON.parse(options.payload) : undefined;
    const result = await client.invokeWithLease({
      leaseId: options.leaseId,
      toolId: options.toolId,
      action: options.action,
      resource: options.resource,
      environment: options.environment,
      payload
    });
    console.log(JSON.stringify(result, null, 2));
  });

const logs = program.command("logs").description("Read audit events");
logs
  .command("tail")
  .option("--limit <limit>", "Number of events", "20")
  .option("--actor-id <actorId>", "Filter by actor ID")
  .option("--actor-type <actorType>", "Filter by actor type")
  .option("--event-type <eventType>", "Filter by event type")
  .action(async (options) => {
    const client = await withClient();
    const result = await client.listAuditEvents({
      actorId: options.actorId,
      actorType: options.actorType,
      eventType: options.eventType,
      limit: Number(options.limit)
    });
    console.log(JSON.stringify(result, null, 2));
  });

await program.parseAsync();
