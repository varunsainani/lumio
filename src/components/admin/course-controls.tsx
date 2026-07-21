"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Sparkles, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  deleteCourseAdmin,
  toggleCourseFeatured,
  toggleCoursePublished,
} from "@/app/(app)/admin/actions";

export function PublishToggle({
  courseId,
  published,
}: {
  courseId: string;
  published: boolean;
}) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleCoursePublished(courseId))}
      className={buttonVariants({
        variant: published ? "outline" : "primary",
        size: "sm",
      })}
    >
      {published ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {published ? t("unpublish") : t("publish")}
      </span>
    </button>
  );
}

export function FeatureToggle({
  courseId,
  featured,
}: {
  courseId: string;
  featured: boolean;
}) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={featured}
      title={featured ? t("unfeature") : t("feature")}
      onClick={() => startTransition(() => toggleCourseFeatured(courseId))}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        featured && "text-amber-500 hover:text-amber-500",
      )}
    >
      {featured ? (
        <Star className="h-4 w-4 fill-current" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      <span className="hidden lg:inline">
        {featured ? t("unfeature") : t("feature")}
      </span>
    </button>
  );
}

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={t("delete")}
      onClick={() => {
        if (confirm(t("confirmDeleteCourse"))) {
          startTransition(() => deleteCourseAdmin(courseId));
        }
      }}
      className={buttonVariants({ variant: "ghost", size: "icon" })}
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </button>
  );
}
