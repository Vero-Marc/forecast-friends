import { cn } from "@/lib/utils";
import { Check, X, Loader2, AlertTriangle, Clock } from "lucide-react";

export type VerificationState =
  | "verified"
  | "failed"
  | "pending"
  | "warning"
  | "not_found";

const map: Record<VerificationState, { label: string; cls: string; icon: any; pulse?: boolean }> = {
  verified: { label: "Verified", cls: "bg-success/10 text-success border-success/20", icon: Check },
  failed: { label: "Failed", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: X },
  pending: { label: "Pending", cls: "bg-info/10 text-info border-info/20", icon: Loader2, pulse: true },
  warning: { label: "Action needed", cls: "bg-warning/10 text-warning border-warning/20", icon: AlertTriangle },
  not_found: { label: "Not found", cls: "bg-muted text-muted-foreground border-border", icon: Clock },
};

export function VerificationBadge({
  state,
  label,
  className,
}: {
  state: VerificationState;
  label?: string;
  className?: string;
}) {
  const s = map[state];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        s.cls,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", s.pulse && "animate-spin")} />
      {label ?? s.label}
    </span>
  );
}
