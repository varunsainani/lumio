import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, type Enrollment } from "@/db/schema";

export async function getCourseDetail(slug: string) {
  return db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.slug, slug),
    with: {
      instructor: true,
      category: true,
      sections: {
        orderBy: (s, { asc }) => asc(s.position),
        with: {
          lessons: { orderBy: (l, { asc }) => asc(l.position) },
        },
      },
      reviews: {
        orderBy: (r, { desc }) => desc(r.createdAt),
        with: { user: true },
      },
      quizzes: {
        orderBy: (q, { asc }) => asc(q.position),
        with: {
          questions: { orderBy: (qq, { asc }) => asc(qq.position) },
        },
      },
      enrollments: { columns: { id: true } },
    },
  });
}

export type CourseDetail = NonNullable<
  Awaited<ReturnType<typeof getCourseDetail>>
>;

export async function getEnrollment(
  userId: string,
  courseId: string,
): Promise<Enrollment | null> {
  const rows = await db
    .select()
    .from(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    )
    .limit(1);
  return rows[0] ?? null;
}
