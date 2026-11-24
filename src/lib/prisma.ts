import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { pullDb, pushDb } from "./dbsync";

// Hosted demo mode (Vercel): the serverless filesystem is read-only, so the
// pre-seeded SQLite demo database is copied to /tmp on cold start. With a Blob
// store configured, dbsync.ts shares that file across serverless routes.
if (process.env.VERCEL) {
  const target = "/tmp/contentpilot-demo.db";
  try {
    if (!fs.existsSync(target)) {
      fs.copyFileSync(path.join(process.cwd(), "prisma", "demo.db"), target);
    }
    process.env.DATABASE_URL = `file:${target}`;
  } catch (err) {
    console.error("demo database copy failed", err);
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const base = new PrismaClient();
(globalThis as { __sdReconnect?: () => Promise<void> }).__sdReconnect = () => base.$disconnect();

const WRITE_OPS = new Set(["create", "createMany", "update", "updateMany", "upsert", "delete", "deleteMany"]);

const makeClient = () =>
  base.$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        await pullDb(); // hosted demo: load the shared database copy if it changed
        const result = await query(args);
        if (WRITE_OPS.has(operation)) await pushDb();
        return result;
      },
    },
  });

export const prisma = (globalForPrisma.prisma ?? makeClient()) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
