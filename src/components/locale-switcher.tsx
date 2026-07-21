"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";
import { setLocale } from "@/i18n/actions";
import { locales } from "@/i18n/config";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const active = useLocale();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function choose(l: string) {
    setOpen(false);
    startTransition(() => setLocale(l));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("label")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{active}</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => choose(l)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
              >
                {t(l)}
                {l === active && <Check className="h-4 w-4 text-brand" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
