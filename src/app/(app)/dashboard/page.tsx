import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Award, BookOpen, Compass, GraduationCap } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getEnrolledCourses, getStudentStats } from "@/lib/data/learning";
import { buttonVariants } from "@/components/ui/button";
import { coverGradient } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("appNav");
  return { title: t("dashboard") };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getTranslations("dashboard");
  const [courses, stats] = await Promise.all([
    getEnrolledCourses(user.id),
    getStudentStats(user.id),
  ]);
  const firstName = user.name.split(" ")[0];

  const statCards = [
    { icon: BookOpen, value: stats.enrolled, label: t("statEnrolled") },
    { icon: GraduationCap, value: stats.completed, label: t("statCompleted") },
    { icon: Award, value: stats.certificates, label: t("statCertificates") },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("greeting", { name: firstName })}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
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
            {t("continueLearning")}
          </h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-brand hover:underline"
          >
            {t("browse")}
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Compass className="h-6 w-6" />
            </span>
            <p className="mt-4 font-medium">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("emptyBody")}
            </p>
            <Link href="/courses" className={buttonVariants({ className: "mt-5" })}>
              {t("browse")}
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
                  <p className="line-clamp-1 font-medium">{c.title}</p>
                  {c.instructorName && (
                    <p className="text-xs text-muted-foreground">
                      {c.instructorName}
                    </p>
                  )}
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${c.progressPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {c.completed ? (
                        <span className="font-medium text-brand">
                          {t("completedTag")}
                        </span>
                      ) : (
                        t("progress", { percent: c.progressPct })
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/learn/${c.slug}`}
                    className={buttonVariants({
                      variant: c.completed ? "outline" : "primary",
                      size: "sm",
                      className: "mt-auto w-fit",
                    })}
                  >
                    {c.completed ? t("review") : t("resume")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
