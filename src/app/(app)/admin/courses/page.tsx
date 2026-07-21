import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { listAllCourses } from "@/lib/data/admin";
import { coverGradient } from "@/lib/utils";
import { SearchBox } from "@/components/admin/search-box";
import {
  DeleteCourseButton,
  FeatureToggle,
  PublishToggle,
} from "@/components/admin/course-controls";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("coursesTitle") };
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("admin");
  const t = await getTranslations("admin");
  const { q } = await searchParams;
  const courses = await listAllCourses(q);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("coursesTitle")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("coursesSubtitle")}</p>
        </div>
        <SearchBox basePath="/admin/courses" />
      </header>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <BookOpen className="h-6 w-6" />
          </span>
          <p className="mt-4 font-medium">{t("noCourses")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noCoursesBody")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("colCourse")}</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  {t("colInstructor")}
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  {t("colCategory")}
                </th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("colStudents")}
                </th>
                <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                <th className="px-4 py-3 text-right font-medium">
                  {t("colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="hidden h-10 w-10 shrink-0 rounded-lg sm:block"
                        style={{ backgroundImage: coverGradient(c.slug) }}
                      />
                      <Link
                        href={`/courses/${c.slug}`}
                        className="line-clamp-1 min-w-0 font-medium hover:text-brand hover:underline"
                      >
                        {c.title}
                      </Link>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {c.instructorName ?? t("unknown")}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {c.categoryName ?? t("uncategorized")}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {c.studentCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.published
                          ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {c.published ? t("badgePublished") : t("badgeDraft")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <PublishToggle
                        courseId={c.id}
                        published={c.published}
                      />
                      <FeatureToggle
                        courseId={c.id}
                        featured={c.featured}
                      />
                      <DeleteCourseButton courseId={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
