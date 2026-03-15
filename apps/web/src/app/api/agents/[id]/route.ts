import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { agent } from "@toki/db";
import { db } from "@/lib/db";
import { getSession, json, error } from "@/lib/api-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);
  const { id } = await params;

  const body = await req.json();
  const updated = await db
    .update(agent)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(agent.id, id), eq(agent.userId, session.user.id)))
    .returning();

  if (!updated.length) return error("Not found", 404);
  return json(updated[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);
  const { id } = await params;

  const deleted = await db
    .delete(agent)
    .where(and(eq(agent.id, id), eq(agent.userId, session.user.id)))
    .returning();

  if (!deleted.length) return error("Not found", 404);
  return json({ ok: true });
}
