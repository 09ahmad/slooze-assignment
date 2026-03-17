import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible .env locations, use the first one that exists
const envPaths = [
  path.resolve(__dirname, ".env"),           
  path.resolve(__dirname, "../.env"),      
  path.resolve(__dirname, "../src/.env"),   
];

const envFile = envPaths.find(p => fs.existsSync(p));
if (envFile) {
  dotenv.config({ path: envFile });
} else {
  console.warn("No .env file found, relying on system environment variables");
}

export default defineConfig({
  schema: path.resolve(__dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.resolve(__dirname, "prisma/migrations"),
    seed: "bun run db/src/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});