import { PrismaClient } from "../../db/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // In dev it's useful to fail fast if the env is missing
  // The main server entry will crash and surface this clearly
  throw new Error("DATABASE_URL env var is not set");
}

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

export const prisma: PrismaClient =
  global.__prisma ?? new PrismaClient({ adapter });

if (!global.__prisma) {
  global.__prisma = prisma;
}

