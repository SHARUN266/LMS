import { NextResponse } from "next/server";
import { balanceBacklogSchedule, autoDetectMissedAssignments } from "@/lib/backlog-scheduler";

export async function POST() {
  try {
    await autoDetectMissedAssignments();
    const result = await balanceBacklogSchedule();
    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("Backlog balancing error:", error);
    return NextResponse.json({ error: "Failed to balance backlog schedule", details: error.message }, { status: 500 });
  }
}
