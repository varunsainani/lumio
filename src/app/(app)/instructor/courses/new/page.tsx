import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getAllCategories } from "@/lib/data/instructor";
import { CreateCourseForm } from "./create-course-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("instructor");
  return { title: t("newCourseTitle") };
}

export default async function NewCoursePage() {
  await requireRole("instructor", "admin");
  const t = await getTranslations("instructor");
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/instructor/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToCourses")}
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("newCourseTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("newCourseSubtitle")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <CreateCourseForm categories={categories} />
      </div>
    </div>
  );
}
