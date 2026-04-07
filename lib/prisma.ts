import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
  var prisma: PrismaClientSingleton | undefined;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// Only cache in development to avoid connection pooling issues
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
