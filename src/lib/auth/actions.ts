"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type Role } from "@/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, dashboardPath } from "./session";
import { demoEmail } from "./demo";

export type AuthState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleRaw = String(formData.get("role") ?? "student");
  const role: Role = roleRaw === "instructor" ? "instructor" : "student";

  if (name.length < 1 || name.length > 120) return { error: "invalidInput" };
  if (!EMAIL_RE.test(email) || email.length > 200)
    return { error: "invalidEmail" };
  if (password.length < 6) return { error: "weakPassword" };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) return { error: "emailInUse" };

  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning({ id: users.id, role: users.role });
  const user = inserted[0];

  await createSession(user.id, user.role);
  redirect(dashboardPath(user.role));
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || password.length < 1)
    return { error: "invalidCredentials" };

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];
  if (!user) return { error: "invalidCredentials" };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "invalidCredentials" };

  await createSession(user.id, user.role);
  redirect(dashboardPath(user.role));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

// One-click demo login. Authenticates as the seeded demo account for a role.
export async function demoLoginAction(formData: FormData): Promise<void> {
  const roleRaw = String(formData.get("role") ?? "student");
  const role: Role =
    roleRaw === "admin"
      ? "admin"
      : roleRaw === "instructor"
        ? "instructor"
        : "student";

  const email = demoEmail(role);
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];
  if (!user) redirect("/login?error=demoUnavailable");

  await createSession(user.id, user.role);
  redirect(dashboardPath(user.role));
}
