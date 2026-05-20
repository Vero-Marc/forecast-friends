import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";

export interface Step {
  title: string;
  description?: string;
  icon?: LucideIcon;
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
    <div className={cn("w-full", className)}>
      {/* Icon row with connectors */}
      <div className="flex items-center w-full">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const Icon = s.icon;
          return (
            <div key={s.title} className="flex items-center flex-1 last:flex-none">
              <div className="relative flex items-center justify-center shrink-0">
                {active && (
                  <span className="absolute inset-0 -m-1.5 rounded-full ring-2 ring-primary/30" />
                )}
                <div
                  className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center transition-all shrink-0",
                    done && "bg-primary text-primary-foreground shadow-sm",
                    active && "gradient-primary text-primary-foreground shadow-glow",
                    !done && !active && "bg-muted text-muted-foreground/70"
                  )}
                >
                  {done ? (
                    <Check className="h-5 w-5" />
                  ) : Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{i + 1}</span>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-2 relative">
                  <div className="absolute inset-0 border-t border-dashed border-border" />
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 border-t-2 border-primary transition-all",
                      done ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels row */}
      <div className="flex items-start w-full mt-3">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={s.title} className="flex items-start flex-1 last:flex-none">
              <div className="w-11 shrink-0 flex flex-col items-center text-center">
                <p
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    active || done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.title}
                </p>
                {s.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap hidden sm:block">
                    {s.description}
                  </p>
                )}
              </div>
              {i < steps.length - 1 && <div className="flex-1 mx-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
