"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import {
  Check,
  ClipboardList,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addGeneratedQuestions,
  addQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  type IncomingQuestion,
} from "./actions";

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const textareaCls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1.5 block text-sm font-medium";

type QuestionData = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
};

type QuizData = {
  id: string;
  title: string;
  passingScorePct: number;
  questions: QuestionData[];
};

function PendingButton({
  label,
  variant = "primary",
  size = "sm",
  icon = true,
}: {
  label: string;
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md";
  icon?: boolean;
}) {
  const t = useTranslations("instructor");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ variant, size })}
    >
      {icon && <Plus className="h-4 w-4" />}
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

function AddQuestionForm({
  quizId,
  courseId,
}: {
  quizId: string;
  courseId: string;
}) {
  const t = useTranslations("instructor");
  const [correct, setCorrect] = useState(0);
  const action = addQuestion.bind(null, quizId, courseId);

  return (
    <form
      action={action}
      className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-3"
    >
      <p className="text-sm font-medium">{t("addQuestion")}</p>
      <div>
        <label className={labelCls} htmlFor={`prompt-${quizId}`}>
          {t("fieldPrompt")}
        </label>
        <input
          id={`prompt-${quizId}`}
          name="prompt"
          required
          maxLength={400}
          placeholder={t("fieldPromptPlaceholder")}
          className={inputCls}
        />
      </div>

      <input type="hidden" name="correctIndex" value={correct} />
      <div className="space-y-2">
        <span className={labelCls}>{t("fieldOptions")}</span>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrect(i)}
              aria-label={t("markCorrect")}
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                correct === i
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {correct === i ? (
                <Check className="h-4 w-4" />
              ) : (
                String.fromCharCode(65 + i)
              )}
            </button>
            <input
              name={`option${i}`}
              required
              maxLength={300}
              placeholder={t("optionPlaceholder", { letter: String.fromCharCode(65 + i) })}
              className={inputCls}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{t("markCorrectHint")}</p>
      </div>

      <div>
        <label className={labelCls} htmlFor={`expl-${quizId}`}>
          {t("fieldExplanation")}
        </label>
        <input
          id={`expl-${quizId}`}
          name="explanation"
          maxLength={400}
          placeholder={t("fieldExplanationPlaceholder")}
          className={inputCls}
        />
      </div>

      <div className="flex justify-end">
        <PendingButton label={t("addQuestion")} />
      </div>
    </form>
  );
}

