"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function CourseFilters({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const t = useTranslations("catalog");
  const tc = useTranslations("course");
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/courses?${next.toString()}`);
  }

  const selectCls =
    "h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          update("q", String(fd.get("q") ?? "").trim());
        }}
        className="relative flex-1"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder={t("searchPlaceholder")}
          className="h-10 w-full min-w-0 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand"
        />
      </form>

      <select
        className={selectCls}
        value={params.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">{t("allCategories")}</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={params.get("level") ?? ""}
        onChange={(e) => update("level", e.target.value)}
      >
        <option value="">{t("allLevels")}</option>
        <option value="beginner">{tc("beginner")}</option>
        <option value="intermediate">{tc("intermediate")}</option>
        <option value="advanced">{tc("advanced")}</option>
      </select>

      <select
        className={selectCls}
        value={params.get("sort") ?? "popular"}
        onChange={(e) => update("sort", e.target.value)}
      >
        <option value="popular">{t("sortPopular")}</option>
        <option value="newest">{t("sortNewest")}</option>
        <option value="rating">{t("sortRating")}</option>
      </select>
    </div>
  );
}
