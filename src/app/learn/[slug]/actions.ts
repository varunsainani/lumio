"use server";

import { randomBytes } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  certificates,
  enrollments,
  lessonProgress,
  quizAttempts,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function markLessonComplete(
  courseId: string,
  lessonId: string,
): Promise<{ completedCourse: boolean; certificateCode: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { completedCourse: false, certificateCode: null };

  await db
    .insert(lessonProgress)
    .values({ userId: user.id, lessonId })
    .onConflictDoNothing();

  const [counts] = await db
    .select({
      total: sql<number>`(select count(*)::int from lessons l join sections s on l.section_id = s.id where s.course_id = ${courseId})`,
      done: sql<number>`(select count(*)::int from lesson_progress lp join lessons l on lp.lesson_id = l.id join sections s on l.section_id = s.id where s.course_id = ${courseId} and lp.user_id = ${user.id})`,
    })
    .from(sql`(select 1) as t`);

  const total = Number(counts?.total ?? 0);
  const done = Number(counts?.done ?? 0);
  const completedCourse = total > 0 && done >= total;
  let certificateCode: string | null = null;

  if (completedCourse) {
    await db
      .update(enrollments)
      .set({ completedAt: new Date() })
      .where(
        and(
          eq(enrollments.userId, user.id),
          eq(enrollments.courseId, courseId),
        ),
      );

    const code = `LUM-${randomBytes(5).toString("hex").toUpperCase()}`;
    const inserted = await db
      .insert(certificates)
      .values({ userId: user.id, courseId, code })
      .onConflictDoNothing()
      .returning({ code: certificates.code });

    if (inserted[0]) {
      certificateCode = inserted[0].code;
    } else {
      const existing = await db
        .select({ code: certificates.code })
        .from(certificates)
        .where(
          and(
            eq(certificates.userId, user.id),
            eq(certificates.courseId, courseId),
          ),
        )
        .limit(1);
      certificateCode = existing[0]?.code ?? null;
    }
  }

  return { completedCourse, certificateCode };
}

export async function submitQuiz(
  quizId: string,
  answers: number[],
): Promise<{ scorePct: number; passed: boolean; correct: number[] }> {
  const user = await getCurrentUser();
  if (!user) return { scorePct: 0, passed: false, correct: [] };

  const quiz = await db.query.quizzes.findFirst({
    where: (q, { eq }) => eq(q.id, quizId),
    with: {
      questions: { orderBy: (qq, { asc }) => asc(qq.position) },
    },
  });
  if (!quiz) return { scorePct: 0, passed: false, correct: [] };

  const correct = quiz.questions.map((q) => q.correctIndex);
  let right = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) right += 1;
  });
  const scorePct =
    quiz.questions.length > 0
      ? Math.round((right / quiz.questions.length) * 100)
      : 0;
  const passed = scorePct >= quiz.passingScorePct;

  await db.insert(quizAttempts).values({
    userId: user.id,
    quizId,
    scorePct,
    passed,
    answers,
  });

  return { scorePct, passed, correct };
}
