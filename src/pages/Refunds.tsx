import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, RotateCcw, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { merchants, formatCurrency } from "@/data/refundsMock";
import { RefundBadge } from "@/components/refunds/RefundBadge";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function Refunds() {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ status: "all", search: "" });
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      if (applied.status !== "all" && m.status !== applied.status) return false;
      if (applied.search && !m.name.toLowerCase().includes(applied.search.toLowerCase())) return false;
      return true;
    });
  }, [applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payins / Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse merchants and their virtual accounts to manage refunds.</p>
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
            <Button onClick={() => { setApplied({ status, search }); setPage(1); }}>
              <Filter className="h-4 w-4 mr-2" />Apply Filters
            </Button>
            <Button variant="ghost" onClick={() => { setStatus("all"); setSearch(""); setApplied({ status: "all", search: "" }); setPage(1); }}>
              <RotateCcw className="h-4 w-4 mr-2" />Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Merchant Name</TableHead>
              <TableHead>Merchant ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total VAs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  No merchants match the current filters.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((m) => {
              const isOpen = !!expanded[m.id];
              return (
                <>
                  <TableRow key={m.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setExpanded((p) => ({ ...p, [m.id]: !p[m.id] }))}>
                    <TableCell>
                      <ChevronRight className={cn("h-4 w-4 transition-transform text-muted-foreground", isOpen && "rotate-90")} />
                    </TableCell>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.id}</TableCell>
                    <TableCell><RefundBadge status={m.status} /></TableCell>
                    <TableCell>{m.vas.length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [m.id]: !p[m.id] })); }}>
                        {isOpen ? "Hide VAs" : "View VAs"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow key={m.id + "-sub"} className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={6} className="p-0">
                        <div className="px-6 py-4">
                          <div className="rounded-md border bg-card overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>VA Number</TableHead>
                                  <TableHead>VA Label</TableHead>
                                  <TableHead>Bank</TableHead>
                                  <TableHead>Currency</TableHead>
                                  <TableHead>Balance</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {m.vas.map((v, i) => (
                                  <TableRow key={v.vaNo} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                                    <TableCell>
                                      <Link to={`/payins/refunds/${v.vaNo}`} className="text-primary font-medium hover:underline">
                                        {v.vaNo}
                                      </Link>
                                    </TableCell>
                                    <TableCell>{v.label}</TableCell>
                                    <TableCell>{v.bank}</TableCell>
                                    <TableCell>{v.currency}</TableCell>
                                    <TableCell>{formatCurrency(v.balance)}</TableCell>
                                    <TableCell><RefundBadge status={v.status} /></TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
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
    </div>
  );
}
