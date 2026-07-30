import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  courses,
  enrollments,
  users,
  type Role,
} from "@/db/schema";

export type PlatformOverview = {
  users: number;
  students: number;
  instructors: number;
  admins: number;
  courses: number;
  publishedCourses: number;
  enrollments: number;
  certificates: number;
};

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const [row] = await db
    .select({
      users: sql<number>`(select count(*)::int from users)`,
      students: sql<number>`(select count(*)::int from users where role = 'student')`,
      instructors: sql<number>`(select count(*)::int from users where role = 'instructor')`,
      admins: sql<number>`(select count(*)::int from users where role = 'admin')`,
      courses: sql<number>`(select count(*)::int from courses)`,
      publishedCourses: sql<number>`(select count(*)::int from courses where published = true)`,
      enrollments: sql<number>`(select count(*)::int from enrollments)`,
      certificates: sql<number>`(select count(*)::int from certificates)`,
    })
    .from(sql`(select 1) as t`);

  return {
    users: Number(row?.users ?? 0),
    students: Number(row?.students ?? 0),
    instructors: Number(row?.instructors ?? 0),
    admins: Number(row?.admins ?? 0),
    courses: Number(row?.courses ?? 0),
    publishedCourses: Number(row?.publishedCourses ?? 0),
    enrollments: Number(row?.enrollments ?? 0),
    certificates: Number(row?.certificates ?? 0),
  };
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  enrolledCount: number;
  courseCount: number;
};

export async function listUsers(search?: string): Promise<AdminUser[]> {
  const term = search?.trim() ? `%${search.trim()}%` : null;
  const match = term ? or(ilike(users.name, term), ilike(users.email, term)) : undefined;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      enrolledCount: sql<number>`count(distinct ${enrollments.id})::int`,
      courseCount: sql<number>`count(distinct ${courses.id})::int`,
    })
    .from(users)
    .leftJoin(enrollments, eq(enrollments.userId, users.id))
    .leftJoin(courses, eq(courses.instructorId, users.id))
    .where(match)
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    createdAt: r.createdAt,
    enrolledCount: Number(r.enrolledCount ?? 0),
    courseCount: Number(r.courseCount ?? 0),
  }));
}

export type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  featured: boolean;
  instructorName: string | null;
  categoryName: string | null;
  studentCount: number;
  createdAt: Date;
};

export async function listAllCourses(search?: string): Promise<AdminCourse[]> {
  const term = search?.trim() ? `%${search.trim()}%` : null;
  const match = term
    ? or(ilike(courses.title, term), ilike(courses.subtitle, term))
    : undefined;

  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      published: courses.published,
      featured: courses.featured,
      instructorName: users.name,
      categoryName: categories.name,
      studentCount: sql<number>`(select count(*)::int from enrollments e where e.course_id = ${courses.id})`,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .leftJoin(users, sql`${courses.instructorId} = ${users.id}`)
    .leftJoin(categories, sql`${courses.categoryId} = ${categories.id}`)
    .where(match)
    .orderBy(desc(courses.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    published: r.published,
    featured: r.featured,
    instructorName: r.instructorName,
    categoryName: r.categoryName,
    studentCount: Number(r.studentCount ?? 0),
    createdAt: r.createdAt,
  }));
}

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  courseCount: number;
};

// Counts ALL courses (published + drafts) per category for the admin view.
export async function listCategoriesWithCounts(): Promise<AdminCategory[]> {
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      icon: categories.icon,
      sortOrder: categories.sortOrder,
      courseCount: sql<number>`count(distinct ${courses.id})::int`,
    })
    .from(categories)
    .leftJoin(courses, eq(courses.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder, categories.name);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    icon: r.icon,
    sortOrder: Number(r.sortOrder ?? 0),
    courseCount: Number(r.courseCount ?? 0),
  }));
}
