import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function SectionWrapper({
  title,
  description,
  badge,
  children,
  prev,
  next,
  nextLabel = "Save & Continue",
  nextDisabled,
  onNext,
}: {
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  prev?: string;
  next?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        {badge}
      </div>

      <div className="space-y-4">{children}</div>

      {(prev || next) && (
        <div className="fixed bottom-4 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-7xl mx-auto px-6">
            <div className={cn(
              "ml-auto lg:ml-[19rem] rounded-xl border bg-card/90 backdrop-blur-md shadow-lg",
              "p-3 flex items-center justify-between pointer-events-auto"
            )}>
              <Button
                variant="ghost"
                disabled={!prev}
                onClick={() => prev && navigate(prev)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground hidden md:inline">
                Autosaved · just now
              </span>
              <Button
                disabled={nextDisabled}
                onClick={() => {
                  onNext?.();
                  if (next) navigate(next);
                }}
                className="gradient-primary text-primary-foreground shadow-glow"
              >
                {nextLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
