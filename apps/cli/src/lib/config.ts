import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface Config {
  apiUrl: string;
  token?: string;
  defaultAgent?: string;
}

const CONFIG_DIR = join(homedir(), ".toki");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

const DEFAULTS: Config = {
  apiUrl: "http://localhost:3000",
};

export function loadConfig(): Config {
  try {
    const raw = readFileSync(CONFIG_PATH, "utf8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveConfig(config: Partial<Config>) {
  const current = loadConfig();
  const merged = { ...current, ...config };
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2) + "\n");
}

export function getConfigPath() {
  return CONFIG_PATH;
}
