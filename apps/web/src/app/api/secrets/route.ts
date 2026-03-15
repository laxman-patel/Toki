import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { secret } from "@toki/db";
import { encrypt, decodeKey } from "@toki/crypto";
import { db } from "@/lib/db";
import { getSession, json, error } from "@/lib/api-utils";

const key = decodeKey(process.env.SECRET_ENCRYPTION_KEY!);

export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const secrets = await db
    .select({
      id: secret.id,
      name: secret.name,
      type: secret.type,
      hostPattern: secret.hostPattern,
      pathPattern: secret.pathPattern,
      injectionConfig: secret.injectionConfig,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    })
    .from(secret)
    .where(eq(secret.userId, session.user.id));
  return json(secrets);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const body = await req.json();
  const { name, type, value, hostPattern, pathPattern, injectionConfig } = body;

  if (!name || !type || !value || !hostPattern) {
    return error("name, type, value, and hostPattern are required");
  }

  const newSecret = {
    id: nanoid(),
    userId: session.user.id,
    name,
    type,
    encryptedValue: encrypt(value, key),
    hostPattern,
    pathPattern: pathPattern ?? null,
    injectionConfig: injectionConfig ?? null,
  };

  await db.insert(secret).values(newSecret);
  return json({ ...newSecret, encryptedValue: undefined }, 201);
}
