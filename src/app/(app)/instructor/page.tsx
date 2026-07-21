import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import {
  getInstructorCourses,
  getInstructorStats,
} from "@/lib/data/instructor";
import { buttonVariants } from "@/components/ui/button";
import { coverGradient, formatPrice } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("instructor");
  return { title: t("dashboardTitle") };
}

export default async function InstructorDashboardPage() {
  const user = await requireRole("instructor", "admin");
  const t = await getTranslations("instructor");
  const locale = await getLocale();
  const [courses, stats] = await Promise.all([
    getInstructorCourses(user.id),
    getInstructorStats(user.id),
  ]);
  const firstName = user.name.split(" ")[0];

  const statCards = [
    { icon: BookOpen, value: stats.courses, label: t("statCourses") },
    { icon: CheckCircle2, value: stats.published, label: t("statPublished") },
    { icon: Users, value: stats.students, label: t("statStudents") },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("dashboardSubtitle")}</p>
        </div>
        <Link href="/instructor/courses/new" className={buttonVariants({})}>
          <Plus className="h-4 w-4" />
          {t("newCourse")}
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {t("yourCourses")}
          </h2>
          <Link
            href="/instructor/courses"
            className="text-sm font-medium text-brand hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <BookOpen className="h-6 w-6" />
            </span>
            <p className="mt-4 font-medium">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("emptyBody")}
            </p>
            <Link
              href="/instructor/courses/new"
              className={buttonVariants({ className: "mt-5" })}
            >
              {t("createFirst")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div
                  className="hidden h-24 w-24 shrink-0 rounded-xl sm:block"
                  style={{ backgroundImage: coverGradient(c.slug) }}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 font-medium">{c.title}</p>
                    <span
                      className={
                        c.published
                          ? "shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                          : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {c.published ? t("badgePublished") : t("badgeDraft")}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {t("studentsCount", { count: c.studentCount })}
                    </span>
                    <span>{formatPrice(c.priceCents, locale) ?? t("free")}</span>
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <Link
                      href={`/instructor/courses/${c.id}`}
                      className={buttonVariants({
                        variant: "primary",
                        size: "sm",
                      })}
                    >
                      <Pencil className="h-4 w-4" />
                      {t("edit")}
                    </Link>
                    <Link
                      href={`/courses/${c.slug}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      <Eye className="h-4 w-4" />
                      {t("view")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
