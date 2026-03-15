import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { secret } from "@toki/db";
import { encrypt, decodeKey } from "@toki/crypto";
import { db } from "@/lib/db";
import { getSession, json, error } from "@/lib/api-utils";

const key = decodeKey(process.env.SECRET_ENCRYPTION_KEY!);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);
  const { id } = await params;

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.name) updates.name = body.name;
  if (body.type) updates.type = body.type;
  if (body.hostPattern) updates.hostPattern = body.hostPattern;
  if (body.pathPattern !== undefined) updates.pathPattern = body.pathPattern;
  if (body.injectionConfig !== undefined)
    updates.injectionConfig = body.injectionConfig;
  if (body.value) updates.encryptedValue = encrypt(body.value, key);

  const updated = await db
    .update(secret)
    .set(updates)
    .where(and(eq(secret.id, id), eq(secret.userId, session.user.id)))
    .returning({
      id: secret.id,
      name: secret.name,
      type: secret.type,
      hostPattern: secret.hostPattern,
      pathPattern: secret.pathPattern,
      injectionConfig: secret.injectionConfig,
      updatedAt: secret.updatedAt,
    });

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
    .delete(secret)
    .where(and(eq(secret.id, id), eq(secret.userId, session.user.id)))
    .returning();

  if (!deleted.length) return error("Not found", 404);
  return json({ ok: true });
}
