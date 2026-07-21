"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Award,
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Tag,
  Users,
  X,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { logoutAction } from "@/lib/auth/actions";

type Role = "student" | "instructor" | "admin";
type NavItem = {
  href: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const NAV: Record<Role, NavItem[]> = {
  student: [
    { href: "/dashboard", key: "dashboard", icon: LayoutDashboard, exact: true },
    { href: "/courses", key: "browse", icon: Compass },
    { href: "/dashboard/certificates", key: "certificates", icon: Award },
  ],
  instructor: [
    { href: "/instructor", key: "dashboard", icon: LayoutDashboard, exact: true },
    { href: "/instructor/courses", key: "myCourses", icon: BookOpen },
    { href: "/instructor/courses/new", key: "newCourse", icon: Plus },
  ],
  admin: [
    { href: "/admin", key: "overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", key: "users", icon: Users },
    { href: "/admin/courses", key: "courses", icon: BookOpen },
    { href: "/admin/categories", key: "categories", icon: Tag },
  ],
};

export function AppShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const t = useTranslations("appNav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV[user.role];

  const isActive = (it: NavItem) =>
    it.exact
      ? pathname === it.href
      : pathname === it.href || pathname.startsWith(`${it.href}/`);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-2 py-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-semibold tracking-tight">
          Lumio
        </span>
      </Link>
      <nav className="mt-6 flex-1 space-y-1">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(it)
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <it.icon className="h-4 w-4" />
            {t(it.key)}
          </Link>
        ))}
      </nav>
      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {user.role}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Log out"
              className="text-muted-foreground transition-colors hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card/40 p-4 lg:block">
        {sidebar}
      </aside>

      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold">Lumio</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-card p-4 shadow-2xl">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
