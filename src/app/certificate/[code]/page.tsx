import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Award, GraduationCap } from "lucide-react";
import { getCertificateByCode } from "@/lib/data/certificate";
import { PrintButton } from "@/components/print-button";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const cert = await getCertificateByCode(code);
  const t = await getTranslations("certificate");
  return {
    title: cert ? `${cert.courseTitle} - ${t("title")}` : t("notFoundTitle"),
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const t = await getTranslations("certificate");
  const locale = await getLocale();
  const cert = await getCertificateByCode(code);

  if (!cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-bold">{t("notFoundTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("notFoundBody")}</p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          {t("backHome")}
        </Link>
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { dateStyle: "long" },
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
      <div className="w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border-4 border-brand/20 bg-card p-8 text-center shadow-2xl sm:p-14">
          <div className="absolute inset-0 bg-grid opacity-[0.06]" />
          <div className="relative">
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-bold tracking-tight">
                Lumio
              </span>
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              {t("title")}
            </p>

            <p className="mt-6 text-sm text-muted-foreground">
              {t("presentedTo")}
            </p>
            <p className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              {cert.userName}
            </p>

            <p className="mt-5 text-sm text-muted-foreground">
              {t("completed")}
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-brand">
              {cert.courseTitle}
            </p>

            <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t("issued")}</p>
                <p className="font-medium">
                  {dateFmt.format(new Date(cert.issuedAt))}
                </p>
              </div>
              {cert.instructorName && (
                <div>
                  <p className="text-muted-foreground">{t("instructor")}</p>
                  <p className="font-medium">{cert.instructorName}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Award className="h-4 w-4 text-brand" />
              {t("verify")}:{" "}
              <span className="font-mono tracking-wider">{cert.code}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 print:hidden">
          <PrintButton label={t("print")} />
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
