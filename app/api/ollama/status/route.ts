import { NextResponse } from "next/server";
import { checkOllamaConnection, OLLAMA_MODEL } from "@/lib/ollama";

export async function GET() {
  const status = await checkOllamaConnection();
  return NextResponse.json({
    connected: status.connected,
    activeModel: OLLAMA_MODEL,
    availableModels: status.models,
  });
}
