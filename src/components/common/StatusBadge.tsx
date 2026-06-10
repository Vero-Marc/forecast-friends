import { cn } from "@/lib/utils";
import { OrgStatus } from "@/data/mockData";

const map: Record<string, string> = {
  Approved: "bg-success/10 text-success border-success/20",
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-border",
  "On Hold": "bg-warning/10 text-warning border-warning/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
  Pending: "bg-muted text-muted-foreground border-border",
  "In Review": "bg-info/10 text-info border-info/20",
  "Under Review": "bg-info/10 text-info border-info/20",
  "Changes Requested": "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
};

export function StatusBadge({ status, className }: { status: OrgStatus | string; className?: string }) {
  const styles = map[status as OrgStatus] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
