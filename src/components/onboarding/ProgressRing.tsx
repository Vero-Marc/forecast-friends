import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ProgressRing({
  progress,
  size = 22,
  stroke = 2.5,
  done,
  active,
  className,
}: {
  progress: number; // 0..1
  size?: number;
  stroke?: number;
  done?: boolean;
  active?: boolean;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, progress)));

  if (done) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-success text-success-foreground",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Check className="h-3 w-3" />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
    </span>
  );
}
