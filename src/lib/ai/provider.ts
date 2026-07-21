// Provider-agnostic LLM interface. Groq is the active default (free, fast);
// Google Gemini and Anthropic Claude are implemented and switchable through the
// LLM_PROVIDER env var, so the same app can run on any of them with no code
// change. Keys live in the backend env only and are never sent to the browser.

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompleteOptions = {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
};

export interface LLMProvider {
  readonly name: string;
  complete(messages: ChatMessage[], opts?: CompleteOptions): Promise<string>;
}

async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs = 30000,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`LLM request failed (${res.status}): ${body.slice(0, 200)}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

class GroqProvider implements LLMProvider {
  readonly name = "groq";
  async complete(messages: ChatMessage[], opts: CompleteOptions = {}) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set");
    const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    const data = (await fetchJson(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: opts.temperature ?? 0.5,
          max_tokens: opts.maxTokens ?? 800,
          ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        }),
      },
    )) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
  }
}

class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  async complete(messages: ChatMessage[], opts: CompleteOptions = {}) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    const model = process.env.GEMINI_MODEL ?? "gemini-flash-latest";

    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const data = (await fetchJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          contents,
          generationConfig: {
            temperature: opts.temperature ?? 0.5,
            maxOutputTokens: opts.maxTokens ?? 800,
            ...(opts.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      },
    )) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
}

class ClaudeProvider implements LLMProvider {
  readonly name = "claude";
  async complete(messages: ChatMessage[], opts: CompleteOptions = {}) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const turns = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const data = (await fetchJson("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? 800,
        temperature: opts.temperature ?? 0.5,
        ...(system ? { system } : {}),
        messages: turns,
      }),
    })) as { content?: { text?: string }[] };
    return data.content?.[0]?.text ?? "";
  }
}

export function getLLM(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER ?? "groq").toLowerCase();
  if (provider === "gemini") return new GeminiProvider();
  if (provider === "claude") return new ClaudeProvider();
  return new GroqProvider();
}
