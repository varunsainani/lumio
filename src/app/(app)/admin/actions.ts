"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, courses, users, type Role } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

const ROLES: Role[] = ["student", "instructor", "admin"];

async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u || u.role !== "admin") redirect("/dashboard");
  return u;
}

function revalidateAdmin(path: string): void {
  revalidatePath(path);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// ---- Users ----

export async function setUserRole(userId: string, role: string): Promise<void> {
  await requireAdmin();
  if (!ROLES.includes(role as Role)) return;

  await db
    .update(users)
    .set({ role: role as Role })
    .where(eq(users.id, userId));

  revalidateAdmin("/admin/users");
  revalidateAdmin("/admin");
}

// ---- Courses ----

export async function toggleCoursePublished(courseId: string): Promise<void> {
  await requireAdmin();
  const rows = await db
    .select({ published: courses.published })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!rows[0]) return;

  await db
    .update(courses)
    .set({ published: !rows[0].published, updatedAt: new Date() })
    .where(eq(courses.id, courseId));

  revalidateAdmin("/admin/courses");
  revalidateAdmin("/admin");
}

export async function toggleCourseFeatured(courseId: string): Promise<void> {
  await requireAdmin();
  const rows = await db
    .select({ featured: courses.featured })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!rows[0]) return;

  await db
    .update(courses)
    .set({ featured: !rows[0].featured, updatedAt: new Date() })
    .where(eq(courses.id, courseId));

  revalidateAdmin("/admin/courses");
}

export async function deleteCourseAdmin(courseId: string): Promise<void> {
  await requireAdmin();
  await db.delete(courses).where(eq(courses.id, courseId));

  revalidateAdmin("/admin/courses");
  revalidateAdmin("/admin");
}

// ---- Categories ----

export async function addCategory(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const slug = slugify(name) || `category-${Date.now()}`;

  const rawSort = Number(formData.get("sortOrder"));
  const sortOrder = Number.isFinite(rawSort) ? Math.trunc(rawSort) : 0;

  // Skip silently if the slug already exists (unique constraint).
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  if (existing[0]) {
    revalidateAdmin("/admin/categories");
    return;
  }

  await db.insert(categories).values({ slug, name, sortOrder });

  revalidateAdmin("/admin/categories");
  revalidateAdmin("/admin");
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await requireAdmin();
  // courses.categoryId is ON DELETE SET NULL, so courses are preserved.
  await db.delete(categories).where(eq(categories.id, categoryId));

  revalidateAdmin("/admin/categories");
}
