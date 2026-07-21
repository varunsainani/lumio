import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lumio - Learn anything, beautifully",
    template: "%s · Lumio",
  },
  description:
    "A modern learning platform where great instructors teach and curious minds grow. Structured courses, interactive quizzes, certificates, and an AI study assistant.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Lumio - Learn anything, beautifully",
    description:
      "Structured courses, interactive quizzes, certificates, and an AI study assistant.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const store = await cookies();
  const isDark = store.get("theme")?.value === "dark";

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${sora.variable} ${isDark ? "dark" : ""} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
