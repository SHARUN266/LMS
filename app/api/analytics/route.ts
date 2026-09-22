import { NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/analytics";

export async function GET() {
  try {
    const data = await getAnalyticsData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/analytics:", error);
    return NextResponse.json({ error: "Failed to generate analytics", details: error.message }, { status: 500 });
  }
}
