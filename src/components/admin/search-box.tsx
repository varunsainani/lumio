"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function SearchBox({ basePath }: { basePath: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const params = useSearchParams();

  function submit(value: string) {
    const next = new URLSearchParams(params.toString());
    const q = value.trim();
    if (q) next.set("q", q);
    else next.delete("q");
    const query = next.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        submit(String(fd.get("q") ?? ""));
      }}
      className="relative w-full sm:max-w-xs"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        name="q"
        defaultValue={params.get("q") ?? ""}
        placeholder={t("searchPlaceholder")}
        className="h-11 w-full min-w-0 rounded-xl border border-input bg-background pl-9 pr-3.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
    </form>
  );
}
