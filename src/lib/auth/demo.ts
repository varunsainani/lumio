import type { Role } from "@/db/schema";

// Shared demo credentials, used by both the seed and one-click demo login.
export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS: { role: Role; email: string; name: string }[] = [
  { role: "student", email: "student@lumio.app", name: "Maya Chen" },
  { role: "instructor", email: "instructor@lumio.app", name: "David Okafor" },
  { role: "admin", email: "admin@lumio.app", name: "Site Admin" },
];

export function demoEmail(role: Role): string {
  return (
    DEMO_ACCOUNTS.find((a) => a.role === role)?.email ?? "student@lumio.app"
  );
}
