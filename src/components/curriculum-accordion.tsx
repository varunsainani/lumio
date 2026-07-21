"use client";

import { useState } from "react";
import { ChevronDown, FileText, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, formatDuration } from "@/lib/utils";

type Lesson = {
  id: string;
  title: string;
  type: "video" | "text";
  durationSec: number;
  isPreview: boolean;
};
type Section = { id: string; title: string; lessons: Lesson[] };

export function CurriculumAccordion({ sections }: { sections: Section[] }) {
  const t = useTranslations("courseDetail");
  const tc = useTranslations("course");
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s, i) => [s.id, i === 0])),
  );

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {sections.map((s) => (
        <div key={s.id}>
          <button
            type="button"
            onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
            className="flex w-full items-center justify-between gap-3 bg-card px-4 py-3.5 text-left transition-colors hover:bg-muted"
          >
            <span className="font-medium text-card-foreground">{s.title}</span>
            <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                {tc("lessonsCount", { count: s.lessons.length })}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open[s.id] && "rotate-180",
                )}
              />
            </span>
          </button>
          {open[s.id] && (
            <ul className="bg-background">
              {s.lessons.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-2.5 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    {l.type === "video" ? (
                      <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-foreground">{l.title}</span>
                    {l.isPreview && (
                      <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 text-xs font-medium text-brand">
                        {t("previewBadge")}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDuration(l.durationSec)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
