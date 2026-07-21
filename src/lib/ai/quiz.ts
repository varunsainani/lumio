import { z } from "zod";
import { getLLM, type ChatMessage } from "./provider";

const LANG: Record<string, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese (Brazil)",
};

const schema = z.object({
  questions: z
    .array(
      z.object({
        prompt: z.string().min(1),
        options: z.array(z.string().min(1)).min(2).max(6),
        correctIndex: z.number().int().min(0),
        explanation: z.string().optional(),
      }),
    )
    .min(1),
});

export type GeneratedQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function extractJson(text: string): string {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) return t.slice(first, last + 1);
  return t;
}

export async function generateQuiz(input: {
  topic: string;
  content?: string;
  count: number;
  locale: string;
}): Promise<GeneratedQuestion[]> {
  const lang = LANG[input.locale] ?? "English";
  const n = Math.min(Math.max(input.count, 1), 10);

  const system = `You create high-quality multiple-choice quiz questions for an online course. Write in ${lang}. Return ONLY valid JSON of the form {"questions":[{"prompt":string,"options":[string,string,string,string],"correctIndex":number,"explanation":string}]}. Each question must have exactly 4 options, exactly one correct answer, "correctIndex" is the 0-based index of the correct option, and "explanation" is one short sentence.`;

  const user = `Create ${n} questions about: ${input.topic}.${
    input.content
      ? `\n\nBase them on this material:\n"""\n${input.content.slice(0, 3000)}\n"""`
      : ""
  }`;

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  const raw = await getLLM().complete(messages, {
    temperature: 0.6,
    maxTokens: 1800,
    json: true,
  });

  let json: unknown;
  try {
    json = JSON.parse(extractJson(raw));
  } catch {
    throw new Error("Model returned invalid JSON");
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new Error("Quiz did not match the expected shape");

  return parsed.data.questions.map((q) => ({
    prompt: q.prompt,
    options: q.options,
    correctIndex: Math.min(Math.max(q.correctIndex, 0), q.options.length - 1),
    explanation: q.explanation ?? "",
  }));
}