function AiGeneratePanel({
  quizId,
  courseId,
  defaultTopic,
}: {
  quizId: string;
  courseId: string;
  defaultTopic: string;
}) {
  const t = useTranslations("instructor");
  const locale = useLocale();
  const [topic, setTopic] = useState(defaultTopic);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<IncomingQuestion[]>([]);

  async function generate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setDrafts([]);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), count, locale }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { questions?: IncomingQuestion[] };
      if (!data.questions?.length) throw new Error();
      setDrafts(data.questions);
    } catch {
      setError(t("aiError"));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (drafts.length === 0 || saving) return;
    setSaving(true);
    try {
      await addGeneratedQuestions(quizId, courseId, drafts);
      setDrafts([]);
    } finally {
      setSaving(false);
    }
  }

  function discard(index: number) {
    setDrafts((d) => d.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-3 rounded-xl border border-brand/30 bg-brand/5 p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="text-sm font-medium">{t("aiTitle")}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("aiSubtitle")}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className={labelCls} htmlFor={`aitopic-${quizId}`}>
            {t("aiTopic")}
          </label>
          <input
            id={`aitopic-${quizId}`}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={300}
            placeholder={t("aiTopicPlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor={`aicount-${quizId}`}>
            {t("aiCount")}
          </label>
          <input
            id={`aicount-${quizId}`}
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) =>
              setCount(Math.min(10, Math.max(1, Number(e.target.value) || 1)))
            }
            className={cn(inputCls, "sm:w-24")}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={loading || !topic.trim()}
        className={buttonVariants({ size: "sm", className: "mt-3" })}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? t("aiGenerating") : t("aiGenerate")}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {drafts.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">
            {t("aiReview", { count: drafts.length })}
          </p>
          {drafts.map((q, qi) => (
            <div
              key={qi}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{q.prompt}</p>
                <button
                  type="button"
                  onClick={() => discard(qi)}
                  aria-label={t("discard")}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {q.options.map((opt, oi) => (
                  <li
                    key={oi}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1 text-sm",
                      oi === q.correctIndex
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {oi === q.correctIndex ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    {opt}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className={buttonVariants({ size: "sm" })}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving ? t("saving") : t("aiSaveAll", { count: drafts.length })}
            </button>
            <button
              type="button"
              onClick={() => setDrafts([])}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {t("aiDiscardAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizCard({
  quiz,
  courseId,
  courseTitle,
}: {
  quiz: QuizData;
  courseId: string;
  courseTitle: string;
}) {
  const t = useTranslations("instructor");
  const [mode, setMode] = useState<"none" | "manual" | "ai">("none");

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{quiz.title}</p>
          <p className="text-xs text-muted-foreground">
            {t("passingScore", { score: quiz.passingScorePct })} ·{" "}
            {t("questionsCount", { count: quiz.questions.length })}
          </p>
        </div>
        <form action={deleteQuiz.bind(null, quiz.id, courseId)}>
          <IconDeleteButton confirmMsg={t("confirmDeleteQuiz")} />
        </form>
      </div>

      {quiz.questions.length > 0 && (
        <ol className="mt-3 space-y-2">
          {quiz.questions.map((q, qi) => (
            <li
              key={q.id}
              className="rounded-xl border border-border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">
                  {qi + 1}. {q.prompt}
                </p>
                <form action={deleteQuestion.bind(null, q.id, courseId)}>
                  <IconDeleteButton confirmMsg={t("confirmDeleteQuestion")} />
                </form>
              </div>
              <ul className="mt-2 space-y-1">
                {q.options.map((opt, oi) => (
                  <li
                    key={oi}
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      oi === q.correctIndex
                        ? "font-medium text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {oi === q.correctIndex ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    {opt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode(mode === "manual" ? "none" : "manual")}
          className={buttonVariants({
            variant: mode === "manual" ? "secondary" : "outline",
            size: "sm",
          })}
        >
          <Plus className="h-4 w-4" />
          {t("addQuestion")}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "ai" ? "none" : "ai")}
          className={buttonVariants({
            variant: mode === "ai" ? "secondary" : "outline",
            size: "sm",
          })}
        >
          <Sparkles className="h-4 w-4" />
          {t("aiGenerate")}
        </button>
      </div>

      {mode === "manual" && (
        <AddQuestionForm quizId={quiz.id} courseId={courseId} />
      )}
      {mode === "ai" && (
        <AiGeneratePanel
          quizId={quiz.id}
          courseId={courseId}
          defaultTopic={courseTitle}
        />
      )}
    </div>
  );
}

function CreateQuizForm({ courseId }: { courseId: string }) {
  const t = useTranslations("instructor");
  const action = createQuiz.bind(null, courseId);
  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-border p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className={labelCls} htmlFor="new-quiz-title">
          {t("fieldQuizTitle")}
        </label>
        <input
          id="new-quiz-title"
          name="title"
          required
          maxLength={160}
          placeholder={t("fieldQuizTitlePlaceholder")}
          className={inputCls}
        />
      </div>
      <div className="sm:w-40">
        <label className={labelCls} htmlFor="new-quiz-pass">
          {t("fieldPassingScore")}
        </label>
        <input
          id="new-quiz-pass"
          name="passingScore"
          type="number"
          min={1}
          max={100}
          defaultValue={70}
          className={inputCls}
        />
      </div>
      <PendingButton label={t("addQuiz")} variant="outline" size="md" />
    </form>
  );
}

export function QuizEditor({
  courseId,
  courseTitle,
  quizzes,
}: {
  courseId: string;
  courseTitle: string;
  quizzes: QuizData[];
}) {
  const t = useTranslations("instructor");
  return (
    <div className="space-y-4">
      {quizzes.length === 0 && (
        <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <ClipboardList className="h-4 w-4" />
          {t("noQuizzes")}
        </p>
      )}

      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          courseId={courseId}
          courseTitle={courseTitle}
        />
      ))}

      <CreateQuizForm courseId={courseId} />
    </div>
  );
}
