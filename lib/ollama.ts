// Compatibility layer forwarding to unified lib/ai.ts
export * from "./ai";

import {
  evaluateCodeSubmission,
  chatWithMentor,
  EvaluationResult,
} from "./ai";

export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder";

export async function evaluateWithQwen(
  submittedCode: string,
  assignmentTitle: string,
  problemPrompt: string,
  category: string = "SQL"
): Promise<EvaluationResult> {
  return evaluateCodeSubmission(submittedCode, assignmentTitle, problemPrompt, category);
}

export async function askMentorQwen(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  context: string = ""
): Promise<string> {
  return chatWithMentor(message, history, context);
}
