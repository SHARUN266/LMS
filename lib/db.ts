import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reset stale cached instance in dev if schema models were updated
if (
  globalForPrisma.prisma &&
  (!(globalForPrisma.prisma as any).mentorSession ||
    !(globalForPrisma.prisma as any).skill)
) {
  globalForPrisma.prisma = undefined;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  // Filter out normal serverless PgBouncer idle socket reaping from console noise
  (client as any).$on("error", (e: any) => {
    const msg = typeof e === "string" ? e : e?.message || "";
    if (msg.includes("Closed") || msg.includes("kind: Closed")) {
      return;
    }
    console.error("Prisma Database Error:", e);
  });

  return client;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
