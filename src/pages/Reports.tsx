import { useMemo, useState } from "react";
import {
  FileBarChart2,
  RefreshCw,
  Sparkles,
  CalendarRange,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckCircle2,
  XCircle,
  RotateCw,
  Download,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ReportStatus = "Success" | "Failed";
type ReportType = "payins" | "payout";

interface ReportRow {
  id: string;
  createdBy: string;
  initials: string;
  date: string;
  time: string;
  email: string;
  description: string;
  status: ReportStatus;
  type: ReportType;
}

const seed: ReportRow[] = [
  { id: "RPT-90211", createdBy: "Sarah Chen", initials: "SC", date: "Jun 02, 2026", time: "14:32", email: "sarah@fynnix.io", description: "Monthly payins summary — May 2026", status: "Success", type: "payins" },
  { id: "RPT-90210", createdBy: "Marcus Hill", initials: "MH", date: "Jun 02, 2026", time: "11:08", email: "ops@northwind.com", description: "Settlement reconciliation export", status: "Success", type: "payins" },
  { id: "RPT-90209", createdBy: "Priya Raman", initials: "PR", date: "Jun 01, 2026", time: "18:54", email: "finance@apex.io", description: "Failed transactions audit (last 7d)", status: "Failed", type: "payins" },
  { id: "RPT-90208", createdBy: "David Okonkwo", initials: "DO", date: "Jun 01, 2026", time: "09:21", email: "david@fynnix.io", description: "Partner payout breakdown", status: "Success", type: "payout" },
  { id: "RPT-90207", createdBy: "Elena Vasquez", initials: "EV", date: "May 31, 2026", time: "22:10", email: "elena@fynnix.io", description: "Wallet movement log", status: "Success", type: "payout" },
  { id: "RPT-90206", createdBy: "Sarah Chen", initials: "SC", date: "May 31, 2026", time: "16:42", email: "ops@helix.io", description: "Refund volume report", status: "Failed", type: "payins" },
  { id: "RPT-90205", createdBy: "Marcus Hill", initials: "MH", date: "May 30, 2026", time: "12:00", email: "treasury@stellar.com", description: "Daily payout settlement", status: "Success", type: "payout" },
  { id: "RPT-90204", createdBy: "Priya Raman", initials: "PR", date: "May 30, 2026", time: "08:17", email: "priya@fynnix.io", description: "VA balance snapshot", status: "Success", type: "payins" },
];

const PAGE_SIZE = 6;

export default function Reports() {
  const [tab, setTab] = useState<ReportType>("payins");
  const [status, setStatus] = useState<string>("all");
  const [range, setRange] = useState<string>("30d");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return seed.filter((r) => {
      if (r.type !== tab) return false;
      if (status !== "all" && r.status.toLowerCase() !== status) return false;
      return true;
    });
  }, [tab, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setStatus("all");
    setRange("30d");
    setPage(1);
    toast.success("Filters reset");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileBarChart2 className="h-3.5 w-3.5" />
            Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate, download and review your reporting history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 shadow-soft">
            <span className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-primary-foreground" />
            </span>
            <div className="flex flex-col leading-tight pr-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">VA</span>
              <span className="text-xs font-medium">Northwind • 4421</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v as ReportType); setPage(1); }}>
        <TabsList className="h-11 p-1 rounded-full bg-muted/60 border border-border shadow-soft">
          <TabsTrigger
            value="payins"
            className="rounded-full px-5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-elevated data-[state=active]:text-primary transition-all"
          >
            Payins
          </TabsTrigger>
          <TabsTrigger
            value="payout"
            className="rounded-full px-5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-elevated data-[state=active]:text-primary transition-all"
          >
            Payout
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 space-y-5">
          {/* Section card */}
          <div className="relative rounded-2xl border border-border bg-card/70 backdrop-blur-xl shadow-elevated overflow-hidden">
            <div className="absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent)] pointer-events-none" />

            {/* Section header */}
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 md:p-6 border-b border-border/70">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Reports Generation History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last 30 days of generated exports across your workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Date range */}
                <div className="relative">
                  <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Select value={range} onValueChange={setRange}>
                    <SelectTrigger className="h-9 pl-8 pr-3 rounded-full bg-background/80 border-border min-w-[150px] shadow-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range…</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 pl-8 pr-3 rounded-full bg-background/80 border-border min-w-[140px] shadow-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>

                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full gap-1.5 shadow-xs"
                  onClick={() => toast.success("Refreshed report list")}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>

                <Button
                  size="sm"
                  onClick={() => toast.success("Report generation started")}
                  className="h-9 rounded-full gap-1.5 px-4 gradient-primary text-primary-foreground border-0 shadow-glow hover:translate-y-[-1px] hover:shadow-floating active:translate-y-0 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto">
              <div className="min-w-[920px]">
                {/* Header row */}
                <div className="grid grid-cols-[1.2fr_1fr_1.4fr_1.6fr_0.9fr_0.7fr] gap-4 px-5 md:px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/70 bg-muted/30">
                  <div>Created By</div>
                  <div>Date &amp; Time</div>
                  <div>Recipient Email</div>
                  <div>Description</div>
                  <div>Status</div>
                  <div className="text-right">Action</div>
                </div>

                {/* Rows */}
                <div className="p-3 md:p-4 space-y-2">
                  {pageRows.length === 0 && (
                    <div className="py-16 text-center text-sm text-muted-foreground">
                      No reports found for the selected filters.
                    </div>
                  )}
                  {pageRows.map((r) => (
                    <ReportCardRow key={r.id} row={r} />
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="relative flex items-center justify-between gap-3 px-5 md:px-6 py-4 border-t border-border/70 bg-muted/20">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{pageRows.length}</span> of{" "}
                <span className="font-medium text-foreground">{filtered.length}</span> reports
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportCardRow({ row }: { row: ReportRow }) {
  return (
    <div
      className={cn(
        "group relative grid grid-cols-[1.2fr_1fr_1.4fr_1.6fr_0.9fr_0.7fr] gap-4 items-center",
        "rounded-xl border border-border/70 bg-card px-4 py-3.5",
        "shadow-xs hover:shadow-elevated hover:border-primary/30 hover:-translate-y-[1px]",
        "transition-all duration-300 overflow-hidden"
      )}
    >
      {/* Shine sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[400%] transition-all duration-700 ease-out"
      />

      {/* Created By */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
          {row.initials}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{row.createdBy}</div>
          <div className="text-[11px] text-muted-foreground truncate">{row.id}</div>
        </div>
      </div>

      {/* Date */}
      <div className="text-sm">
        <div className="font-medium">{row.date}</div>
        <div className="text-[11px] text-muted-foreground">{row.time}</div>
      </div>

      {/* Email pill */}
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1.5 max-w-full rounded-full border border-border/70 bg-muted/50 backdrop-blur px-2.5 py-1 text-xs text-foreground/90">
          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="truncate">{row.email}</span>
        </span>
      </div>

      {/* Description */}
      <div className="text-sm text-foreground/90 truncate" title={row.description}>
        {row.description}
      </div>

      {/* Status */}
      <div>
        <StatusPill status={row.status} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          className="h-8 w-8 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          title="Download"
        >
          <Download className="h-3.5 w-3.5 transition-transform group-hover:translate-y-[1px]" />
        </button>
        <button
          className="h-8 w-8 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          title="Retry"
        >
          <RotateCw className="h-3.5 w-3.5 transition-transform duration-500 hover:rotate-180" />
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ReportStatus }) {
  if (status === "Success") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <CheckCircle2 className="h-3 w-3" />
        Success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
      <XCircle className="h-3 w-3" />
      Failed
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-40 disabled:hover:text-muted-foreground transition-all"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "h-8 min-w-8 px-3 rounded-full text-xs font-medium transition-all",
            p === page
              ? "gradient-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-40 disabled:hover:text-muted-foreground transition-all"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
