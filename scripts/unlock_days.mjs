import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 10;
  
  if (process.argv[2] === "all") {
    const updated = await prisma.day.updateMany({
      data: { isUnlocked: true }
    });
    console.log(`✅ Unlocked ALL ${updated.count} days in the curriculum!`);
  } else {
    const updated = await prisma.day.updateMany({
      where: { dayNumber: { lte: count } },
      data: { isUnlocked: true }
    });
    console.log(`✅ Unlocked Days 1 to ${count} (${updated.count} days)!`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
