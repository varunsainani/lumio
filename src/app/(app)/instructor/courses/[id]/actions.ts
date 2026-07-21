"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  courses,
  lessons,
  questions,
  quizzes,
  sections,
  type Course,
  type Level,
  type User,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/session";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = randomBytes(3).toString("hex");
  return `${base || "course"}-${suffix}`;
}

function parseLevel(value: unknown): Level {
  const v = String(value ?? "");
  return LEVELS.includes(v as Level) ? (v as Level) : "beginner";
}

function priceToCents(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function revalidateCourse(id: string): void {
  revalidatePath(`/instructor/courses/${id}`);
}

// Loads the course and verifies the current user owns it (or is admin).
// Redirects to /instructor otherwise. Returns { course, user }.
async function assertCourseOwner(
  courseId: string,
  user: User,
): Promise<Course> {
  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  const course = rows[0];
  if (!course) redirect("/instructor");
  if (course.instructorId !== user.id && user.role !== "admin") {
    redirect("/instructor");
  }
  return course;
}

async function touchCourse(courseId: string): Promise<void> {
  await db
    .update(courses)
    .set({ updatedAt: new Date() })
    .where(eq(courses.id, courseId));
}

// ---- Course ----

export async function createCourse(formData: FormData): Promise<void> {
  const user = await requireRole("instructor", "admin");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/instructor/courses/new");

  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryRaw = String(formData.get("categoryId") ?? "").trim();
  const level = parseLevel(formData.get("level"));
  const priceCents = priceToCents(formData.get("price"));

  const [created] = await db
    .insert(courses)
    .values({
      slug: slugify(title),
      title,
      subtitle: subtitle || null,
      description,
      categoryId: categoryRaw || null,
      instructorId: user.id,
      level,
      priceCents,
      published: false,
    })
    .returning({ id: courses.id });

  revalidatePath("/instructor");
  revalidatePath("/instructor/courses");
  redirect(`/instructor/courses/${created.id}`);
}

export async function updateCourse(
  id: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(id, user);

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryRaw = String(formData.get("categoryId") ?? "").trim();

  await db
    .update(courses)
    .set({
      title,
      subtitle: subtitle || null,
      description,
      categoryId: categoryRaw || null,
      level: parseLevel(formData.get("level")),
      priceCents: priceToCents(formData.get("price")),
      updatedAt: new Date(),
    })
    .where(eq(courses.id, id));

  revalidateCourse(id);
  revalidatePath("/instructor");
  revalidatePath("/instructor/courses");
}

export async function togglePublish(id: string): Promise<void> {
  const user = await requireRole("instructor", "admin");
  const course = await assertCourseOwner(id, user);

  await db
    .update(courses)
    .set({ published: !course.published, updatedAt: new Date() })
    .where(eq(courses.id, id));

  revalidateCourse(id);
  revalidatePath("/instructor");
  revalidatePath("/instructor/courses");
}

export async function deleteCourse(id: string): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(id, user);

  await db.delete(courses).where(eq(courses.id, id));

  revalidatePath("/instructor");
  revalidatePath("/instructor/courses");
  redirect("/instructor/courses");
}

// ---- Sections ----

export async function addSection(
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max(${sections.position}), -1)::int + 1`,
    })
    .from(sections)
    .where(eq(sections.courseId, courseId));

  await db
    .insert(sections)
    .values({ courseId, title, position: Number(next ?? 0) });

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

export async function deleteSection(
  sectionId: string,
  courseId: string,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);

  await db
    .delete(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.courseId, courseId)));

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

// ---- Lessons ----

export async function addLesson(
  sectionId: string,
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);

  // Verify the section belongs to this course.
  const secRows = await db
    .select({ id: sections.id })
    .from(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.courseId, courseId)))
    .limit(1);
  if (!secRows[0]) return;

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const type = formData.get("type") === "text" ? "text" : "video";
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const minutes = Number(formData.get("durationMin"));
  const durationSec =
    Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : 0;
  const isPreview = formData.get("isPreview") === "on";

  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max(${lessons.position}), -1)::int + 1`,
    })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));

  await db.insert(lessons).values({
    sectionId,
    title,
    type,
    videoUrl: type === "video" ? videoUrl || null : null,
    content: type === "text" ? content || null : null,
    durationSec,
    isPreview,
    position: Number(next ?? 0),
  });

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

