import { eq } from "drizzle-orm";
import { agent, secret } from "@toki/db";
import type { Db } from "@toki/db";
import { decrypt, decodeKey } from "@toki/crypto";
import {
  hostMatches,
  type ConnectRule,
  type ResolveResult,
  type InjectionConfig,
} from "@toki/shared";
import { TtlCache } from "./cache.js";

const key = decodeKey(process.env.SECRET_ENCRYPTION_KEY!);
const cache = new TtlCache<ResolveResult>();

function buildInjections(
  type: string,
  decryptedValue: string,
  injectionConfig: InjectionConfig | null,
): ConnectRule["actions"] {
  if (type === "anthropic") {
    if (decryptedValue.startsWith("sk-ant-oat-")) {
      return [
        { type: "SetHeader", name: "authorization", value: `Bearer ${decryptedValue}` },
        { type: "RemoveHeader", name: "x-api-key" },
      ];
    }
    return [
      { type: "SetHeader", name: "x-api-key", value: decryptedValue },
      { type: "RemoveHeader", name: "authorization" },
    ];
  }

  if (type === "generic" && injectionConfig?.headerName) {
    const value = injectionConfig.valueFormat
      ? injectionConfig.valueFormat.replace("{value}", decryptedValue)
      : decryptedValue;
    return [{ type: "SetHeader", name: injectionConfig.headerName, value }];
  }

  return [];
}

export async function resolve(
  db: Db,
  token: string,
  hostname: string,
): Promise<ResolveResult> {
  const cacheKey = `${token}:${hostname}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // 1. Lookup agent
  const [agentRow] = await db
    .select({ id: agent.id, userId: agent.userId })
    .from(agent)
    .where(eq(agent.accessToken, token))
    .limit(1);

  if (!agentRow) return { intercept: false, rules: [] };

  // 2. Get user's secrets
  const secrets = await db
    .select()
    .from(secret)
    .where(eq(secret.userId, agentRow.userId));

  // 3. Filter by host + build rules
  const rules: ConnectRule[] = [];
  for (const s of secrets) {
    if (!hostMatches(hostname, s.hostPattern)) continue;
    const decrypted = decrypt(s.encryptedValue, key);
    const actions = buildInjections(
      s.type,
      decrypted,
      s.injectionConfig as InjectionConfig | null,
    );
    if (actions.length > 0) {
      rules.push({ pathPattern: s.pathPattern, actions });
    }
  }

  const result: ResolveResult = { intercept: rules.length > 0, rules };
  cache.set(cacheKey, result);
  return result;
}

export { type ResolveResult };
