"use client";

import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import type { Level } from "@/db/schema";
import { buttonVariants } from "@/components/ui/button";
import { updateCourse } from "./actions";

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const textareaCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1.5 block text-sm font-medium";

function SaveButton() {
  const t = useTranslations("instructor");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ size: "sm" })}
    >
      {pending ? t("saving") : t("saveChanges")}
    </button>
  );
}

export function CourseSettingsForm({
  course,
  categories,
}: {
  course: {
    id: string;
    title: string;
    subtitle: string | null;
    description: string;
    categoryId: string | null;
    level: Level;
    priceCents: number;
  };
  categories: { id: string; slug: string; name: string }[];
}) {
  const t = useTranslations("instructor");
  const levels = ["beginner", "intermediate", "advanced"] as const;
  const updateWithId = updateCourse.bind(null, course.id);

  return (
    <form action={updateWithId} className="space-y-5">
      <div>
        <label className={labelCls} htmlFor="title">
          {t("fieldTitle")}
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={160}
          defaultValue={course.title}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="subtitle">
          {t("fieldSubtitle")}
        </label>
        <input
          id="subtitle"
          name="subtitle"
          maxLength={200}
          defaultValue={course.subtitle ?? ""}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="description">
          {t("fieldDescription")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={course.description}
          className={textareaCls}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="categoryId">
            {t("fieldCategory")}
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={course.categoryId ?? ""}
            className={inputCls}
          >
            <option value="">{t("noCategory")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="level">
            {t("fieldLevel")}
          </label>
          <select
            id="level"
            name="level"
            defaultValue={course.level}
            className={inputCls}
          >
            {levels.map((lv) => (
              <option key={lv} value={lv}>
                {t(`level.${lv}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="price">
            {t("fieldPrice")}
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={(course.priceCents / 100).toString()}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  );
}
