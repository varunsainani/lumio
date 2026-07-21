"use client";

import { Printer } from "lucide-react";
import { buttonVariants } from "./ui/button";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={buttonVariants()}
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
