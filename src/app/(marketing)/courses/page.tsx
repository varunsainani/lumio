import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CourseCard } from "@/components/course-card";
import { CourseFilters } from "@/components/course-filters";
import {
  getCategoriesWithCounts,
  listCourseCards,
} from "@/lib/data/courses";
import type { Level } from "@/db/schema";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("catalog");
  return { title: t("title"), description: t("subtitle") };
}

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const SORTS = ["popular", "newest", "rating"] as const;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    level?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const t = await getTranslations("catalog");
  const sp = await searchParams;
  const level = LEVELS.includes(sp.level as Level)
    ? (sp.level as Level)
    : undefined;
  const sort = (
    SORTS.includes(sp.sort as (typeof SORTS)[number]) ? sp.sort : "popular"
  ) as (typeof SORTS)[number];

  const [courses, categories] = await Promise.all([
    listCourseCards({
      categorySlug: sp.category || undefined,
      level,
      search: sp.q || undefined,
      sort,
      limit: 60,
    }),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mt-8">
        <CourseFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("resultsCount", { count: courses.length })}
      </p>

      {courses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
