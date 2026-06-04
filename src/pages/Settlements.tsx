import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  Check,
  X,
  Eye,
  RefreshCw,
  Download,
  AlertCircle,
  Loader2,
  ArrowDownToLine,
  ChevronRight,
  Building2,
  Receipt,
  Landmark,
  CheckCircle2,
  XCircle,
  Clock,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type SettlementStatus = "Initiated" | "Pending" | "Success" | "Failed";
type SettlementType = "Instant" | "Standard" | "Scheduled";

interface TimelineEvent {
  label: string;
  at?: string;
  state: "done" | "active" | "failed" | "idle";
  note?: string;
}

interface Settlement {
  id: string;
  merchant: string;
  merchantCode: string;
  utr: string;
  amount: number;
  fees: number;
  tax: number;
  type: SettlementType;
  status: SettlementStatus;
  initiatedOn: string;
  settledOn?: string;
  bankRef?: string;
  failureReason?: string;
  timeline: TimelineEvent[];
}

const MERCHANTS = [
  ["Northwind Capital", "NWC"],
  ["Apex Logistics", "APX"],
  ["Lumen Health", "LUM"],
  ["Vertex Robotics", "VTX"],
  ["Pulse Payments", "PLS"],
  ["Orbit Marketplace", "ORB"],
  ["Stellar Foods", "STL"],
  ["Helix Analytics", "HLX"],
];

function genSeed(): Settlement[] {
  const types: SettlementType[] = ["Instant", "Standard", "Scheduled"];
  const statuses: SettlementStatus[] = ["Initiated", "Pending", "Success", "Failed"];
  return Array.from({ length: 14 }).map((_, i) => {
    const [m, code] = MERCHANTS[i % MERCHANTS.length];
    const amount = Math.round((Math.random() * 480000 + 12000) * 100) / 100;
    const fees = Math.round(amount * 0.018 * 100) / 100;
    const tax = Math.round(fees * 0.18 * 100) / 100;
    const status = statuses[i % statuses.length];
    const initiated = new Date(2026, 5, ((i * 2) % 28) + 1, 9 + (i % 8), (i * 7) % 60);
    const settled =
      status === "Success" || status === "Failed"
        ? new Date(initiated.getTime() + 3600 * 1000 * (1 + (i % 6)))
        : undefined;
    return {
      id: `STL-${100234 + i}`,
      merchant: m,
      merchantCode: code,
      utr: status === "Initiated" ? "—" : `UTR${(987654321000 + i * 31).toString()}`,
      amount,
      fees,
      tax,
      type: types[i % types.length],
      status,
      initiatedOn: initiated.toISOString(),
      settledOn: settled?.toISOString(),
      bankRef: status === "Success" ? `RBI-${(50000 + i).toString()}` : undefined,
      failureReason:
        status === "Failed"
          ? i % 2 === 0
            ? "Rejected by management — KYB documents pending."
            : "Bank rejected — beneficiary account invalid."
          : undefined,
      timeline: buildTimeline(status, initiated, settled, i),
    };
  });
}

