import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser, dashboardPath } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("loginCta") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPath(user.role));
  const { error } = await searchParams;
  return <AuthForm mode="login" initialError={error} />;
}
