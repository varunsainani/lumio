import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, lessons, sections } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { askTutor, type TutorTurn } from "@/lib/ai/tutor";
import { rateLimit } from "@/lib/ai/limit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!rateLimit(`tutor:${user.id}`, 30, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "rateLimited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    lessonId?: string;
    question?: string;
    history?: TutorTurn[];
    locale?: string;
  } | null;

  if (!body?.lessonId || !body.question?.trim()) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const rows = await db
    .select({
      lessonTitle: lessons.title,
      content: lessons.content,
      courseTitle: courses.title,
    })
    .from(lessons)
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .innerJoin(courses, eq(sections.courseId, courses.id))
    .where(eq(lessons.id, body.lessonId))
    .limit(1);
  const ctx = rows[0];
  if (!ctx) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }

  const history: TutorTurn[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (h) =>
            h &&
            (h.role === "user" || h.role === "assistant") &&
            typeof h.content === "string",
        )
        .slice(-6)
    : [];

  try {
    const answer = await askTutor({
      courseTitle: ctx.courseTitle,
      lessonTitle: ctx.lessonTitle,
      lessonContent: ctx.content?.trim() || ctx.lessonTitle,
      question: String(body.question).slice(0, 1000),
      history,
      locale: body.locale ?? user.locale ?? "en",
    });
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
