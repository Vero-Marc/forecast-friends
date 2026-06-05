import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowUpDown, CalendarIcon, ChevronRight, Download, Eye, Filter, RotateCcw, Search, FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { findMerchantByVA, refundsForVA, formatCurrency, formatDateTime, RefundStatus } from "@/data/refundsMock";
import { RefundBadge } from "@/components/refunds/RefundBadge";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const STATUSES: RefundStatus[] = ["Pending", "Processing", "Success", "Failed", "Reversed"];

type SortKey = "dateTime" | "refundedAmount" | "transactionAmount";

export default function RefundsByVA() {
  const { vaNo = "" } = useParams();
  const info = findMerchantByVA(vaNo);
  const refunds = useMemo(() => refundsForVA(vaNo), [vaNo]);

  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [crn, setCrn] = useState("");
  const [rid, setRid] = useState("");
  const [applied, setApplied] = useState({ status: "all", from: undefined as Date | undefined, to: undefined as Date | undefined, crn: "", rid: "" });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "dateTime", dir: "desc" });
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    let rows = refunds.filter((r) => {
      if (applied.status !== "all" && r.status !== applied.status) return false;
      if (applied.crn && !r.crn.toLowerCase().includes(applied.crn.toLowerCase())) return false;
      if (applied.rid && !r.refundId.toLowerCase().includes(applied.rid.toLowerCase())) return false;
      const d = new Date(r.dateTime).getTime();
      if (applied.from && d < applied.from.getTime()) return false;
      if (applied.to && d > applied.to.getTime() + 86400000) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = sort.key === "dateTime" ? new Date(a.dateTime).getTime() : (a as any)[sort.key];
      const bv = sort.key === "dateTime" ? new Date(b.dateTime).getTime() : (b as any)[sort.key];
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    return rows;
  }, [refunds, applied, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRefunds = refunds.length;
  const totalAmount = refunds.reduce((s, r) => s + r.refundedAmount, 0);
  const pending = refunds.filter((r) => r.status === "Pending" || r.status === "Processing").length;
  const successRate = refunds.length ? Math.round((refunds.filter((r) => r.status === "Success").length / refunds.length) * 100) : 0;

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/payins/refunds" className="hover:text-foreground">Payins / Refunds</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{info?.merchant.name ?? "Merchant"}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{vaNo}</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Refunds · {vaNo}</h1>
        <p className="text-sm text-muted-foreground mt-1">{info?.va.label ?? "Virtual Account"} · {info?.va.bank}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Refunds" value={totalRefunds.toString()} />
        <SummaryCard label="Total Refunded Amount" value={formatCurrency(totalAmount)} />
        <SummaryCard label="Pending Refunds" value={pending.toString()} tint="warning" />
        <SummaryCard label="Success Rate" value={`${successRate}%`} tint="success" />
      </div>

      <Card className="surface-card">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <DatePick value={from} onChange={setFrom} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <DatePick value={to} onChange={setTo} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">CRN</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={crn} onChange={(e) => setCrn(e.target.value)} placeholder="Search CRN" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Refund ID</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={rid} onChange={(e) => setRid(e.target.value)} placeholder="Search Refund ID" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => { setApplied({ status, from, to, crn, rid }); setPage(1); }}>
              <Filter className="h-4 w-4 mr-2" />Apply
            </Button>
            <Button variant="ghost" onClick={() => { setStatus("all"); setFrom(undefined); setTo(undefined); setCrn(""); setRid(""); setApplied({ status: "all", from: undefined, to: undefined, crn: "", rid: "" }); setPage(1); }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm font-medium">Refunds ({filtered.length})</div>
          <Button onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Refund ID</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>CRN</TableHead>
              <TableHead>
                <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("refundedAmount")}>
                  Refunded Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("transactionAmount")}>
                  Transaction Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("dateTime")}>
                  Date &amp; Time <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-16 text-muted-foreground">No refunds match the current filters.</TableCell></TableRow>
            )}
            {pageData.map((r) => (
              <TableRow key={r.refundId}>
                <TableCell className="font-medium">{r.refundId}</TableCell>
                <TableCell>{r.paymentMethod}</TableCell>
                <TableCell className="text-muted-foreground">{r.crn}</TableCell>
                <TableCell>{formatCurrency(r.refundedAmount)}</TableCell>
                <TableCell>{formatCurrency(r.transactionAmount)}</TableCell>
                <TableCell><RefundBadge status={r.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(r.dateTime)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link to={`/payins/refunds/${vaNo}/${r.refundId}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-xs text-muted-foreground">
            Showing {pageData.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + pageData.length} of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </Card>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        exporting={exporting}
        onExport={async (cfg) => {
          setExporting(true);
          await new Promise((r) => setTimeout(r, 700));
          const rows = refunds.filter((r) => {
            if (cfg.statuses.length && !cfg.statuses.includes(r.status)) return false;
            const d = new Date(r.dateTime).getTime();
            if (cfg.from && d < cfg.from.getTime()) return false;
            if (cfg.to && d > cfg.to.getTime() + 86400000) return false;
            return true;
          }).map((r) => ({
            "Refund ID": r.refundId, "CRN": r.crn, "Payment Method": r.paymentMethod,
            "Refunded Amount": r.refundedAmount, "Transaction Amount": r.transactionAmount,
            "Status": r.status, "Date": formatDateTime(r.dateTime),
          }));
          const filename = `refunds-${vaNo}-${Date.now()}.${cfg.format}`;
          if (cfg.format === "csv") {
            const ws = XLSX.utils.json_to_sheet(rows);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
          } else {
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Refunds");
            XLSX.writeFile(wb, filename);
          }
          setExporting(false);
          setExportOpen(false);
          toast.success(`Exported ${rows.length} refunds`);
        }}
      />
    </div>
  );
}

function SummaryCard({ label, value, tint }: { label: string; value: string; tint?: "warning" | "success" }) {
  const tints = { warning: "text-warning", success: "text-success" };
  return (
    <Card className="surface-card">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-semibold mt-2", tint && tints[tint])}>{value}</p>
      </CardContent>
    </Card>
  );
}

function DatePick({ value, onChange }: { value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          {value ? format(value, "dd MMM yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}

function ExportDialog({
  open, onOpenChange, exporting, onExport,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  exporting: boolean;
  onExport: (cfg: { from?: Date; to?: Date; statuses: RefundStatus[]; format: "csv" | "xlsx" }) => void;
}) {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [statuses, setStatuses] = useState<RefundStatus[]>([]);
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-primary" /> Export Refunds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From <span className="text-destructive">*</span></Label>
              <DatePick value={from} onChange={setFrom} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To <span className="text-destructive">*</span></Label>
              <DatePick value={to} onChange={setTo} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Status (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={statuses.includes(s)}
                    onCheckedChange={(c) => setStatuses((prev) => c ? [...prev, s] : prev.filter((x) => x !== s))}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)} className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="csv" /> CSV</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="xlsx" /> XLSX</label>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!from || !to || exporting} onClick={() => onExport({ from, to, statuses, format })}>
            {exporting ? "Exporting…" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
