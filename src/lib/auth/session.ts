import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type Role, type User } from "@/db/schema";

const COOKIE_NAME = "lumio_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "insecure-dev-secret-change-me",
);

export type SessionPayload = { userId: string; role: Role };

export function dashboardPath(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "instructor") return "/instructor";
  return "/dashboard";
}

export async function createSession(userId: string, role: Role): Promise<void> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.userId === "string" &&
      typeof payload.role === "string"
    ) {
      return { userId: payload.userId, role: payload.role as Role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(dashboardPath(user.role));
  return user;
}
