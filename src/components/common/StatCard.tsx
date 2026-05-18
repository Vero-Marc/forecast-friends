import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  subtitle,
  tint = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend: number;
  subtitle: string;
  tint?: "primary" | "info" | "success";
}) {
  const positive = trend >= 0;
  const tints: Record<string, string> = {
    primary: "from-primary/10 via-primary/5 to-transparent text-primary",
    info: "from-info/10 via-info/5 to-transparent text-info",
    success: "from-success/10 via-success/5 to-transparent text-success",
  };
  return (
    <Card className="surface-card overflow-hidden relative">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-70 pointer-events-none", tints[tint])} />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-background/80 border border-border shadow-xs", tints[tint])}>
            <Icon className="h-5 w-5" />
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
              positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">{label}</p>
        <p className="text-3xl font-semibold tracking-tight mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
