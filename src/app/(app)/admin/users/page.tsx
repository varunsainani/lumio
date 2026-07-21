import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/admin";
import { initials } from "@/lib/utils";
import { SearchBox } from "@/components/admin/search-box";
import { RoleSelect } from "@/components/admin/role-select";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("usersTitle") };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("admin");
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const { q } = await searchParams;
  const users = await listUsers(q);
  const dateFmt = new Intl.DateTimeFormat(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("usersTitle")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("usersSubtitle")}</p>
        </div>
        <SearchBox basePath="/admin/users" />
      </header>

      {users.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Users className="h-6 w-6" />
          </span>
          <p className="mt-4 font-medium">{t("noUsers")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noUsersBody")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("colUser")}</th>
                <th className="px-4 py-3 font-medium">{t("colRole")}</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  {t("colJoined")}
                </th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("colEnrolled")}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                        {initials(u.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium">{u.name}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={u.id} role={u.role} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {dateFmt.format(u.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {u.role === "instructor"
                      ? t("coursesCount", { count: u.courseCount })
                      : t("enrolledCount", { count: u.enrolledCount })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
