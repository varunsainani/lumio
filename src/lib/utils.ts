import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number, locale = "en"): string | null {
  if (cents <= 0) return null;
  const l = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  return new Intl.NumberFormat(l, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDuration(totalSec: number): string {
  const m = Math.max(1, Math.round(totalSec / 60));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// Deterministic gradient for course covers / avatars (no external images).
// Returns a CSS gradient string so it works regardless of Tailwind version.
const COVERS: [string, string][] = [
  ["#7c3aed", "#d946ef"],
  ["#6366f1", "#0ea5e9"],
  ["#f59e0b", "#ec4899"],
  ["#10b981", "#14b8a6"],
  ["#f43f5e", "#f97316"],
  ["#06b6d4", "#2563eb"],
  ["#9333ea", "#6366f1"],
  ["#84cc16", "#059669"],
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

export function coverGradient(seed: string): string {
  const [a, b] = COVERS[hashSeed(seed) % COVERS.length];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}
