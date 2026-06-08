import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, ShieldCheck, UserCheck,
  FileText, Banknote, Plug, FileCheck2, ArrowLeft, AlertCircle,
} from "lucide-react";
import { SurpassProvider, useSurpass, SectionKey } from "./SurpassContext";
import { ProgressRing } from "@/components/onboarding/ProgressRing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items: { key: SectionKey; title: string; sub: string; url: string; icon: any }[] = [
  { key: "lookup", title: "Overview", sub: "Org lookup", url: "/onboarding/surepass", icon: LayoutDashboard },
  { key: "business", title: "Business Details", sub: "Auto-filled", url: "/onboarding/surepass/business-details", icon: Building2 },
  { key: "kyb", title: "KYB", sub: "PAN · CIN · GST · MCA", url: "/onboarding/surepass/kyb", icon: ShieldCheck },
  { key: "kyc", title: "KYC", sub: "Directors · eKYC", url: "/onboarding/surepass/kyc", icon: UserCheck },
  { key: "documents", title: "Documents", sub: "Smart uploads", url: "/onboarding/surepass/documents", icon: FileText },
  { key: "bank", title: "Bank Accounts", sub: "Penny drop", url: "/onboarding/surepass/bank-accounts", icon: Banknote },
  { key: "integration", title: "Integrations", sub: "API · Webhook", url: "/onboarding/surepass/integrations", icon: Plug },
  { key: "review", title: "Review & Submit", sub: "Final check", url: "/onboarding/surepass/review", icon: FileCheck2 },
];

function SidenavInner() {
  const { data } = useSurpass();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const overall =
    Object.values(data.progress).reduce((a, b) => a + b, 0) /
    Object.keys(data.progress).length;

  return (
    <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)] lg:w-72 shrink-0">
      <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-4 h-full flex flex-col">
        <button
          onClick={() => navigate("/onboarding/start")}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to onboarding
        </button>

        <div className="rounded-xl gradient-primary text-primary-foreground p-4 mb-4 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
          <p className="text-[11px] uppercase tracking-wider opacity-80">Surepass onboarding</p>
          <p className="text-sm font-semibold mt-1 truncate">
            {data.legalName || "Awaiting PAN lookup"}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${Math.round(overall * 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium">{Math.round(overall * 100)}%</span>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {items.map((it) => {
            const active = pathname === it.url;
            const progress = data.progress[it.key] ?? 0;
            const done = progress >= 1;
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.url}
                end
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all",
                    isActive || active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "hover:bg-muted/60 text-foreground/80"
                  )
                }
              >
                <ProgressRing progress={progress} done={done} active={active} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate flex items-center gap-1.5">
                    {it.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{it.sub}</p>
                </div>
                <Icon className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-3 flex gap-2 text-xs">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Verification statuses sync in real time from third-party APIs.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function SurpassLayout() {
  return (
    <SurpassProvider>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 right-1/3 h-[400px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <SidenavInner />
          <main className="flex-1 min-w-0">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SurpassProvider>
  );
}
