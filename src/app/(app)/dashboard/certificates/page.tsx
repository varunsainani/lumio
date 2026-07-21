import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Award } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getUserCertificates } from "@/lib/data/learning";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("appNav");
  return { title: t("certificates") };
}

export default async function CertificatesPage() {
  const user = await requireUser();
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const certs = await getUserCertificates(user.id);
  const dateFmt = new Intl.DateTimeFormat(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("certificatesTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("certificatesSubtitle")}
        </p>
      </header>

      {certs.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Award className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("certificatesEmpty")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((c) => (
            <div
              key={c.code}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Award className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="line-clamp-1 font-medium">{c.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("issuedOn", {
                      date: dateFmt.format(new Date(c.issuedAt)),
                    })}
                  </p>
                </div>
              </div>
              <Link
                href={`/certificate/${c.code}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "mt-4 w-full",
                })}
              >
                {t("viewCertificate")}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
