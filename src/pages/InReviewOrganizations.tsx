import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import {
  Search, SearchCheck, Clock, AlertCircle, CheckCircle2, ArrowUpRight,
  Filter, SlidersHorizontal, MessageSquare, ShieldCheck, FileText, Banknote,
  ChevronRight, Sparkles, Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Tab = "all" | "under_review" | "changes_requested" | "ready";

const tabs: { key: Tab; label: string; tone: string }[] = [
  { key: "all", label: "All", tone: "text-foreground" },
  { key: "under_review", label: "Under Review", tone: "text-info" },
  { key: "changes_requested", label: "Changes Requested", tone: "text-warning" },
  { key: "ready", label: "Ready to Approve", tone: "text-success" },
];

export default function InReviewOrganizations() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const allInReview = useMemo(
    () => organizations.filter((o) => o.status === "In Review" || o.kybStatus === "In Review"),
    []
  );

  // Synthesize per-org review meta (deterministic by index)
  const enriched = useMemo(
    () =>
      allInReview.map((o, i) => {
        const sections = 6;
        const approved = (i * 2) % (sections + 1);
        const changes = i % 3 === 0 ? (i % 2) + 1 : 0;
        const pending = sections - approved - changes;
        const remarks = (i % 4) + 1;
        const reviewStatus: Tab =
          changes > 0 ? "changes_requested" : approved === sections ? "ready" : "under_review";
        const slaDays = (i % 5) + 1;
        const lastActivity = `${(i % 9) + 1}h ago`;
        return { o, approved, changes, pending, remarks, reviewStatus, slaDays, lastActivity, sections };
      }),
    [allInReview]
  );

  const counts = {
    all: enriched.length,
    under_review: enriched.filter((e) => e.reviewStatus === "under_review").length,
    changes_requested: enriched.filter((e) => e.reviewStatus === "changes_requested").length,
    ready: enriched.filter((e) => e.reviewStatus === "ready").length,
  };

  const data = enriched
    .filter((e) => (tab === "all" ? true : e.reviewStatus === tab))
    .filter((e) => e.o.name.toLowerCase().includes(q.toLowerCase()));

  const stats = [
    { label: "Active reviews", value: counts.all, sub: "across all reviewers", icon: SearchCheck, tone: "from-info/20 to-info/5 text-info" },
    { label: "Awaiting merchant", value: counts.changes_requested, sub: "changes requested", icon: AlertCircle, tone: "from-warning/20 to-warning/5 text-warning" },
    { label: "Ready to approve", value: counts.ready, sub: "all sections cleared", icon: CheckCircle2, tone: "from-success/20 to-success/5 text-success" },
    { label: "Avg. turnaround", value: "2.4d", sub: "↓ 0.6d this week", icon: Activity, tone: "from-primary/20 to-primary/5 text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-info/8 p-6">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-info/15 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 backdrop-blur px-2.5 py-1 text-xs text-muted-foreground mb-3">
              <Sparkles className="h-3 w-3 text-primary" /> Compliance Workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Review Queue</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
              Merchant submissions waiting for your review. Approve clean sections, request changes on flagged fields, and clear the queue faster.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-background/60 backdrop-blur">
              <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Customize
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-glow">
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Compliance Console
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="surface-card overflow-hidden relative">
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", s.tone)} />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-semibold mt-1">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-background/70 backdrop-blur flex items-center justify-center">
                  <s.icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl border bg-muted/40 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5",
                tab === t.key
                  ? "bg-background shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span className={cn(
                "px-1.5 rounded-full text-[10px]",
                tab === t.key ? "bg-muted" : "bg-background/60"
              )}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by organization, ID, reviewer…"
            className="pl-9 h-10 bg-muted/40 border-transparent focus-visible:bg-background"
          />
        </div>
        <Button variant="outline" className="h-10">
          <Filter className="mr-1.5 h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {data.map(({ o, approved, changes, pending, remarks, reviewStatus, slaDays, lastActivity, sections }) => {
          const pct = Math.round((approved / sections) * 100);
          const statusLabel =
            reviewStatus === "ready" ? "Ready to Approve"
            : reviewStatus === "changes_requested" ? "Changes Requested"
            : "Under Review";
          return (
            <Link
              key={o.id}
              to={`/onboarding/review/${o.id}`}
              className="group relative rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-elegant transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 text-primary flex items-center justify-center text-sm font-semibold ring-1 ring-border">
                    {o.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{o.name}</p>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {o.id} · {o.category} · {o.businessType}
                    </p>
                  </div>
                </div>
                <StatusBadge status={statusLabel} />
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Review progress</span>
                  <span className="font-medium">{approved}/{sections} sections · {pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                  <div className="bg-success" style={{ width: `${(approved / sections) * 100}%` }} />
                  <div className="bg-warning" style={{ width: `${(changes / sections) * 100}%` }} />
                  <div className="bg-info/40" style={{ width: `${(pending / sections) * 100}%` }} />
                </div>
              </div>

              {/* Section chips */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "KYB", icon: ShieldCheck, ok: approved >= 2 },
                  { label: "Bank", icon: Banknote, ok: approved >= 3 },
                  { label: "Docs", icon: FileText, ok: approved >= 4 },
                ].map((s) => (
                  <div key={s.label} className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs",
                    s.ok ? "border-success/30 bg-success/5 text-success" : "border-border bg-muted/30 text-muted-foreground"
                  )}>
                    <s.icon className="h-3.5 w-3.5" />
                    <span className="truncate">{s.label}</span>
                    {s.ok && <CheckCircle2 className="h-3 w-3 ml-auto" />}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lastActivity}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {remarks} remarks</span>
                  {changes > 0 && (
                    <Badge variant="outline" className="border-warning/40 text-warning bg-warning/5 h-5">
                      {changes} flagged
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-primary/15 text-primary text-[10px] font-semibold flex items-center justify-center">
                      {o.assignedAdmin.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-muted-foreground hidden sm:inline">{o.assignedAdmin}</span>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    slaDays <= 1 ? "bg-destructive/10 text-destructive" : slaDays <= 2 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                  )}>
                    SLA {slaDays}d
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                </div>
              </div>
            </Link>
          );
        })}
        {data.length === 0 && (
          <Card className="surface-card xl:col-span-2">
            <CardContent className="py-14 text-center text-sm text-muted-foreground">
              No organizations match your filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
