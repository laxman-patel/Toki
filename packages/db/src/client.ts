import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

export const createDb = () => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a Drizzle client.");
  }

  const pool = new Pool({
    connectionString: databaseUrl
  });

  return drizzle(pool);
};
