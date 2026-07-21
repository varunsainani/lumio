import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { GraduationCap } from "lucide-react";
import { getCurrentUser, dashboardPath } from "@/lib/auth/session";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { buttonVariants } from "./ui/button";

export async function SiteHeader() {
  const t = await getTranslations();
  const user = await getCurrentUser();
  const dashHref = user ? dashboardPath(user.role) : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Lumio
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/courses"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("nav.catalog")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("nav.pricing")}
          </Link>
          {(!user || user.role !== "admin") && (
            <Link
              href="/instructor"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t("nav.teach")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <ThemeToggle />
          {user ? (
            <div className="hidden md:block">
              <UserMenu name={user.name} role={user.role} dashboardHref={dashHref} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                {t("common.signIn")}
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                {t("common.getStarted")}
              </Link>
            </div>
          )}
          <MobileNav
            user={
              user
                ? { name: user.name, role: user.role, dashboardHref: dashHref }
                : null
            }
          />
        </div>
      </div>
    </header>
  );
}
