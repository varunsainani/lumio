"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  FileText,
  ListChecks,
  Loader2,
  Menu,
  PlayCircle,
  Sparkles,
  X,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { AiTutorPanel } from "./ai-tutor-panel";
import { QuizRunner, type PlayerQuiz } from "./quiz-runner";
import { markLessonComplete } from "@/app/learn/[slug]/actions";

type PlayerLesson = {
  id: string;
  title: string;
  type: "video" | "text";
  videoUrl: string | null;
  content: string | null;
  durationSec: number;
};
type PlayerSection = { id: string; title: string; lessons: PlayerLesson[] };
export type PlayerCourse = {
  id: string;
  slug: string;
  title: string;
  sections: PlayerSection[];
  quizzes: PlayerQuiz[];
};

type NavRef = { kind: "lesson" | "quiz"; id: string };

export function CoursePlayer({
  course,
  completedLessonIds,
}: {
  course: PlayerCourse;
  completedLessonIds: string[];
}) {
  const t = useTranslations("player");
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(completedLessonIds),
  );
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [completion, setCompletion] = useState<{
    done: boolean;
    code: string | null;
  }>({ done: false, code: null });

  const lessonItems = useMemo(
    () =>
      course.sections.flatMap((s) =>
        s.lessons.map((l) => ({ ...l, sectionId: s.id })),
      ),
    [course],
  );

  const nav: NavRef[] = useMemo(
    () => [
      ...lessonItems.map((l) => ({ kind: "lesson" as const, id: l.id })),
      ...course.quizzes.map((q) => ({ kind: "quiz" as const, id: q.id })),
    ],
    [lessonItems, course.quizzes],
  );

  const [current, setCurrent] = useState<NavRef>(() => {
    const firstIncomplete = lessonItems.find((l) => !completed.has(l.id));
    if (firstIncomplete) return { kind: "lesson", id: firstIncomplete.id };
    return nav[0] ?? { kind: "lesson", id: "" };
  });

  const totalLessons = lessonItems.length;
  const doneCount = lessonItems.filter((l) => completed.has(l.id)).length;
  const progressPct = totalLessons
    ? Math.round((doneCount / totalLessons) * 100)
    : 0;

  const currentIndex = nav.findIndex(
    (n) => n.kind === current.kind && n.id === current.id,
  );
  const prev = currentIndex > 0 ? nav[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < nav.length - 1
      ? nav[currentIndex + 1]
      : null;

  const currentLesson =
    current.kind === "lesson"
      ? lessonItems.find((l) => l.id === current.id) ?? null
      : null;
  const currentQuiz =
    current.kind === "quiz"
      ? course.quizzes.find((q) => q.id === current.id) ?? null
      : null;

  const lessonNumber =
    current.kind === "lesson"
      ? lessonItems.findIndex((l) => l.id === current.id) + 1
      : 0;

  function go(item: NavRef) {
    setCurrent(item);
    setSidebarOpen(false);
    setAiOpen(false);
    window.scrollTo({ top: 0 });
  }

  function complete() {
    if (!currentLesson) return;
    if (completed.has(currentLesson.id)) {
      if (next) go(next);
      return;
    }
    const id = currentLesson.id;
    startTransition(async () => {
      const res = await markLessonComplete(course.id, id);
      setCompleted((s) => new Set(s).add(id));
      if (res.completedCourse)
        setCompletion({ done: true, code: res.certificateCode });
      if (next) go(next);
    });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
        <p className="mt-3 line-clamp-2 font-display font-semibold">
          {course.title}
        </p>
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {doneCount}/{totalLessons}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {course.sections.map((s) => (
          <div key={s.id} className="mb-2">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {s.title}
            </p>
            <ul>
              {s.lessons.map((l) => {
                const active = current.kind === "lesson" && current.id === l.id;
                const isDone = completed.has(l.id);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => go({ kind: "lesson", id: l.id })}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-brand/10 text-brand"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : l.type === "video" ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="line-clamp-2 flex-1">{l.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDuration(l.durationSec)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {course.quizzes.length > 0 && (
          <div className="mb-2">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("quizLabel")}
            </p>
            <ul>
              {course.quizzes.map((q) => {
                const active = current.kind === "quiz" && current.id === q.id;
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => go({ kind: "quiz", id: q.id })}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-brand/10 text-brand"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <ListChecks className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="line-clamp-2 flex-1">{q.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-80 shrink-0 border-r border-border bg-card/40 lg:sticky lg:top-0 lg:block lg:h-screen">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-medium"
        >
          <Menu className="h-5 w-5" />
          {t("overview")}
        </button>
        <span className="text-xs text-muted-foreground">
          {doneCount}/{totalLessons}
        </span>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-card shadow-2xl">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="relative flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {completion.done && (
            <div className="mb-6 flex flex-col items-center rounded-2xl border border-brand/40 bg-brand/10 p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Award className="h-6 w-6" />
              </span>
              <p className="mt-3 font-display text-lg font-semibold">
                {t("courseComplete")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("courseCompleteBody")}
              </p>
              {completion.code && (
                <Link
                  href={`/certificate/${completion.code}`}
                  className={buttonVariants({ className: "mt-4" })}
                >
                  {t("viewCertificate")}
                </Link>
              )}
            </div>
          )}

          {currentLesson && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("lessonOf", { index: lessonNumber, total: totalLessons })}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
                {currentLesson.title}
              </h1>

              {currentLesson.type === "video" && currentLesson.videoUrl ? (
                <video
                  key={currentLesson.id}
                  src={currentLesson.videoUrl}
                  controls
                  className="mt-5 aspect-video w-full rounded-xl bg-black"
                />
              ) : null}

              {currentLesson.content && (
                <div className="prose-lumio mt-6 space-y-4 leading-relaxed text-foreground/90">
                  {currentLesson.content.split(/\n\n+/).map((p, i) => (
                    <p key={i} className="text-[15px]">
                      {p}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={complete}
                  disabled={pending}
                  className={buttonVariants({
                    variant: completed.has(currentLesson.id)
                      ? "outline"
                      : "primary",
                  })}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : completed.has(currentLesson.id) ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t("completed")}
                    </>
                  ) : (
                    t("markComplete")
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {prev && (
                    <button
                      type="button"
                      onClick={() => go(prev)}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t("previous")}
                    </button>
                  )}
                  {next && (
                    <button
                      type="button"
                      onClick={() => go(next)}
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                      })}
                    >
                      {t("next")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentQuiz && <QuizRunner quiz={currentQuiz} />}
        </div>

        {/* AI assistant trigger */}
        {currentLesson && (
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-3 text-sm font-medium text-white shadow-lg shadow-brand/30"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t("openAssistant")}</span>
          </button>
        )}

        {currentLesson && (
          <AiTutorPanel
            key={currentLesson.id}
            lessonId={currentLesson.id}
            open={aiOpen}
            onClose={() => setAiOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
