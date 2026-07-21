"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import {
  FileText,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import type { Lesson } from "@/db/schema";
import { buttonVariants } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import {
  addLesson,
  addSection,
  deleteLesson,
  deleteSection,
} from "./actions";

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const textareaCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1.5 block text-sm font-medium";

type SectionData = {
  id: string;
  title: string;
  lessons: Lesson[];
};

function PendingButton({
  label,
  variant = "primary",
  size = "sm",
}: {
  label: string;
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md";
}) {
  const t = useTranslations("instructor");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ variant, size })}
    >
      <Plus className="h-4 w-4" />
      {pending ? t("saving") : label}
    </button>
  );
}

function IconDeleteButton({ confirmMsg }: { confirmMsg: string }) {
  const t = useTranslations("instructor");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={t("delete")}
      onClick={(e) => {
        if (!confirm(confirmMsg)) e.preventDefault();
      }}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function AddLessonForm({
  sectionId,
  courseId,
}: {
  sectionId: string;
  courseId: string;
}) {
  const t = useTranslations("instructor");
  const [type, setType] = useState<"video" | "text">("video");
  const action = addLesson.bind(null, sectionId, courseId);

  return (
    <form action={action} className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-3">
      <p className="text-sm font-medium">{t("addLesson")}</p>
      <div>
        <label className={labelCls} htmlFor={`ltitle-${sectionId}`}>
          {t("fieldLessonTitle")}
        </label>
        <input
          id={`ltitle-${sectionId}`}
          name="title"
          required
          maxLength={160}
          placeholder={t("fieldLessonTitlePlaceholder")}
          className={inputCls}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor={`ltype-${sectionId}`}>
            {t("fieldLessonType")}
          </label>
          <select
            id={`ltype-${sectionId}`}
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "video" | "text")}
            className={inputCls}
          >
            <option value="video">{t("typeVideo")}</option>
            <option value="text">{t("typeText")}</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor={`ldur-${sectionId}`}>
            {t("fieldDuration")}
          </label>
          <input
            id={`ldur-${sectionId}`}
            name="durationMin"
            type="number"
            min={0}
            step={1}
            defaultValue={5}
            className={inputCls}
          />
        </div>
      </div>

      {type === "video" ? (
        <div>
          <label className={labelCls} htmlFor={`lvideo-${sectionId}`}>
            {t("fieldVideoUrl")}
          </label>
          <input
            id={`lvideo-${sectionId}`}
            name="videoUrl"
            type="url"
            placeholder="https://..."
            className={inputCls}
          />
        </div>
      ) : (
        <div>
          <label className={labelCls} htmlFor={`lcontent-${sectionId}`}>
            {t("fieldContent")}
          </label>
          <textarea
            id={`lcontent-${sectionId}`}
            name="content"
            rows={4}
            placeholder={t("fieldContentPlaceholder")}
            className={textareaCls}
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPreview"
          className="h-4 w-4 rounded border-input accent-[var(--brand)]"
        />
        {t("fieldPreview")}
      </label>

      <div className="flex justify-end">
        <PendingButton label={t("addLesson")} />
      </div>
    </form>
  );
}

function AddSectionForm({ courseId }: { courseId: string }) {
  const t = useTranslations("instructor");
  const action = addSection.bind(null, courseId);
  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-border p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className={labelCls} htmlFor="new-section-title">
          {t("addSection")}
        </label>
        <input
          id="new-section-title"
          name="title"
          required
          maxLength={160}
          placeholder={t("fieldSectionTitlePlaceholder")}
          className={inputCls}
        />
      </div>
      <PendingButton label={t("addSection")} variant="outline" size="md" />
    </form>
  );
}

export function CurriculumEditor({
  courseId,
  sections,
}: {
  courseId: string;
  sections: SectionData[];
}) {
  const t = useTranslations("instructor");
  const [openLessonForm, setOpenLessonForm] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t("noSections")}
        </p>
      )}

      {sections.map((section, si) => (
        <div
          key={section.id}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("sectionLabel", { index: si + 1 })}
              </p>
              <p className="truncate font-medium">{section.title}</p>
            </div>
            <form action={deleteSection.bind(null, section.id, courseId)}>
              <IconDeleteButton confirmMsg={t("confirmDeleteSection")} />
            </form>
          </div>

          {section.lessons.length > 0 && (
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
              {section.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {lesson.type === "video" ? (
                      <Video className="h-3.5 w-3.5" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(lesson.durationSec)}
                    </p>
                  </div>
                  {lesson.isPreview && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                      {t("previewBadge")}
                    </span>
                  )}
                  <form action={deleteLesson.bind(null, lesson.id, courseId)}>
                    <IconDeleteButton confirmMsg={t("confirmDeleteLesson")} />
                  </form>
                </li>
              ))}
            </ul>
          )}

          {openLessonForm === section.id ? (
            <AddLessonForm sectionId={section.id} courseId={courseId} />
          ) : (
            <button
              type="button"
              onClick={() => setOpenLessonForm(section.id)}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "mt-3",
              })}
            >
              <Plus className="h-4 w-4" />
              {t("addLesson")}
            </button>
          )}
        </div>
      ))}

      <AddSectionForm courseId={courseId} />
    </div>
  );
}
