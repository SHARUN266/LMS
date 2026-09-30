import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function LearnIndexPage() {
  const profile = await db.userProfile.findFirst();

  if (profile?.activeDayId) {
    const day = await db.day.findUnique({
      where: { id: profile.activeDayId },
      include: { week: { include: { module: true } } },
    });
    if (day?.week?.module) {
      return redirect(`/learn/${day.week.module.id}/${day.id}`);
    }
  }

  // Fallback: Find the first unlocked day in the active module or track
  const firstUnlocked = await db.day.findFirst({
    where: { isUnlocked: true },
    include: { week: { include: { module: true } } },
    orderBy: { dayNumber: "asc" },
  });

  if (firstUnlocked?.week?.module) {
    return redirect(`/learn/${firstUnlocked.week.module.id}/${firstUnlocked.id}`);
  }

  // Ultimate fallback to Day 1
  return redirect(`/roadmap`);
}
