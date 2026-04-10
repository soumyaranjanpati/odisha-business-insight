/**
 * Gemini REST model id for `generateContent` (Google AI Studio API).
 * `gemini-1.5-flash` is no longer available for many keys — use a current model.
 * Override with GEMINI_MODEL if needed (see https://ai.google.dev/api/models ).
 */
export const GEMINI_MODEL_DEFAULT = "gemini-2.5-flash";

export function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL?.trim() || GEMINI_MODEL_DEFAULT;
}

export function geminiGenerateContentUrl(apiKey: string): string {
  const model = getGeminiModelId();
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
}
