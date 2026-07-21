import { getLLM, type ChatMessage } from "./provider";

const LANG: Record<string, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese (Brazil)",
};

export type TutorTurn = { role: "user" | "assistant"; content: string };

export async function askTutor(input: {
  courseTitle: string;
  lessonTitle: string;
  lessonContent: string;
  question: string;
  history: TutorTurn[];
  locale: string;
}): Promise<string> {
  const lang = LANG[input.locale] ?? "English";

  const system = `You are Lumio's friendly study assistant, helping a student with the lesson "${input.lessonTitle}" from the course "${input.courseTitle}".
Use the lesson content below as your primary source. If the answer is not in it, you may use general knowledge but stay on the lesson topic. Keep answers concise and encouraging, use simple language, and use short paragraphs or bullet points when it helps. Always reply in ${lang}.

Lesson content:
"""
${input.lessonContent.slice(0, 4000)}
"""`;

  const history = input.history.slice(-6).map(
    (h): ChatMessage => ({ role: h.role, content: h.content }),
  );

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: input.question },
  ];

  const answer = await getLLM().complete(messages, {
    temperature: 0.5,
    maxTokens: 700,
  });
  return answer.trim();
}
