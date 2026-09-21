import { NextResponse } from "next/server";
import { getAIStatus } from "@/lib/ai";

export async function GET() {
  const status = await getAIStatus();
  return NextResponse.json({
    activeProvider: status.activeProvider,
    geminiConfigured: status.geminiConfigured,
    model: status.model,
    connected: true,
  });
}