function buildTimeline(
  s: SettlementStatus,
  initiated: Date,
  settled: Date | undefined,
  i: number
): TimelineEvent[] {
  const t1 = initiated;
  const t2 = new Date(initiated.getTime() + 20 * 60 * 1000);
  const t3 = new Date(initiated.getTime() + 35 * 60 * 1000);
  const t4 = settled ?? new Date(initiated.getTime() + 90 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString();
  if (s === "Initiated") {
    return [
      { label: "Request Initiated", at: fmt(t1), state: "done" },
      { label: "Management Review", state: "active" },
      { label: "Sent to Bank", state: "idle" },
      { label: "Bank Response", state: "idle" },
      { label: "Settlement Completed", state: "idle" },
    ];
  }
  if (s === "Pending") {
    return [
      { label: "Request Initiated", at: fmt(t1), state: "done" },
      { label: "Approved by Management", at: fmt(t2), state: "done" },
      { label: "Sent to Bank", at: fmt(t3), state: "active" },
      { label: "Bank Response", state: "idle" },
      { label: "Settlement Completed", state: "idle" },
    ];
  }
  if (s === "Success") {
    return [
      { label: "Request Initiated", at: fmt(t1), state: "done" },
      { label: "Approved by Management", at: fmt(t2), state: "done" },
      { label: "Sent to Bank", at: fmt(t3), state: "done" },
      { label: "Bank Approved", at: fmt(t4), state: "done" },
      { label: "Settlement Completed", at: fmt(t4), state: "done" },
    ];
  }
  // Failed
  const mgmtReject = i % 2 === 0;
  return mgmtReject
    ? [
        { label: "Request Initiated", at: fmt(t1), state: "done" },
        { label: "Rejected by Management", at: fmt(t2), state: "failed", note: "Docs pending" },
        { label: "Sent to Bank", state: "idle" },
        { label: "Bank Response", state: "idle" },
        { label: "Settlement Completed", state: "idle" },
      ]
    : [
        { label: "Request Initiated", at: fmt(t1), state: "done" },
        { label: "Approved by Management", at: fmt(t2), state: "done" },
        { label: "Sent to Bank", at: fmt(t3), state: "done" },
        { label: "Bank Rejected", at: fmt(t4), state: "failed", note: "Invalid beneficiary" },
        { label: "Settlement Completed", state: "idle" },
      ];
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

function StatusPill({ status }: { status: SettlementStatus }) {
  const map: Record<
    SettlementStatus,
    { cls: string; dot: string; icon: JSX.Element; pulse?: boolean }
  > = {
    Initiated: {
      cls: "bg-info/10 text-info border-info/20",
      dot: "bg-info",
      icon: <Clock className="h-3 w-3" />,
    },
    Pending: {
      cls: "bg-warning/10 text-warning border-warning/20",
      dot: "bg-warning",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      pulse: true,
    },
    Success: {
      cls: "bg-success/10 text-success border-success/20",
      dot: "bg-success",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    Failed: {
      cls: "bg-destructive/10 text-destructive border-destructive/20",
      dot: "bg-destructive",
      icon: <XCircle className="h-3 w-3" />,
    },
  };
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        m.cls
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {m.pulse && (
          <span className={cn("absolute inset-0 rounded-full opacity-75 animate-ping", m.dot)} />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", m.dot)} />
      </span>
      {status}
    </span>
  );
}

function TimelineStep({ e, last }: { e: TimelineEvent; last: boolean }) {
  const dot =
    e.state === "done"
      ? "bg-success border-success/30"
      : e.state === "active"
      ? "bg-warning border-warning/30 animate-pulse"
      : e.state === "failed"
      ? "bg-destructive border-destructive/30"
      : "bg-muted border-border";
  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      {!last && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />}
      <span className={cn("mt-1 h-3.5 w-3.5 rounded-full border-2 shrink-0", dot)} />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm",
              e.state === "idle" ? "text-muted-foreground" : "text-foreground font-medium"
            )}
          >
            {e.label}
          </span>
          {e.at && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {format(new Date(e.at), "dd MMM, HH:mm")}
            </span>
          )}
        </div>
        {e.note && <p className="text-xs text-muted-foreground mt-0.5">{e.note}</p>}
      </div>
    </div>
  );
}

