import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RotateCcw, Filter, Eye, Copy, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { merchants } from "@/data/refundsMock";
import { RefundBadge } from "@/components/refunds/RefundBadge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function Refunds() {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ status: "all", search: "" });
  const [selectedId, setSelectedId] = useState<string | null>(merchants[0]?.id ?? null);
  const [vaSearch, setVaSearch] = useState("");

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      if (applied.status !== "all" && m.status !== applied.status) return false;
      if (applied.search && !m.name.toLowerCase().includes(applied.search.toLowerCase())) return false;
      return true;
    });
  }, [applied]);

  useEffect(() => {
    if (selectedId && !filtered.find((m) => m.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((m) => m.id === selectedId) ?? null;

  const vas = useMemo(() => {
    if (!selected) return [];
    const q = vaSearch.toLowerCase();
    return selected.vas.filter(
      (v) => !q || v.vaNo.toLowerCase().includes(q) || v.bank.toLowerCase().includes(q)
    );
  }, [selected, vaSearch]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payins / Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse merchants and their linked virtual accounts.</p>
      </div>

      <Card className="surface-card">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Merchant Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
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
                <Input className="pl-9" placeholder="Search merchants…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setApplied({ status, search })}>
              <Filter className="h-4 w-4 mr-2" />Apply
            </Button>
            <Button variant="ghost" onClick={() => { setStatus("all"); setSearch(""); setApplied({ status: "all", search: "" }); }}>
              <RotateCcw className="h-4 w-4 mr-2" />Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className={cn("grid gap-6", selected ? "grid-cols-1 lg:grid-cols-[1fr_380px]" : "grid-cols-1")}>
        {/* Merchant table */}
        <Card className="surface-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>MERCHANT</TableHead>
                <TableHead>ONBOARDED</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACCOUNTS</TableHead>
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
              {filtered.map((m, idx) => {
                const active = m.id === selectedId;
                const onboarded = new Date(2024, (idx * 3) % 12, ((idx * 7) % 27) + 1)
                  .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                return (
                  <TableRow
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={cn(
                      "cursor-pointer transition-colors relative",
                      active ? "bg-primary/5 hover:bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary" />}
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {initials(m.name)}
                        </div>
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.vas.length} linked account{m.vas.length === 1 ? "" : "s"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{onboarded}</TableCell>
                    <TableCell><RefundBadge status={m.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedId(m.id); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Right side panel */}
        {selected && (
          <Card className="surface-card h-fit sticky top-4">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {initials(selected.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{selected.name}</div>
                </div>
                <RefundBadge status={selected.status} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">LINKED VIRTUAL ACCOUNTS</span>
                <span className="text-xs font-medium text-muted-foreground">{selected.vas.length}</span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-9" placeholder="Search by account or bank…" value={vaSearch} onChange={(e) => setVaSearch(e.target.value)} />
              </div>

              <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
                {vas.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8">No virtual accounts.</div>
                )}
                {vas.map((v) => (
                  <div key={v.vaNo} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                    <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{v.bank}</div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">{v.vaNo}</div>
                    </div>
                    <RefundBadge status={v.status} />
                    <Link to={`/payins/refunds/${v.vaNo}`}>
                      <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(v.vaNo);
                        toast({ title: "Copied", description: `${v.vaNo} copied to clipboard.` });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
