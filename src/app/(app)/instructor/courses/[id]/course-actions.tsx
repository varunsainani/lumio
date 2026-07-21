"use client";

import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { deleteCourse, togglePublish } from "./actions";

function PublishButton({ published }: { published: boolean }) {
  const t = useTranslations("instructor");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
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
      {pending
        ? t("saving")
        : published
          ? t("unpublish")
          : t("publish")}
    </button>
  );
}

function DeleteButton() {
  const t = useTranslations("instructor");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ variant: "danger", size: "sm" })}
      onClick={(e) => {
        if (!confirm(t("confirmDeleteCourse"))) e.preventDefault();
      }}
    >
      <Trash2 className="h-4 w-4" />
      {t("deleteCourse")}
    </button>
  );
}

export function CourseActions({
  courseId,
  published,
}: {
  courseId: string;
  published: boolean;
}) {
  const togglePublishWithId = togglePublish.bind(null, courseId);
  const deleteCourseWithId = deleteCourse.bind(null, courseId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={togglePublishWithId}>
        <PublishButton published={published} />
      </form>
      <form action={deleteCourseWithId}>
        <DeleteButton />
      </form>
    </div>
  );
}