export async function deleteLesson(
  lessonId: string,
  courseId: string,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);

  // Ensure the lesson belongs to a section in this course before deleting.
  const rows = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .where(and(eq(lessons.id, lessonId), eq(sections.courseId, courseId)))
    .limit(1);
  if (!rows[0]) return;

  await db.delete(lessons).where(eq(lessons.id, lessonId));

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

// ---- Quizzes ----

export async function createQuiz(
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const rawPass = Number(formData.get("passingScore"));
  const passingScorePct =
    Number.isFinite(rawPass) && rawPass > 0
      ? Math.min(100, Math.round(rawPass))
      : 70;

  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max(${quizzes.position}), -1)::int + 1`,
    })
    .from(quizzes)
    .where(eq(quizzes.courseId, courseId));

  await db
    .insert(quizzes)
    .values({ courseId, title, passingScorePct, position: Number(next ?? 0) });

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

export async function deleteQuiz(
  quizId: string,
  courseId: string,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);

  await db
    .delete(quizzes)
    .where(and(eq(quizzes.id, quizId), eq(quizzes.courseId, courseId)));

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

// ---- Questions ----

// Verifies the quiz belongs to the given course. Returns true if ok.
async function quizInCourse(
  quizId: string,
  courseId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: quizzes.id })
    .from(quizzes)
    .where(and(eq(quizzes.id, quizId), eq(quizzes.courseId, courseId)))
    .limit(1);
  return Boolean(rows[0]);
}

async function nextQuestionPosition(quizId: string): Promise<number> {
  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max(${questions.position}), -1)::int + 1`,
    })
    .from(questions)
    .where(eq(questions.quizId, quizId));
  return Number(next ?? 0);
}

export async function addQuestion(
  quizId: string,
  courseId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);
  if (!(await quizInCourse(quizId, courseId))) return;

  const prompt = String(formData.get("prompt") ?? "").trim();
  const options = [0, 1, 2, 3]
    .map((i) => String(formData.get(`option${i}`) ?? "").trim());
  if (!prompt || options.some((o) => !o)) return;

  const rawCorrect = Number(formData.get("correctIndex"));
  const correctIndex =
    Number.isInteger(rawCorrect) && rawCorrect >= 0 && rawCorrect < 4
      ? rawCorrect
      : 0;
  const explanation = String(formData.get("explanation") ?? "").trim();

  await db.insert(questions).values({
    quizId,
    prompt,
    options,
    correctIndex,
    explanation: explanation || null,
    position: await nextQuestionPosition(quizId),
  });

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

export type IncomingQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export async function addGeneratedQuestions(
  quizId: string,
  courseId: string,
  incoming: IncomingQuestion[],
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);
  if (!(await quizInCourse(quizId, courseId))) return;

  const clean = incoming
    .map((q) => ({
      prompt: String(q.prompt ?? "").trim(),
      options: Array.isArray(q.options)
        ? q.options.map((o) => String(o ?? "").trim()).filter(Boolean)
        : [],
      correctIndex: Number(q.correctIndex),
      explanation: String(q.explanation ?? "").trim(),
    }))
    .filter((q) => q.prompt && q.options.length >= 2);
  if (clean.length === 0) return;

  let position = await nextQuestionPosition(quizId);

  await db.insert(questions).values(
    clean.map((q) => ({
      quizId,
      prompt: q.prompt,
      options: q.options,
      correctIndex:
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex < q.options.length
          ? q.correctIndex
          : 0,
      explanation: q.explanation || null,
      position: position++,
    })),
  );

  await touchCourse(courseId);
  revalidateCourse(courseId);
}

export async function deleteQuestion(
  questionId: string,
  courseId: string,
): Promise<void> {
  const user = await requireRole("instructor", "admin");
  await assertCourseOwner(courseId, user);

  // Ensure the question belongs to a quiz in this course.
  const rows = await db
    .select({ id: questions.id })
    .from(questions)
    .innerJoin(quizzes, eq(questions.quizId, quizzes.id))
    .where(and(eq(questions.id, questionId), eq(quizzes.courseId, courseId)))
    .limit(1);
  if (!rows[0]) return;

  await db.delete(questions).where(eq(questions.id, questionId));

  await touchCourse(courseId);
  revalidateCourse(courseId);
}
