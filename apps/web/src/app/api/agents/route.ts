import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { agent } from "@toki/db";
import { TOKEN_PREFIX } from "@toki/shared";
import { db } from "@/lib/db";
import { getSession, json, error } from "@/lib/api-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const agents = await db
    .select()
    .from(agent)
    .where(eq(agent.userId, session.user.id));
  return json(agents);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const body = await req.json();
  const name = body.name;
  if (!name) return error("Name is required");

  const newAgent = {
    id: nanoid(),
    userId: session.user.id,
    name,
    accessToken: `${TOKEN_PREFIX}${nanoid(32)}`,
  };

  await db.insert(agent).values(newAgent);
  return json(newAgent, 201);
}
