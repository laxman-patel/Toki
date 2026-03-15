import { NextRequest } from "next/server";
import { and, eq, desc } from "drizzle-orm";
import { auditLog } from "@toki/db";
import { db } from "@/lib/db";
import { getSession, json, error } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
  const offset = Number(url.searchParams.get("offset") ?? 0);
  const agentId = url.searchParams.get("agentId");

  const conditions = [eq(auditLog.userId, session.user.id)];
  if (agentId) conditions.push(eq(auditLog.agentId, agentId));

  const logs = await db
    .select()
    .from(auditLog)
    .where(and(...conditions))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset(offset);

  return json(logs);
}
