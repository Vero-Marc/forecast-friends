import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  title: string;
  description?: string;
}

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: Step[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex w-full items-start gap-2", className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.title} className="flex-1 flex items-start gap-3 min-w-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors shrink-0",
                  done && "bg-primary border-primary text-primary-foreground",
                  active && "border-primary text-primary bg-primary/5",
                  !done && !active && "border-border text-muted-foreground bg-background"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium truncate", active || done ? "text-foreground" : "text-muted-foreground")}>
                    {s.title}
                  </p>
                  {s.description && (
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">{s.description}</p>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("hidden sm:block flex-1 h-px", done ? "bg-primary" : "bg-border")} />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
