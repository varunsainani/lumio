import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, Check, Users } from "lucide-react";
import { getCourseDetail, getEnrollment } from "@/lib/data/course-detail";
import { getCurrentUser } from "@/lib/auth/session";
import { CurriculumAccordion } from "@/components/curriculum-accordion";
import { Stars } from "@/components/stars";
import { buttonVariants } from "@/components/ui/button";
import {
  coverGradient,
  formatDuration,
  formatPrice,
  initials,
} from "@/lib/utils";
import { enrollAction } from "./actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseDetail(slug);
  if (!course) return { title: "Course" };
  return {
    title: course.title,
    description: course.subtitle ?? undefined,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, user, locale] = await Promise.all([
    getCourseDetail(slug),
    getCurrentUser(),
    getLocale(),
  ]);
  if (!course) notFound();

  const t = await getTranslations("courseDetail");
  const tCourse = await getTranslations("course");

  const enrolled = user
    ? !!(await getEnrollment(user.id, course.id))
    : false;

  const lessons = course.sections.flatMap((s) => s.lessons);
  const lessonCount = lessons.length;
  const durationSec = lessons.reduce((sum, l) => sum + l.durationSec, 0);
  const ratingCount = course.reviews.length;
  const ratingAvg =
    ratingCount > 0
      ? course.reviews.reduce((s, r) => s + r.rating, 0) / ratingCount
      : 0;
  const studentCount = course.enrollments.length;
  const price = formatPrice(course.priceCents, locale);
  const dateFmt = new Intl.DateTimeFormat(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  const includes = [
    t("includeLessons", { count: lessonCount }),
    t("includeQuizzes"),
    t("includeAi"),
    t("includeCertificate"),
    t("includeLifetime"),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          {course.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand">
              {course.category.name}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="mt-3 text-lg text-muted-foreground">
              {course.subtitle}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {ratingCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-amber-500">
                  {ratingAvg.toFixed(1)}
                </span>
                <Stars value={ratingAvg} />
                <span>({ratingCount})</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {t("students", { count: studentCount })}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {tCourse(course.level)}
            </span>
          </div>

          {course.instructor && (
            <p className="mt-3 text-sm text-muted-foreground">
              {tCourse("by")}{" "}
              <span className="font-medium text-foreground">
                {course.instructor.name}
              </span>
            </p>
          )}

          {/* Curriculum */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">
              {t("curriculum")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("meta", {
                sections: course.sections.length,
                lessons: lessonCount,
                duration: formatDuration(durationSec),
              })}
            </p>
            <div className="mt-4">
              <CurriculumAccordion
                sections={course.sections.map((s) => ({
                  id: s.id,
                  title: s.title,
                  lessons: s.lessons.map((l) => ({
                    id: l.id,
                    title: l.title,
                    type: l.type,
                    durationSec: l.durationSec,
                    isPreview: l.isPreview,
                  })),
                }))}
              />
            </div>
          </section>

          {/* About */}
          {course.description && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-semibold">
                {t("about")}
              </h2>
              <div className="prose-lumio mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {course.description.split(/\n\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {/* Instructor */}
          {course.instructor && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-semibold">
                {t("instructor")}
              </h2>
              <div className="mt-4 flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
                  {initials(course.instructor.name)}
                </span>
                <div>
                  <p className="font-medium">{course.instructor.name}</p>
                  {course.instructor.headline && (
                    <p className="text-sm text-brand">
                      {course.instructor.headline}
                    </p>
                  )}
                  {course.instructor.bio && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {course.instructor.bio}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">
              {t("reviews")}{" "}
              {ratingCount > 0 && (
                <span className="text-muted-foreground">({ratingCount})</span>
              )}
            </h2>
            {ratingCount === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("noReviews")}
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {course.reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                        {initials(r.user.name)}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{r.user.name}</p>
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} className="scale-90" />
                          <span className="text-xs text-muted-foreground">
                            {dateFmt.format(new Date(r.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {r.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-border bg-card lg:sticky lg:top-20">
            <div
              className="relative aspect-video"
              style={{ backgroundImage: coverGradient(course.slug) }}
            >
              <span className="absolute bottom-3 right-3 rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {tCourse(course.level)}
              </span>
            </div>
            <div className="p-5">
              <div className="font-display text-3xl font-bold">
                {price ?? tCourse("free")}
              </div>

              {enrolled ? (
                <Link
                  href={`/learn/${course.slug}`}
                  className={buttonVariants({ className: "mt-4 w-full" })}
                >
                  {t("goToCourse")}
                </Link>
              ) : (
                <form action={enrollAction} className="mt-4">
                  <input type="hidden" name="slug" value={course.slug} />
                  <button
                    type="submit"
                    className={buttonVariants({ className: "w-full" })}
                  >
                    {price ? t("enroll") : t("enrollFree")}
                  </button>
                </form>
              )}

              <p className="mt-5 text-sm font-medium">{t("includesTitle")}</p>
              <ul className="mt-3 space-y-2.5">
                {includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
