"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { logoutAction } from "@/lib/auth/actions";

type SessionInfo = { name: string; role: string; dashboardHref: string } | null;

export function MobileNav({ user }: { user: SessionInfo }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-card p-5 shadow-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("common.close")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              <Link
                href="/courses"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                {t("nav.catalog")}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                {t("nav.pricing")}
              </Link>
              {(!user || user.role !== "admin") && (
                <Link
                  href="/instructor"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
                >
                  {t("nav.teach")}
                </Link>
              )}
            </nav>
            <div className="mt-6 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={user.dashboardHref}
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ variant: "primary", className: "w-full" })}
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className={buttonVariants({ variant: "outline", className: "w-full" })}
                    >
                      {t("common.logout")}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                  >
                    {t("common.signIn")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ variant: "primary", className: "w-full" })}
                  >
                    {t("common.getStarted")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
