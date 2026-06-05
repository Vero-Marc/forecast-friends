import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-border",
  Suspended: "bg-destructive/10 text-destructive border-destructive/20",
  Success: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Processing: "bg-info/10 text-info border-info/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
  Reversed: "bg-accent text-accent-foreground border-border",
};

export function RefundBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
