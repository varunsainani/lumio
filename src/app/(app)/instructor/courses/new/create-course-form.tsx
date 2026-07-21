"use client";

import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { buttonVariants } from "@/components/ui/button";
import { createCourse } from "../[id]/actions";

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const textareaCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1.5 block text-sm font-medium";

function SubmitButton() {
  const t = useTranslations("instructor");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ className: "w-full sm:w-auto" })}
    >
      {pending ? t("creating") : t("createCourse")}
    </button>
  );
}

export function CreateCourseForm({
  categories,
}: {
  categories: { id: string; slug: string; name: string }[];
}) {
  const t = useTranslations("instructor");
  const levels = ["beginner", "intermediate", "advanced"] as const;

  return (
    <form action={createCourse} className="space-y-5">
      <div>
        <label className={labelCls} htmlFor="title">
          {t("fieldTitle")}
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={160}
          placeholder={t("fieldTitlePlaceholder")}
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
          placeholder={t("fieldSubtitlePlaceholder")}
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
          placeholder={t("fieldDescriptionPlaceholder")}
          className={textareaCls}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="categoryId">
            {t("fieldCategory")}
          </label>
          <select id="categoryId" name="categoryId" className={inputCls}>
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
          <select id="level" name="level" defaultValue="beginner" className={inputCls}>
            {levels.map((lv) => (
              <option key={lv} value={lv}>
                {t(`level.${lv}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sm:max-w-xs">
        <label className={labelCls} htmlFor="price">
          {t("fieldPrice")}
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          defaultValue={0}
          placeholder="0"
          className={inputCls}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {t("fieldPriceHint")}
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