export default function Settlements() {
  const [rows, setRows] = useState<Settlement[]>(() => genSeed());
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<string>("all");
  const [merchantF, setMerchantF] = useState<string>("all");
  const [range, setRange] = useState<DateRange | undefined>();
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusF !== "all" && r.status !== statusF) return false;
      if (merchantF !== "all" && r.merchant !== merchantF) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !r.id.toLowerCase().includes(s) &&
          !r.merchant.toLowerCase().includes(s) &&
          !r.utr.toLowerCase().includes(s)
        )
          return false;
      }
      if (range?.from) {
        const d = new Date(r.initiatedOn);
        if (d < range.from) return false;
        if (range.to && d > range.to) return false;
      }
      return true;
    });
  }, [rows, q, statusF, merchantF, range]);

  const counts = useMemo(() => {
    const c = { all: rows.length, Initiated: 0, Pending: 0, Success: 0, Failed: 0 } as Record<string, number>;
    rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

  const total = useMemo(
    () => filtered.reduce((acc, r) => acc + (r.amount - r.fees - r.tax), 0),
    [filtered]
  );

  const open = openId ? rows.find((r) => r.id === openId) : null;

  const updateStatus = (id: string, status: SettlementStatus, opts?: { reason?: string }) => {
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const now = new Date();
        let tl = r.timeline.slice();
        if (status === "Pending") {
          tl = [
            { ...tl[0], state: "done" },
            { label: "Approved by Management", at: now.toISOString(), state: "done" },
            { label: "Sent to Bank", at: now.toISOString(), state: "active" },
            { label: "Bank Response", state: "idle" },
            { label: "Settlement Completed", state: "idle" },
          ];
        } else if (status === "Failed") {
          tl = [
            { ...tl[0], state: "done" },
            {
              label: "Rejected by Management",
              at: now.toISOString(),
              state: "failed",
              note: opts?.reason,
            },
            { label: "Sent to Bank", state: "idle" },
            { label: "Bank Response", state: "idle" },
            { label: "Settlement Completed", state: "idle" },
          ];
        }
        return {
          ...r,
          status,
          failureReason: status === "Failed" ? opts?.reason ?? r.failureReason : r.failureReason,
          timeline: tl,
        };
      })
    );
  };

  const handleApprove = (id: string) => {
    updateStatus(id, "Pending");
    toast.success("Approved", { description: `${id} sent to bank for processing.` });
    // Simulate bank async response
    setTimeout(() => {
      const outcome = Math.random() > 0.25 ? "Success" : "Failed";
      setRows((rs) =>
        rs.map((r) => {
          if (r.id !== id) return r;
          const now = new Date();
          const base = r.timeline.slice(0, 3).map((t, i) => (i === 2 ? { ...t, state: "done" as const } : t));
          const tl: TimelineEvent[] =
            outcome === "Success"
              ? [
                  ...base,
                  { label: "Bank Approved", at: now.toISOString(), state: "done" },
                  { label: "Settlement Completed", at: now.toISOString(), state: "done" },
                ]
              : [
                  ...base,
                  {
                    label: "Bank Rejected",
                    at: now.toISOString(),
                    state: "failed",
                    note: "Beneficiary account invalid",
                  },
                  { label: "Settlement Completed", state: "idle" },
                ];
          return {
            ...r,
            status: outcome as SettlementStatus,
            settledOn: now.toISOString(),
            bankRef: outcome === "Success" ? `RBI-${Math.floor(Math.random() * 90000 + 10000)}` : undefined,
            failureReason: outcome === "Failed" ? "Bank rejected — beneficiary account invalid." : undefined,
            utr: outcome === "Success" ? `UTR${Date.now()}` : r.utr,
            timeline: tl,
          };
        })
      );
      toast[outcome === "Success" ? "success" : "error"](
        outcome === "Success" ? "Settlement completed" : "Settlement failed",
        { description: `${id} ${outcome === "Success" ? "settled by bank." : "rejected by bank."}` }
      );
    }, 2800);
  };

  const handleReject = (id: string) => {
    updateStatus(id, "Failed", { reason: "Rejected by management." });
    toast.error("Rejected", { description: `${id} marked as failed.` });
  };

  const handleRetry = (id: string) => {
    updateStatus(id, "Initiated");
    toast("Re-queued", { description: `${id} re-initiated for review.` });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>Payins Service</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Settlements</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Settlement Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review, approve and track merchant settlement requests across the bank pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="gap-2 shadow-glow">
              <ArrowDownToLine className="h-4 w-4" /> New Settlement
            </Button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "All", value: counts.all, key: "all", tone: "muted" },
            { label: "Initiated", value: counts.Initiated || 0, key: "Initiated", tone: "info" },
            { label: "Pending", value: counts.Pending || 0, key: "Pending", tone: "warning" },
            { label: "Success", value: counts.Success || 0, key: "Success", tone: "success" },
            { label: "Failed", value: counts.Failed || 0, key: "Failed", tone: "destructive" },
          ].map((s) => {
            const active = statusF === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setStatusF(s.key)}
                className={cn(
                  "group text-left rounded-xl border bg-card/60 backdrop-blur-sm p-4 transition-all",
                  "hover:shadow-elevated hover:-translate-y-0.5",
                  active && "border-primary/40 shadow-glow bg-gradient-to-br from-primary/5 to-transparent"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      s.tone === "info" && "bg-info",
                      s.tone === "warning" && "bg-warning",
                      s.tone === "success" && "bg-success",
                      s.tone === "destructive" && "bg-destructive",
                      s.tone === "muted" && "bg-muted-foreground"
                    )}
                  />
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search settlement ID, merchant, UTR..."
              className="pl-9 bg-background/60"
            />
          </div>
          <Select value={merchantF} onValueChange={setMerchantF}>
            <SelectTrigger className="w-[180px] bg-background/60">
              <SelectValue placeholder="Merchant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Merchants</SelectItem>
              {MERCHANTS.map(([m]) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[150px] bg-background/60">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Initiated">Initiated</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background/60">
                <CalendarIcon className="h-4 w-4" />
                {range?.from
                  ? range.to
                    ? `${format(range.from, "dd MMM")} – ${format(range.to, "dd MMM")}`
                    : format(range.from, "dd MMM yyyy")
                  : "Date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {(q || statusF !== "all" || merchantF !== "all" || range) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ("");
                setStatusF("all");
                setMerchantF("all");
                setRange(undefined);
              }}
            >
              Clear
            </Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground px-2">
            Net total:{" "}
            <span className="text-foreground font-semibold tabular-nums">{fmtINR(total)}</span>
          </div>
        </div>

        {/* Card-table */}
        <div className="rounded-xl border bg-gradient-to-b from-card to-card/60 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              {/* Header row */}
              <div className="grid grid-cols-[1.6fr_1.1fr_1.2fr_1fr_1fr_1fr_0.9fr_1fr_1.1fr_1.1fr_1.2fr] gap-3 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium border-b bg-muted/30">
                <div>Merchant</div>
                <div>Settlement ID</div>
                <div>UTR / Ref</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Fees & Tax</div>
                <div className="text-right">Net Amount</div>
                <div>Type</div>
                <div>Status</div>
                <div>Initiated On</div>
                <div>Settled On</div>
                <div className="text-right">Action</div>
              </div>

              <div className="p-2 space-y-1.5">
                {filtered.length === 0 && (
                  <div className="py-20 text-center text-sm text-muted-foreground">
                    No settlements match the filters.
                  </div>
                )}
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setOpenId(r.id)}
                    className={cn(
                      "group relative grid grid-cols-[1.6fr_1.1fr_1.2fr_1fr_1fr_1fr_0.9fr_1fr_1.1fr_1.1fr_1.2fr] gap-3 items-center",
                      "px-3 py-3 rounded-lg border border-transparent bg-card cursor-pointer",
                      "transition-all duration-200",
                      "hover:border-primary/20 hover:shadow-elevated hover:-translate-y-[1px]",
                      "hover:bg-gradient-to-r hover:from-primary/[0.04] hover:to-transparent"
                    )}
                  >
                    {/* Merchant */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                        {r.merchantCode}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{r.merchant}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {r.merchant.toLowerCase().replace(/\s+/g, "")}.com
                        </div>
                      </div>
                    </div>
                    {/* ID */}
                    <div className="text-sm font-mono text-foreground/90">{r.id}</div>
                    {/* UTR */}
                    <div className="text-xs font-mono text-muted-foreground truncate">{r.utr}</div>
                    {/* Amount */}
                    <div className="text-sm text-right tabular-nums font-medium">{fmtINR(r.amount)}</div>
                    {/* Fees & Tax */}
                    <div className="text-sm text-right tabular-nums text-muted-foreground">
                      {fmtINR(r.fees + r.tax)}
                    </div>
                    {/* Net */}
                    <div className="text-sm text-right tabular-nums font-semibold text-foreground">
                      {fmtINR(r.amount - r.fees - r.tax)}
                    </div>
                    {/* Type */}
                    <div>
                      <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                        {r.type}
                      </span>
                    </div>
                    {/* Status */}
                    <div>
                      <StatusPill status={r.status} />
                    </div>
                    {/* Initiated */}
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {format(new Date(r.initiatedOn), "dd MMM, HH:mm")}
                    </div>
                    {/* Settled */}
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {r.settledOn ? format(new Date(r.settledOn), "dd MMM, HH:mm") : "—"}
                    </div>
                    {/* Actions */}
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.status === "Initiated" && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 gap-1 bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => handleApprove(r.id)}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => handleReject(r.id)}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      {r.status === "Pending" && (
                        <div className="flex items-center gap-2 text-xs text-warning">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Processing</span>
                        </div>
                      )}
                      {r.status === "Success" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => setOpenId(r.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => toast.success("Receipt downloaded")}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download receipt</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                      {r.status === "Failed" && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {r.failureReason ?? "Unknown failure"}
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => handleRetry(r.id)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Retry
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details Sheet */}
        <Sheet open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            {open && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {open.merchantCode}
                    </div>
                    <div>
                      <SheetTitle className="text-base">{open.merchant}</SheetTitle>
                      <SheetDescription className="font-mono text-xs">{open.id}</SheetDescription>
                    </div>
                    <div className="ml-auto">
                      <StatusPill status={open.status} />
                    </div>
                  </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Breakdown */}
                  <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4">
                    <div className="text-xs text-muted-foreground">Net Settlement Amount</div>
                    <div className="text-3xl font-semibold tabular-nums mt-1">
                      {fmtINR(open.amount - open.fees - open.tax)}
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Gross</div>
                        <div className="font-medium tabular-nums">{fmtINR(open.amount)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Fees</div>
                        <div className="font-medium tabular-nums">{fmtINR(open.fees)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Tax (GST)</div>
                        <div className="font-medium tabular-nums">{fmtINR(open.tax)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MetaTile icon={<Building2 className="h-3.5 w-3.5" />} label="Merchant" value={open.merchant} />
                    <MetaTile icon={<Receipt className="h-3.5 w-3.5" />} label="Type" value={open.type} />
                    <MetaTile icon={<Landmark className="h-3.5 w-3.5" />} label="UTR / Ref" value={open.utr} mono />
                    <MetaTile
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      label="Bank Ref"
                      value={open.bankRef ?? "—"}
                      mono
                    />
                    <MetaTile
                      icon={<Clock className="h-3.5 w-3.5" />}
                      label="Initiated"
                      value={format(new Date(open.initiatedOn), "dd MMM yyyy, HH:mm")}
                    />
                    <MetaTile
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      label="Settled"
                      value={open.settledOn ? format(new Date(open.settledOn), "dd MMM yyyy, HH:mm") : "—"}
                    />
                  </div>

                  {open.status === "Failed" && open.failureReason && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-destructive">Failure reason</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{open.failureReason}</div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <div className="text-sm font-medium mb-3">Lifecycle Timeline</div>
                    <div className="rounded-xl border bg-card p-4">
                      {open.timeline.map((e, i) => (
                        <TimelineStep key={i} e={e} last={i === open.timeline.length - 1} />
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {open.status === "Initiated" && (
                      <>
                        <Button
                          className="flex-1 bg-success hover:bg-success/90 text-success-foreground gap-2"
                          onClick={() => {
                            handleApprove(open.id);
                            setOpenId(null);
                          }}
                        >
                          <Check className="h-4 w-4" /> Approve & send to bank
                        </Button>
                        <Button
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
                          onClick={() => {
                            handleReject(open.id);
                            setOpenId(null);
                          }}
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                    {open.status === "Success" && (
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => toast.success("Receipt downloaded")}
                      >
                        <Download className="h-4 w-4" /> Download receipt
                      </Button>
                    )}
                    {open.status === "Failed" && (
                      <Button
                        className="flex-1 gap-2"
                        variant="outline"
                        onClick={() => {
                          handleRetry(open.id);
                          setOpenId(null);
                        }}
                      >
                        <RefreshCw className="h-4 w-4" /> Retry settlement
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

function MetaTile({
  icon,
  label,
  value,
  mono,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={cn("text-sm font-medium mt-1 truncate", mono && "font-mono")}>{value}</div>
    </div>
  );
}
