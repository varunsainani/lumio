import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value.toFixed(1)} / 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}
