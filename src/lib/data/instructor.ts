import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  courses,
  enrollments,
  lessons,
  sections,
  type Level,
} from "@/db/schema";

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

export async function getInstructorCourses(
  userId: string,
): Promise<InstructorCourse[]> {
  // Left-join the child tables and count distinct rows. Correlated subqueries
  // that interpolate `courses.id` render the column unqualified in the select
  // context, which is ambiguous inside a joined subquery, so we aggregate here.
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      published: courses.published,
      priceCents: courses.priceCents,
      level: courses.level,
      studentCount: sql<number>`count(distinct ${enrollments.id})::int`,
      lessonCount: sql<number>`count(distinct ${lessons.id})::int`,
    })
    .from(courses)
    .leftJoin(enrollments, eq(enrollments.courseId, courses.id))
    .leftJoin(sections, eq(sections.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.sectionId, sections.id))
    .where(eq(courses.instructorId, userId))
    .groupBy(courses.id)
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
