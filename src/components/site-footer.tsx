import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { GraduationCap } from "lucide-react";

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">
                Lumio
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <FooterCol title={t("footer.product")}>
            <FooterLink href="/courses">{t("footer.browse")}</FooterLink>
            <FooterLink href="/pricing">{t("footer.pricing")}</FooterLink>
            <FooterLink href="/instructor">{t("footer.teach")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.company")}>
            <FooterLink href="/">{t("footer.about")}</FooterLink>
            <FooterLink href="/">{t("footer.blog")}</FooterLink>
            <FooterLink href="/">{t("footer.contact")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.resources")}>
            <FooterLink href="/">{t("footer.help")}</FooterLink>
            <FooterLink href="/">{t("footer.terms")}</FooterLink>
            <FooterLink href="/">{t("footer.privacy")}</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            &copy; {year} Lumio. {t("footer.rights")}
          </p>
          <p>{t("footer.madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {children}
      </Link>
    </li>
  );
}
