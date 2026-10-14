import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Next.js loads .env by itself, so this file doesn't need `dotenv`.
// (prisma.config.ts and prisma/seed.ts still use dotenv, because they run
// outside of Next.js.)

// In development, Next.js re-runs this module every time you save a file. Without
// this cache, each save would create another PrismaClient with its own pool of
// database connections, and you'd eventually hit Neon's connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // The adapter creates and manages its own `pg` connection pool. The old code
  // also created a separate `new Pool(...)` that was never used.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
