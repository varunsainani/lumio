import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { generateQuiz } from "@/lib/ai/quiz";
import { rateLimit } from "@/lib/ai/limit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "instructor" && user.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!rateLimit(`quiz:${user.id}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "rateLimited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    topic?: string;
    content?: string;
    count?: number;
    locale?: string;
  } | null;

  if (!body?.topic?.trim()) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const questions = await generateQuiz({
      topic: String(body.topic).slice(0, 300),
      content: body.content ? String(body.content).slice(0, 4000) : undefined,
      count: Number(body.count) || 5,
      locale: body.locale ?? user.locale ?? "en",
    });
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
