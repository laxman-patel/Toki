import { createDb } from "@toki/db";

export const db = createDb(process.env.DATABASE_URL!);
