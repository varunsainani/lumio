import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, courses, type Level } from "@/db/schema";

export type InstructorCourse = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  priceCents: number;
  level: Level;
  studentCount: number;
  lessonCount: number;
};

const studentCountSql = sql<number>`(select count(*)::int from enrollments e where e.course_id = ${courses.id})`;
const lessonCountSql = sql<number>`(select count(*)::int from lessons l join sections s on l.section_id = s.id where s.course_id = ${courses.id})`;

export async function getInstructorCourses(
  userId: string,
): Promise<InstructorCourse[]> {
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      published: courses.published,
      priceCents: courses.priceCents,
      level: courses.level,
      studentCount: studentCountSql,
      lessonCount: lessonCountSql,
    })
    .from(courses)
    .where(eq(courses.instructorId, userId))
    .orderBy(desc(courses.updatedAt));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    published: r.published,
    priceCents: r.priceCents,
    level: r.level,
    studentCount: Number(r.studentCount ?? 0),
    lessonCount: Number(r.lessonCount ?? 0),
  }));
}

export async function getInstructorStats(userId: string): Promise<{
  courses: number;
  published: number;
  students: number;
}> {
  const [row] = await db
    .select({
      courses: sql<number>`(select count(*)::int from courses where instructor_id = ${userId})`,
      published: sql<number>`(select count(*)::int from courses where instructor_id = ${userId} and published = true)`,
      students: sql<number>`(select count(*)::int from enrollments e join courses c on e.course_id = c.id where c.instructor_id = ${userId})`,
    })
    .from(sql`(select 1) as t`);

  return {
    courses: Number(row?.courses ?? 0),
    published: Number(row?.published ?? 0),
    students: Number(row?.students ?? 0),
  };
}

export async function getCourseForEdit(courseId: string) {
  return db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      category: true,
      sections: {
        orderBy: (s, { asc }) => [asc(s.position)],
        with: {
          lessons: {
            orderBy: (l, { asc }) => [asc(l.position)],
          },
        },
      },
      quizzes: {
        orderBy: (q, { asc }) => [asc(q.position)],
        with: {
          questions: {
            orderBy: (q, { asc }) => [asc(q.position)],
          },
        },
      },
    },
  });
}

export type CourseForEdit = NonNullable<
  Awaited<ReturnType<typeof getCourseForEdit>>
>;

export async function getAllCategories(): Promise<
  { id: string; slug: string; name: string }[]
> {
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
    })
    .from(categories)
    .orderBy(categories.sortOrder);
}
