import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { certificates, courses, users } from "@/db/schema";

export async function getCertificateByCode(code: string) {
  const instructor = alias(users, "instructor");
  const rows = await db
    .select({
      code: certificates.code,
      issuedAt: certificates.issuedAt,
      userName: users.name,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      instructorName: instructor.name,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.userId, users.id))
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .leftJoin(instructor, eq(courses.instructorId, instructor.id))
    .where(eq(certificates.code, code))
    .limit(1);
  return rows[0] ?? null;
}
