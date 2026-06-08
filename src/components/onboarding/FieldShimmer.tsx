import { cn } from "@/lib/utils";

export function FieldShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-9 w-full rounded-md bg-muted/60 overflow-hidden relative",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.06), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s linear infinite",
        }}
      />
    </div>
  );
}
