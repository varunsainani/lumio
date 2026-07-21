import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, Eye, Pencil, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getInstructorCourses } from "@/lib/data/instructor";
import { buttonVariants } from "@/components/ui/button";
import { coverGradient, formatPrice } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("instructor");
  return { title: t("myCoursesTitle") };
}

export default async function InstructorCoursesPage() {
  const user = await requireRole("instructor", "admin");
  const t = await getTranslations("instructor");
  const locale = await getLocale();
  const courses = await getInstructorCourses(user.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("myCoursesTitle")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("myCoursesSubtitle")}</p>
        </div>
        <Link href="/instructor/courses/new" className={buttonVariants({})}>
          <Plus className="h-4 w-4" />
          {t("newCourse")}
        </Link>
      </header>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <BookOpen className="h-6 w-6" />
          </span>
          <p className="mt-4 font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyBody")}</p>
          <Link
            href="/instructor/courses/new"
            className={buttonVariants({ className: "mt-5" })}
          >
            {t("createFirst")}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("colCourse")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("colStatus")}
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  {t("colStudents")}
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  {t("colLessons")}
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  {t("colPrice")}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="hidden h-10 w-10 shrink-0 rounded-lg sm:block"
                        style={{ backgroundImage: coverGradient(c.slug) }}
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium">{c.title}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {t(`level.${c.level}`)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
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
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {c.studentCount}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {c.lessonCount}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatPrice(c.priceCents, locale) ?? t("free")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/instructor/courses/${c.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">{t("edit")}</span>
                      </Link>
                      <Link
                        href={`/courses/${c.slug}`}
                        aria-label={t("view")}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
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
