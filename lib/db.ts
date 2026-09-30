import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reset stale cached instance in dev if schema models (like mentorSession or skill) were added
if (globalForPrisma.prisma && (!(globalForPrisma.prisma as any).mentorSession || !(globalForPrisma.prisma as any).skill)) {
  globalForPrisma.prisma = undefined;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

