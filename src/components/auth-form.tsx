"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { BookOpen, GraduationCap } from "lucide-react";
import {
  loginAction,
  registerAction,
  demoLoginAction,
  type AuthState,
} from "@/lib/auth/actions";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonVariants({ size: "md", className: "mt-2 w-full" })}
    >
      {pending ? "..." : label}
    </button>
  );
}

export function AuthForm({
  mode,
  initialError,
}: {
  mode: "login" | "register";
  initialError?: string;
}) {
  const t = useTranslations("auth");
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {
    error: initialError,
  });
  const [role, setRole] = useState<"student" | "instructor">("student");

  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-brand/5 sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {isLogin ? t("loginTitle") : t("registerTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin ? t("loginSubtitle") : t("registerSubtitle")}
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="name">
                {t("name")}
              </label>
              <input
                id="name"
                name="name"
                required
                maxLength={120}
                placeholder={t("namePlaceholder")}
                className={inputCls}
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className={inputCls}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="password"
            >
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={isLogin ? undefined : 6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={t("passwordPlaceholder")}
              className={inputCls}
            />
          </div>

          {!isLogin && (
            <div>
              <span className="mb-1.5 block text-sm font-medium">
                {t("role")}
              </span>
              <input type="hidden" name="role" value={role} />
              <div className="grid grid-cols-2 gap-2">
                <RoleOption
                  active={role === "student"}
                  onClick={() => setRole("student")}
                  icon={<BookOpen className="h-4 w-4" />}
                  label={t("roleStudent")}
                />
                <RoleOption
                  active={role === "instructor"}
                  onClick={() => setRole("instructor")}
                  icon={<GraduationCap className="h-4 w-4" />}
                  label={t("roleInstructor")}
                />
              </div>
            </div>
          )}

          {state?.error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {t(`errors.${state.error}`)}
            </p>
          )}

          <SubmitButton label={isLogin ? t("loginCta") : t("registerCta")} />
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t("orContinue")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-2">
          <DemoButton role="student" label={t("demoStudent")} />
          <DemoButton role="instructor" label={t("demoInstructor")} />
          <DemoButton role="admin" label={t("demoAdmin")} />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t("demoHint")}
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? t("noAccount") : t("haveAccount")}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-medium text-brand hover:underline"
        >
          {isLogin ? t("registerCta") : t("loginCta")}
        </Link>
      </p>
    </div>
  );
}

function RoleOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function DemoButton({ role, label }: { role: string; label: string }) {
  return (
    <form action={demoLoginAction}>
      <input type="hidden" name="role" value={role} />
      <button
        type="submit"
        className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
      >
        {label}
      </button>
    </form>
  );
}
