"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { deleteCategory } from "@/app/(app)/admin/actions";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={t("delete")}
      onClick={() => {
        if (confirm(t("confirmDeleteCategory"))) {
          startTransition(() => deleteCategory(categoryId));
        }
      }}
      className={buttonVariants({ variant: "ghost", size: "icon" })}
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </button>
  );
}
