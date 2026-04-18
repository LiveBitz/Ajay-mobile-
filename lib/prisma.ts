import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,                       // conservative — Supabase free tier allows ~15 connections
    min: 1,
    idleTimeoutMillis: 60000,      // keep connections alive longer before discarding
    connectionTimeoutMillis: 8000, // give enough time to (re)connect after hot-reload
    allowExitOnIdle: false,        // don't let pool die during dev restarts
  });

  // Reconnect automatically if pool emits an error (e.g. after hot-reload)
  pool.on("error", (err) => {
    console.error("[prisma pool] idle client error:", err.message);
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  var prisma: PrismaClientSingleton | undefined;
}

// Always use singleton — in dev this survives hot-reloads, in prod each instance reuses the global
const prisma = globalThis.prisma ?? prismaClientSingleton();
globalThis.prisma = prisma;

export default prisma;
