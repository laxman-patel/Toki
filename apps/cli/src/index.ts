#!/usr/bin/env bun
import { Command } from "commander";
import { loginCmd, whoamiCmd } from "./commands/auth.js";
import { agentCmd } from "./commands/agent.js";
import { secretCmd } from "./commands/secret.js";
import { proxyCmd } from "./commands/proxy.js";
import { auditCmd } from "./commands/audit.js";
import { configCmd } from "./commands/config.js";
import { fetchCmd } from "./commands/fetch.js";

const program = new Command()
  .name("toki")
  .description("Toki — credential security for AI agents")
  .version("0.1.0");

program.addCommand(loginCmd);
program.addCommand(whoamiCmd);
program.addCommand(agentCmd);
program.addCommand(secretCmd);
program.addCommand(proxyCmd);
program.addCommand(auditCmd);
program.addCommand(configCmd);
program.addCommand(fetchCmd);

program.parse();
