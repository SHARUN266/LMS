import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function LearnIndexPage() {
  const profile = await db.userProfile.findFirst();
  let dayNum = 2;
  if (profile?.activeDayId) {
    const day = await db.day.findUnique({ where: { id: profile.activeDayId } });
    if (day) dayNum = day.dayNumber;
  }
  redirect(`/learn/module-1/day-${dayNum}`);
}
