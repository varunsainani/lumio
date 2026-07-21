import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col">
      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[110px]" />
      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">
            Lumio
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
