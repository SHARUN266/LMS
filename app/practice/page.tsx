import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function PracticeIndexPage() {
  const profile = await db.userProfile.findFirst();
  let dayNum = 2;
  if (profile?.activeDayId) {
    const day = await db.day.findUnique({ where: { id: profile.activeDayId } });
    if (day) dayNum = day.dayNumber;
  }
  redirect(`/practice/day-${dayNum}`);
}
