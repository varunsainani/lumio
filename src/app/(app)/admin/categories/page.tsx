import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Tag } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { listCategoriesWithCounts } from "@/lib/data/admin";
import { AddCategoryForm } from "@/components/admin/add-category-form";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("categoriesTitle") };
}

export default async function AdminCategoriesPage() {
  await requireRole("admin");
  const t = await getTranslations("admin");
  const categories = await listCategoriesWithCounts();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("categoriesTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("categoriesSubtitle")}</p>
      </header>

      <AddCategoryForm />

      {categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Tag className="h-6 w-6" />
          </span>
          <p className="mt-4 font-medium">{t("noCategories")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noCategoriesBody")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("colCategory")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("colSlug")}
                </th>
                <th className="px-4 py-3 font-medium">{t("colCourses")}</th>
                <th className="px-4 py-3 text-right font-medium">
                  {t("colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Tag className="h-4 w-4" />
                      </span>
                      <p className="line-clamp-1 font-medium">{c.name}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {c.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t("coursesCount", { count: c.courseCount })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DeleteCategoryButton categoryId={c.id} />
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
