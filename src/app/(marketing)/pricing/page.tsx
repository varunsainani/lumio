import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");
  return { title: t("title"), description: t("subtitle") };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  const plans = [
    {
      key: "free",
      name: t("freeName"),
      price: t("freePrice"),
      desc: t("freeDesc"),
      features: [t("freeF1"), t("freeF2"), t("freeF3")],
      cta: t("ctaFree"),
      highlight: false,
    },
    {
      key: "pro",
      name: t("proName"),
      price: t("proPrice"),
      desc: t("proDesc"),
      features: [t("proF1"), t("proF2"), t("proF3"), t("proF4")],
      cta: t("ctaPro"),
      highlight: true,
    },
    {
      key: "team",
      name: t("teamName"),
      price: t("teamPrice"),
      desc: t("teamDesc"),
      features: [t("teamF1"), t("teamF2"), t("teamF3"), t("teamF4")],
      cta: t("ctaTeam"),
      highlight: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.key}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-6",
              p.highlight
                ? "border-brand shadow-xl shadow-brand/10"
                : "border-border",
            )}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                {t("mostPopular")}
              </span>
            )}
            <h2 className="font-display text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">{p.price}</span>
              <span className="text-sm text-muted-foreground">
                {t("perMonth")}
              </span>
            </div>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={buttonVariants({
                variant: p.highlight ? "primary" : "outline",
                className: "mt-8 w-full",
              })}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {t("note")}
      </p>
    </div>
  );
}
