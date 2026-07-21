import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser, dashboardPath } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("registerCta") };
}

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPath(user.role));
  return <AuthForm mode="register" />;
}
