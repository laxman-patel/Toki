import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { agent, auditLog } from "@toki/db";
import type { Db } from "@toki/db";

export async function logAudit(
  db: Db,
  token: string,
  service: string,
  path: string,
  secretNames: string[],
) {
  const [agentRow] = await db
    .select({ id: agent.id, userId: agent.userId })
    .from(agent)
    .where(eq(agent.accessToken, token))
    .limit(1);

  if (!agentRow) return;

  await db.insert(auditLog).values({
    id: nanoid(),
    userId: agentRow.userId,
    agentId: agentRow.id,
    action: "credential_injection",
    service,
    path,
    secretName: secretNames.join(", ") || null,
    metadata: { secretCount: secretNames.length },
  });
}
