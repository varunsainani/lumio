import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, Clock, Star } from "lucide-react";
import { coverGradient, formatDuration, formatPrice } from "@/lib/utils";
import type { CourseCard as CourseCardData } from "@/lib/data/courses";

export async function CourseCard({ course }: { course: CourseCardData }) {
  const t = await getTranslations("course");
  const locale = await getLocale();
  const price = formatPrice(course.priceCents, locale);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10"
    >
      <div
        className="relative flex aspect-video items-end p-4"
        style={{ backgroundImage: coverGradient(course.slug) }}
      >
        <span className="absolute right-3 top-3 rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {t(course.level)}
        </span>
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-tight text-white drop-shadow-sm">
          {course.title}
        </h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {course.categoryName && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">
            {course.categoryName}
          </span>
        )}
        {course.subtitle && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {course.subtitle}
          </p>
        )}
        {course.instructorName && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("by")} {course.instructorName}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessonCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.durationSec)}
            </span>
            {course.ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                {course.ratingAvg.toFixed(1)}
              </span>
            ) : (
              <span className="font-medium text-brand">{t("newBadge")}</span>
            )}
          </div>
          <span className="text-sm font-bold text-foreground">
            {price ?? t("free")}
          </span>
        </div>
      </div>
    </Link>
  );
}
