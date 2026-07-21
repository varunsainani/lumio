import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  certificates,
  courses,
  enrollments,
  lessonProgress,
  lessons,
  sections,
  users,
  type Level,
} from "@/db/schema";

export async function getCompletedLessonIds(
  userId: string,
  courseId: string,
): Promise<string[]> {
  const rows = await db
    .select({ id: lessonProgress.lessonId })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .where(
      and(eq(lessonProgress.userId, userId), eq(sections.courseId, courseId)),
    );
  return rows.map((r) => r.id);
}

export type EnrolledCourse = {
  id: string;
  slug: string;
  title: string;
  level: Level;
  instructorName: string | null;
  total: number;
  done: number;
  progressPct: number;
  completed: boolean;
};

export async function getEnrolledCourses(
  userId: string,
): Promise<EnrolledCourse[]> {
  const totalSql = sql<number>`(select count(*)::int from lessons l join sections s on l.section_id = s.id where s.course_id = ${courses.id})`;
  const doneSql = sql<number>`(select count(*)::int from lesson_progress lp join lessons l on lp.lesson_id = l.id join sections s on l.section_id = s.id where s.course_id = ${courses.id} and lp.user_id = ${userId})`;

  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      level: courses.level,
      instructorName: users.name,
      total: totalSql,
      done: doneSql,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt));

  return rows.map((r) => {
    const total = Number(r.total ?? 0);
    const done = Number(r.done ?? 0);
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      level: r.level,
      instructorName: r.instructorName,
      total,
      done,
      progressPct,
      completed: total > 0 && done >= total,
    };
  });
}

export async function getStudentStats(userId: string): Promise<{
  enrolled: number;
  completed: number;
  certificates: number;
}> {
  const [row] = await db
    .select({
      enrolled: sql<number>`(select count(*)::int from enrollments where user_id = ${userId})`,
      completed: sql<number>`(select count(*)::int from enrollments where user_id = ${userId} and completed_at is not null)`,
      certificates: sql<number>`(select count(*)::int from certificates where user_id = ${userId})`,
    })
    .from(sql`(select 1) as t`);

  return {
    enrolled: Number(row?.enrolled ?? 0),
    completed: Number(row?.completed ?? 0),
    certificates: Number(row?.certificates ?? 0),
  };
}

export type UserCertificate = {
  code: string;
  courseTitle: string;
  courseSlug: string;
  issuedAt: Date;
};

export async function getUserCertificates(
  userId: string,
): Promise<UserCertificate[]> {
  const rows = await db
    .select({
      code: certificates.code,
      issuedAt: certificates.issuedAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));

  return rows;
}
