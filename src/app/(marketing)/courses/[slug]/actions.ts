"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function enrollAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/login`);

  const rows = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);
  const course = rows[0];
  if (!course) redirect("/courses");

  await db
    .insert(enrollments)
    .values({ userId: user.id, courseId: course.id })
    .onConflictDoNothing();

  redirect(`/learn/${slug}`);
}
