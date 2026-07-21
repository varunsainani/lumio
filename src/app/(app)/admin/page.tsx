import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Tag,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { getPlatformOverview } from "@/lib/data/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("overviewTitle") };
}

export default async function AdminOverviewPage() {
  await requireRole("admin");
  const t = await getTranslations("admin");
  const stats = await getPlatformOverview();

  const statCards = [
    { icon: Users, value: stats.users, label: t("statUsers") },
    { icon: GraduationCap, value: stats.students, label: t("statStudents") },
    { icon: UserCog, value: stats.instructors, label: t("statInstructors") },
    { icon: ShieldCheck, value: stats.admins, label: t("statAdmins") },
    { icon: BookOpen, value: stats.courses, label: t("statCourses") },
    {
      icon: CheckCircle2,
      value: stats.publishedCourses,
      label: t("statPublished"),
    },
    { icon: UsersRound, value: stats.enrollments, label: t("statEnrollments") },
    { icon: Award, value: stats.certificates, label: t("statCertificates") },
  ];

  const quickLinks = [
    {
      href: "/admin/users",
      icon: Users,
      title: t("linkUsers"),
      body: t("linkUsersBody"),
    },
    {
      href: "/admin/courses",
      icon: BookOpen,
      title: t("linkCourses"),
      body: t("linkCoursesBody"),
    },
    {
      href: "/admin/categories",
      icon: Tag,
      title: t("linkCategories"),
      body: t("linkCategoriesBody"),
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("overviewTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("overviewSubtitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">
          {t("manageTitle")}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/40 hover:bg-muted/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <l.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-medium">{l.title}</p>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {l.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                {t("manage")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
