import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  courses,
  reviews,
  users,
  type Level,
} from "@/db/schema";

export type CourseCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  level: Level;
  priceCents: number;
  thumbnailUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  instructorName: string | null;
  lessonCount: number;
  durationSec: number;
  studentCount: number;
  ratingAvg: number;
  ratingCount: number;
};

const lessonCountSql = sql<number>`(select count(*)::int from lessons l join sections s on l.section_id = s.id where s.course_id = ${courses.id})`;
const durationSql = sql<number>`coalesce((select sum(l.duration_sec)::int from lessons l join sections s on l.section_id = s.id where s.course_id = ${courses.id}), 0)`;
const studentCountSql = sql<number>`(select count(*)::int from enrollments e where e.course_id = ${courses.id})`;
const ratingAvgSql = sql<number>`coalesce((select round(avg(r.rating)::numeric, 1) from reviews r where r.course_id = ${courses.id}), 0)`;
const ratingCountSql = sql<number>`(select count(*)::int from reviews r where r.course_id = ${courses.id})`;

function selectCards() {
  return db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      subtitle: courses.subtitle,
      level: courses.level,
      priceCents: courses.priceCents,
      thumbnailUrl: courses.thumbnailUrl,
      featured: courses.featured,
      createdAt: courses.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      instructorName: users.name,
      lessonCount: lessonCountSql,
      durationSec: durationSql,
      studentCount: studentCountSql,
      ratingAvg: ratingAvgSql,
      ratingCount: ratingCountSql,
    })
    .from(courses)
    .leftJoin(users, eq(courses.instructorId, users.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id));
}

export async function listCourseCards(opts: {
  featured?: boolean;
  categorySlug?: string;
  level?: Level;
  search?: string;
  sort?: "popular" | "newest" | "rating";
  limit?: number;
} = {}): Promise<CourseCard[]> {
  const conds = [eq(courses.published, true)];
  if (opts.featured) conds.push(eq(courses.featured, true));
  if (opts.categorySlug) conds.push(eq(categories.slug, opts.categorySlug));
  if (opts.level) conds.push(eq(courses.level, opts.level));
  if (opts.search) {
    const term = `%${opts.search}%`;
    const match = or(
      ilike(courses.title, term),
      ilike(courses.subtitle, term),
      ilike(courses.description, term),
    );
    if (match) conds.push(match);
  }

  const order =
    opts.sort === "newest"
      ? desc(courses.createdAt)
      : opts.sort === "rating"
        ? desc(ratingAvgSql)
        : desc(studentCountSql);

  const rows = await selectCards()
    .where(and(...conds))
    .orderBy(order)
    .limit(opts.limit ?? 60);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    level: row.level,
    priceCents: row.priceCents,
    thumbnailUrl: row.thumbnailUrl,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    instructorName: row.instructorName,
    lessonCount: Number(row.lessonCount ?? 0),
    durationSec: Number(row.durationSec ?? 0),
    studentCount: Number(row.studentCount ?? 0),
    ratingAvg: Number(row.ratingAvg ?? 0),
    ratingCount: Number(row.ratingCount ?? 0),
  }));
}

export async function getPlatformStats(): Promise<{
  courses: number;
  students: number;
  instructors: number;
  ratingAvg: number;
}> {
  const [row] = await db
    .select({
      courses: sql<number>`(select count(*)::int from courses where published = true)`,
      students: sql<number>`(select count(*)::int from users where role = 'student')`,
      instructors: sql<number>`(select count(*)::int from users where role = 'instructor')`,
      ratingAvg: sql<number>`coalesce((select round(avg(rating)::numeric, 1) from reviews), 0)`,
    })
    .from(sql`(select 1) as t`);

  return {
    courses: Number(row?.courses ?? 0),
    students: Number(row?.students ?? 0),
    instructors: Number(row?.instructors ?? 0),
    ratingAvg: Number(row?.ratingAvg ?? 0),
  };
}

export type CategoryWithCount = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  courseCount: number;
};

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      icon: categories.icon,
      courseCount: sql<number>`(select count(*)::int from courses c where c.category_id = ${categories.id} and c.published = true)`,
    })
    .from(categories)
    .orderBy(categories.sortOrder);

  return rows.map((r) => ({ ...r, courseCount: Number(r.courseCount ?? 0) }));
}
