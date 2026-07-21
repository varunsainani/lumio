"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { Role } from "@/db/schema";
import { setUserRole } from "@/app/(app)/admin/actions";

const ROLES: Role[] = ["student", "instructor", "admin"];

export function RoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}) {
  const t = useTranslations("admin");
  const [value, setValue] = useState<Role>(role);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      aria-label={t("roleLabel")}
      onChange={(e) => {
        const next = e.target.value as Role;
        setValue(next);
        startTransition(() => setUserRole(userId, next));
      }}
      className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {t(`role.${r}`)}
        </option>
      ))}
    </select>
  );
}
