"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { submitQuiz } from "@/app/learn/[slug]/actions";

export type PlayerQuiz = {
  id: string;
  title: string;
  passingScorePct: number;
  questions: {
    id: string;
    prompt: string;
    options: string[];
    explanation: string | null;
  }[];
};

export function QuizRunner({ quiz }: { quiz: PlayerQuiz }) {
  const t = useTranslations("quiz");
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    quiz.questions.map(() => null),
  );
  const [result, setResult] = useState<{
    scorePct: number;
    passed: boolean;
    correct: number[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const submitted = result !== null;

  async function onSubmit() {
    if (answers.some((a) => a === null)) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);
    try {
      const res = await submitQuiz(quiz.id, answers as number[]);
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  function retry() {
    setAnswers(quiz.questions.map(() => null));
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        {quiz.title}
      </h2>

      {submitted && (
        <div
          className={cn(
            "mt-4 rounded-2xl border p-5",
            result.passed
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-amber-500/40 bg-amber-500/10",
          )}
        >
          <p className="font-display text-lg font-semibold">
            {result.passed ? t("passed") : t("failed")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.passed
              ? t("passBody", { score: result.scorePct })
              : t("failBody", {
                  score: result.scorePct,
                  pass: quiz.passingScorePct,
                })}
          </p>
        </div>
      )}

      <ol className="mt-6 space-y-6">
        {quiz.questions.map((q, qi) => (
          <li key={q.id} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("questionOf", { index: qi + 1, total: quiz.questions.length })}
            </p>
            <p className="mt-1 font-medium">{q.prompt}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = submitted && result.correct[qi] === oi;
                const isWrongSel =
                  submitted && selected && result.correct[qi] !== oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default",
                      isCorrect
                        ? "border-emerald-500 bg-emerald-500/10"
                        : isWrongSel
                          ? "border-red-500 bg-red-500/10"
                          : selected
                            ? "border-brand bg-brand/10"
                            : "border-border hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        selected || isCorrect
                          ? "border-transparent"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {isCorrect ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : isWrongSel ? (
                        <X className="h-3.5 w-3.5 text-red-600" />
                      ) : selected ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                      ) : null}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>

      {error && <p className="mt-4 text-sm text-red-600">{t("selectAll")}</p>}

      <div className="mt-6">
        {submitted ? (
          <button
            type="button"
            onClick={retry}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("retry")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className={buttonVariants()}
          >
            {loading ? "..." : t("submit")}
          </button>
        )}
      </div>
    </div>
  );
}
