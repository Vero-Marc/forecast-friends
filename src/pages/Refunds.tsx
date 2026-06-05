import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RotateCcw, Filter, GripVertical, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { merchants, formatCurrency } from "@/data/refundsMock";
import { RefundBadge } from "@/components/refunds/RefundBadge";
import { cn } from "@/lib/utils";

export default function Refunds() {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ status: "all", search: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      if (applied.status !== "all" && m.status !== applied.status) return false;
      if (applied.search && !m.name.toLowerCase().includes(applied.search.toLowerCase())) return false;
      return true;
    });
  }, [applied]);

  useEffect(() => {
    if (filtered.length && !filtered.find((m) => m.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((m) => m.id === selectedId) ?? null;

  // Split panel drag
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPct, setLeftPct] = useState(58);
  const draggingRef = useRef(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(80, Math.max(30, pct)));
    }
    function onUp() {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payins / Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a merchant to view their virtual accounts. Drag the divider to resize.</p>
      </div>

      <Card className="surface-card">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Merchant Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Search Merchant</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by merchant name…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setApplied({ status, search })}>
              <Filter className="h-4 w-4 mr-2" />Apply Filters
            </Button>
            <Button variant="ghost" onClick={() => { setStatus("all"); setSearch(""); setApplied({ status: "all", search: "" }); }}>
              <RotateCcw className="h-4 w-4 mr-2" />Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card overflow-hidden">
        <div
          ref={containerRef}
          className="relative flex w-full select-none"
          style={{ minHeight: 520 }}
        >
          {/* Left: Merchant table */}
          <div className="overflow-auto" style={{ width: `${leftPct}%` }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Merchant ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">VAs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                      No merchants match the current filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((m) => {
                  const active = m.id === selectedId;
                  return (
                    <TableRow
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        active ? "bg-primary/10 hover:bg-primary/10" : "hover:bg-muted/40"
                      )}
                    >
                      <TableCell className={cn("font-medium", active && "text-primary")}>{m.name}</TableCell>
                      <TableCell className="text-muted-foreground">{m.id}</TableCell>
                      <TableCell><RefundBadge status={m.status} /></TableCell>
                      <TableCell className="text-right">{m.vas.length}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Drag handle */}
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={() => {
              draggingRef.current = true;
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            className="group relative w-1.5 cursor-col-resize bg-border hover:bg-primary/40 transition-colors"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-5 rounded-md border bg-card flex items-center justify-center shadow-sm group-hover:border-primary/40">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Right: VA list */}
          <div className="flex-1 overflow-auto bg-muted/10">
            {selected ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 px-2 pb-2 border-b">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    {selected.name} <span className="text-muted-foreground font-normal">— virtual accounts</span>
                  </h3>
                  <RefundBadge status={selected.status} className="ml-auto" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>VA Number</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.vas.map((v, i) => (
                      <TableRow key={v.vaNo} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                        <TableCell>
                          <Link to={`/payins/refunds/${v.vaNo}`} className="text-primary font-medium hover:underline">
                            {v.vaNo}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">{v.label}</TableCell>
                        <TableCell className="text-muted-foreground">{v.bank}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.balance)}</TableCell>
                        <TableCell className="text-right"><RefundBadge status={v.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Select a merchant to view virtual accounts
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
