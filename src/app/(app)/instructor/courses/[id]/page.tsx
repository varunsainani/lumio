import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ClipboardList,
  Eye,
  ListTree,
  Settings2,
} from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getAllCategories, getCourseForEdit } from "@/lib/data/instructor";
import { CourseSettingsForm } from "./course-settings-form";
import { CourseActions } from "./course-actions";
import { CurriculumEditor } from "./curriculum-editor";
import { QuizEditor } from "./quiz-editor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("instructor");
  return { title: t("editorTitle") };
}

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("instructor", "admin");
  const t = await getTranslations("instructor");

  const course = await getCourseForEdit(id);
  if (
    !course ||
    (course.instructorId !== user.id && user.role !== "admin")
  ) {
    redirect("/instructor");
  }

  const categories = await getAllCategories();

  const sections = course.sections.map((s) => ({
    id: s.id,
    title: s.title,
    lessons: s.lessons,
  }));
  const quizzes = course.quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    passingScorePct: q.passingScorePct,
    questions: q.questions.map((qu) => ({
      id: qu.id,
      prompt: qu.prompt,
      options: qu.options,
      correctIndex: qu.correctIndex,
      explanation: qu.explanation,
    })),
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Link
          href="/instructor/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToCourses")}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {course.title}
              </h1>
              <span
                className={
                  course.published
                    ? "rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                }
              >
                {course.published ? t("badgePublished") : t("badgeDraft")}
              </span>
            </div>
            <Link
              href={`/courses/${course.slug}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("viewPublic")}
            </Link>
          </div>
          <CourseActions courseId={course.id} published={course.published} />
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Settings2 className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-semibold">
            {t("sectionSettings")}
          </h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <CourseSettingsForm
            course={{
              id: course.id,
              title: course.title,
              subtitle: course.subtitle,
              description: course.description,
              categoryId: course.categoryId,
              level: course.level,
              priceCents: course.priceCents,
            }}
            categories={categories}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <ListTree className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-semibold">
            {t("sectionCurriculum")}
          </h2>
        </div>
        <CurriculumEditor courseId={course.id} sections={sections} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <ClipboardList className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-semibold">
            {t("sectionQuizzes")}
          </h2>
        </div>
        <QuizEditor
          courseId={course.id}
          courseTitle={course.title}
          quizzes={quizzes}
        />
      </section>
    </div>
  );
}
