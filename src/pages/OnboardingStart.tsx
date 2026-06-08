import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardEdit, Zap, ArrowRight, ShieldCheck, Sparkles,
  Clock, FileCheck2, Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "manual" | "surpass";

export default function OnboardingStart() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Mode | null>(null);

  const proceed = () => {
    if (!selected) return;
    navigate(selected === "manual" ? "/onboarding/create" : "/onboarding/surpass");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Atmospheric gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[920px] rounded-full bg-primary/20 blur-3xl opacity-40" />
        <div className="absolute top-40 right-10 h-[280px] w-[280px] rounded-full bg-info/20 blur-3xl opacity-30" />
      </div>

      <div className="max-w-5xl mx-auto px-2 pt-8 pb-16 space-y-10 animate-fade-in">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            New onboarding experience
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            How would you like to onboard this organization?
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the flow that fits the merchant. Switch between assisted data entry
            or automated verification via PAN, GST, MCA, and Aadhaar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <ModeCard
            mode="manual"
            active={selected === "manual"}
            onSelect={() => setSelected("manual")}
            icon={ClipboardEdit}
            tone="info"
            title="Manual Onboarding"
            subtitle="Ops-assisted entry"
            description="Manually fill and submit organization & compliance details. Best for assisted or offline onboarding."
            chips={[
              { icon: FileCheck2, label: "7-step guided form" },
              { icon: Clock, label: "~10 min" },
              { icon: ShieldCheck, label: "Manual KYC/KYB" },
            ]}
          />
          <ModeCard
            mode="surpass"
            active={selected === "surpass"}
            onSelect={() => setSelected("surpass")}
            icon={Zap}
            tone="primary"
            title="Surpass Onboarding"
            subtitle="Automated via PAN"
            description="Enter Business PAN to instantly auto-fetch and verify organization data via third-party APIs. Faster, automated, compliance-ready."
            chips={[
              { icon: Wand2, label: "PAN · GST · MCA auto-fetch" },
              { icon: Clock, label: "~3 min" },
              { icon: ShieldCheck, label: "eKYC + Penny drop" },
            ]}
            recommended
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-card/70 backdrop-blur-sm p-4">
          <p className="text-sm text-muted-foreground">
            {selected
              ? `You selected ${selected === "manual" ? "Manual" : "Surpass"} onboarding. You can switch any time before submission.`
              : "Pick a flow to continue. Both flows produce the same compliance-ready record."}
          </p>
          <Button
            disabled={!selected}
            onClick={proceed}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            Continue <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  active, onSelect, icon: Icon, title, subtitle, description, chips, tone, recommended,
}: {
  mode: Mode;
  active: boolean;
  onSelect: () => void;
  icon: any;
  title: string;
  subtitle: string;
  description: string;
  chips: { icon: any; label: string }[];
  tone: "primary" | "info";
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative text-left rounded-2xl border bg-card overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        active
          ? "border-primary/60 shadow-glow ring-2 ring-primary/30"
          : "border-border hover:border-primary/30"
      )}
    >
      {/* Shine */}
      <span
        className={cn(
          "absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none",
          active && "translate-x-full"
        )}
      />
      {/* Glow blob */}
      <span
        className={cn(
          "absolute -top-16 -right-16 h-52 w-52 rounded-full blur-3xl transition-opacity duration-500",
          tone === "primary" ? "bg-primary/30" : "bg-info/30",
          active ? "opacity-70" : "opacity-0 group-hover:opacity-40"
        )}
      />

      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
              tone === "primary" ? "bg-primary/10 text-primary" : "bg-info/10 text-info",
              active && "gradient-primary text-primary-foreground"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          {recommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 border border-primary/20">
              <Sparkles className="h-3 w-3" />
              Recommended
            </span>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{subtitle}</p>
          <h3 className="text-xl font-semibold mt-0.5">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {chips.map((c) => (
            <span
              key={c.label}
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground/80"
            >
              <c.icon className="h-3 w-3" />
              {c.label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className={cn(
            "text-xs font-medium",
            active ? "text-primary" : "text-muted-foreground"
          )}>
            {active ? "Selected" : "Click to select"}
          </span>
          <ArrowRight
            className={cn(
              "h-4 w-4 transition-transform",
              active ? "text-primary translate-x-1" : "text-muted-foreground group-hover:translate-x-1"
            )}
          />
        </div>
      </div>
    </button>
  );
}
