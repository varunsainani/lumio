"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { addCategory } from "@/app/(app)/admin/actions";

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1.5 block text-sm font-medium";

function SubmitButton() {
  const t = useTranslations("admin");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ className: "w-full sm:w-auto" })}
    >
      <Plus className="h-4 w-4" />
      {pending ? t("adding") : t("addCategory")}
    </button>
  );
}

export function AddCategoryForm() {
  const t = useTranslations("admin");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addCategory(formData);
        formRef.current?.reset();
      }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <p className="font-medium">{t("addCategory")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("addCategoryHint")}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <label className={labelCls} htmlFor="name">
            {t("fieldCategoryName")}
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={60}
            placeholder={t("fieldCategoryNamePlaceholder")}
            className={inputCls}
          />
        </div>
        <div className="sm:w-28">
          <label className={labelCls} htmlFor="sortOrder">
            {t("fieldSortOrder")}
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={0}
            className={inputCls}
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  );
}
