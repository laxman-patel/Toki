import { Command } from "commander";
import { loadConfig, saveConfig } from "../lib/config.js";

export const configCmd = new Command("config").description("Manage config");

configCmd
  .command("get")
  .description("Get a config value")
  .argument("<key>", "Config key")
  .action((key) => {
    const config = loadConfig();
    const val = config[key as keyof typeof config];
    console.log(val ?? "(not set)");
  });

configCmd
  .command("set")
  .description("Set a config value")
  .argument("<key>", "Config key")
  .argument("<value>", "Config value")
  .action((key, value) => {
    saveConfig({ [key]: value });
    console.log(`Set ${key} = ${value}`);
  });
