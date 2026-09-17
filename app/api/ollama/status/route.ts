import { NextResponse } from "next/server";
import { getAIStatus } from "@/lib/ai";

export async function GET() {
  const status = await getAIStatus();
  return NextResponse.json({
    // New unified fields
    activeProvider: status.activeProvider,
    geminiConfigured: status.geminiConfigured,
    geminiModel: "gemini-2.5-flash",
    // Backward compatible fields
    connected: status.geminiConfigured || status.ollamaConnected,
    activeModel: status.geminiConfigured ? "Gemini 2.5 Flash" : status.ollamaModel,
    availableModels: status.geminiConfigured
      ? ["Gemini 2.5 Flash", ...status.availableOllamaModels]
      : status.availableOllamaModels,
    ollamaConnected: status.ollamaConnected,
  });
}
