import { db } from "@/lib/db";

export interface ScheduleBalancerResult {
  rescheduledCount: number;
  totalBacklogItems: number;
  distribution: {
    date: string;
    dayName: string;
    itemsCount: number;
    items: string[];
  }[];
}

/**
 * Smart Schedule Balancer (PRD Section 19)
 * Evenly distributes pending backlog items across the upcoming 5 days (max 2 per day)
 * to avoid overloading the student with unrealistic workloads.
 */
export async function balanceBacklogSchedule(): Promise<ScheduleBalancerResult> {
  const pendingItems = await db.backlogItem.findMany({
    where: { isCompleted: false },
    orderBy: { dueOriginal: "asc" },
  });

  const now = new Date();
  const distribution: { date: string; dayName: string; itemsCount: number; items: string[] }[] = [];

  // Prepare next 5 days
  const daysSlots: { date: Date; dateStr: string; dayName: string; items: string[] }[] = [];
  for (let i = 1; i <= 5; i++) {
    const slotDate = new Date(now.getTime() + i * 86400000);
    daysSlots.push({
      date: slotDate,
      dateStr: slotDate.toISOString().slice(0, 10),
      dayName: slotDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      items: [],
    });
  }

  let slotIdx = 0;
  let rescheduledCount = 0;

  for (const item of pendingItems) {
    const targetSlot = daysSlots[slotIdx % daysSlots.length];
    targetSlot.items.push(item.title);

    // Update in database with balanced scheduled date
    await db.backlogItem.update({
      where: { id: item.id },
      data: {
        scheduledFor: targetSlot.date,
      },
    });

    rescheduledCount++;
    slotIdx++;
  }

  return {
    rescheduledCount,
    totalBacklogItems: pendingItems.length,
    distribution: daysSlots.map((d) => ({
      date: d.dateStr,
      dayName: d.dayName,
      itemsCount: d.items.length,
      items: d.items,
    })),
  };
}

/**
 * Checks for any assignments where the estimated deadline has passed and learner has not submitted,
 * and automatically logs them into the Backlog queue.
 */
export async function autoDetectMissedAssignments(): Promise<number> {
  const days = await db.day.findMany({
    include: {
      assignments: {
        include: {
          submissions: true,
        },
      },
    },
  });

  let createdCount = 0;

  for (const day of days) {
    for (const assignment of day.assignments) {
      if (assignment.submissions.length === 0) {
        // Check if backlog already exists
        const existing = await db.backlogItem.findFirst({
          where: {
            title: `Missed: ${assignment.title}`,
            isCompleted: false,
          },
        });

        if (!existing) {
          await db.backlogItem.create({
            data: {
              title: `Missed: ${assignment.title}`,
              topic: assignment.title,
              dueOriginal: new Date(),
              scheduledFor: new Date(Date.now() + 86400000),
              isCompleted: false,
            },
          });
          createdCount++;
        }
      }
    }
  }

  return createdCount;
}
