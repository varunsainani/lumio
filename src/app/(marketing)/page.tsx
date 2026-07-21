import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Award,
  Layers,
  Languages,
  ListChecks,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { CategoryIcon } from "@/components/category-icon";
import {
  getCategoriesWithCounts,
  getPlatformStats,
  listCourseCards,
} from "@/lib/data/courses";

export default async function LandingPage() {
  const t = await getTranslations("home");
  const [stats, categories, featured] = await Promise.all([
    getPlatformStats(),
    getCategoriesWithCounts(),
    listCourseCards({ featured: true, limit: 6 }),
  ]);

  const features = [
    { icon: Layers, title: t("feature1Title"), body: t("feature1Body") },
    { icon: ListChecks, title: t("feature2Title"), body: t("feature2Body") },
    { icon: TrendingUp, title: t("feature3Title"), body: t("feature3Body") },
    { icon: Sparkles, title: t("feature4Title"), body: t("feature4Body") },
    { icon: Award, title: t("feature5Title"), body: t("feature5Body") },
    { icon: Languages, title: t("feature6Title"), body: t("feature6Body") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            {t("heroBadge")}
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {t("heroTitlePre")}{" "}
            <span className="text-brand-gradient">{t("heroTitleAccent")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("heroSubtitle")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}
            >
              {t("heroCtaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              {t("heroCtaSecondary")}
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("heroNote")}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card/60 p-6 sm:grid-cols-4">
          <Stat value={`${stats.courses}+`} label={t("statsCourses")} />
          <Stat value={`${stats.students}+`} label={t("statsStudents")} />
          <Stat value={`${stats.instructors}+`} label={t("statsInstructors")} />
          <Stat
            value={stats.ratingAvg > 0 ? stats.ratingAvg.toFixed(1) : "5.0"}
            label={t("statsRating")}
          />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <Section title={t("categoriesTitle")} subtitle={t("categoriesSubtitle")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/courses?category=${c.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-muted"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <CategoryIcon slug={c.slug} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.courseCount}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Featured courses */}
      {featured.length > 0 && (
        <Section title={t("featured")} subtitle={t("featuredSubtitle")}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/courses" className={buttonVariants({ variant: "outline" })}>
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      )}

      {/* Features */}
      <Section title={t("featuresTitle")} subtitle={t("featuresSubtitle")}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section title={t("howTitle")} subtitle={t("howSubtitle")}>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: 1, title: t("how1Title"), body: t("how1Body") },
            { n: 2, title: t("how2Title"), body: t("how2Body") },
            { n: 3, title: t("how3Title"), body: t("how3Body") },
          ].map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient font-display text-lg font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Teach */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                {t("teachTitle")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("teachSubtitle")}</p>
              <ul className="mt-6 space-y-3">
                {[t("teachBullet1"), t("teachBullet2"), t("teachBullet3")].map(
                  (b) => (
                    <li key={b} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                        <ListChecks className="h-3 w-3" />
                      </span>
                      {b}
                    </li>
                  ),
                )}
              </ul>
              <Link
                href="/register"
                className={buttonVariants({ className: "mt-8" })}
              >
                {t("teachCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative hidden h-64 rounded-2xl bg-brand-gradient lg:block">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute inset-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-16 text-center text-white">
          <div className="absolute inset-0 bg-grid opacity-15" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              {t("ctaSubtitle")}
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-brand transition-transform hover:scale-[1.02]"
            >
              {t("ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}
