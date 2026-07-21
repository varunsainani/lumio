"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LayoutDashboard, LogOut } from "lucide-react";
import { initials } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";

export function UserMenu({
  name,
  role,
  dashboardHref,
}: {
  name: string;
  role: string;
  dashboardHref: string;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white"
        aria-label={name}
      >
        {initials(name)}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card p-1 shadow-xl">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-card-foreground">
                {name}
              </p>
              <p className="text-xs capitalize text-muted-foreground">{role}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("nav.dashboard")}
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                {t("common.logout")}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
