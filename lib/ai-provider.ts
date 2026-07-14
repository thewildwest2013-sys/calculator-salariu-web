import "server-only";

type AIMessage = { role: "system" | "user" | "assistant"; content: string };

type AIResponse = { text: string; provider: "cloudflare" | "groq"; model: string };

async function cloudflare(messages: AIMessage[]): Promise<AIResponse> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_AI_API_TOKEN;
  const model = process.env.CLOUDFLARE_AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
  if (!accountId || !token) throw new Error("CLOUDFLARE_AI_NOT_CONFIGURED");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.15, max_tokens: 1200, response_format: { type: "json_object" } }),
    signal: AbortSignal.timeout(25000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.errors?.[0]?.message || payload?.error?.message || "CLOUDFLARE_AI_ERROR");
  const text = payload?.choices?.[0]?.message?.content || payload?.result?.response;
  if (!text) throw new Error("CLOUDFLARE_AI_EMPTY");
  return { text, provider: "cloudflare", model };
}

async function groq(messages: AIMessage[]): Promise<AIResponse> {
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "moonshotai/kimi-k2-instruct";
  if (!key) throw new Error("GROQ_NOT_CONFIGURED");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.15, max_completion_tokens: 1200, response_format: { type: "json_object" } }),
    signal: AbortSignal.timeout(25000),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "GROQ_AI_ERROR");
  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("GROQ_AI_EMPTY");
  return { text, provider: "groq", model };
}

export async function runAI(messages: AIMessage[]): Promise<AIResponse> {
  const preferred = process.env.AI_PROVIDER || "cloudflare";
  const providers = preferred === "groq" ? [groq, cloudflare] : [cloudflare, groq];
  let lastError: unknown;
  for (const provider of providers) {
    try { return await provider(messages); } catch (error) { lastError = error; }
  }
  throw lastError instanceof Error ? lastError : new Error("AI_NOT_CONFIGURED");
}
