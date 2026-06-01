import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { organizations } from "@/data/mockData";
import {
  ArrowLeft, Save, AlertTriangle, X, Plus, Trash2, Wallet,
  ShieldAlert, Activity, Hash, Building2,
} from "lucide-react";
import { toast } from "sonner";

type TxnType = "UPI" | "CARD" | "NEFT" | "IMPS" | "RTGS" | "NETBANKING";
const ALL_TYPES: { value: TxnType; label: string; sub: string }[] = [
  { value: "UPI", label: "UPI", sub: "Unified Payments Interface" },
  { value: "CARD", label: "CARD", sub: "Card" },
  { value: "NEFT", label: "NEFT", sub: "Electronic Funds Transfer" },
  { value: "IMPS", label: "IMPS", sub: "Immediate Payment" },
  { value: "RTGS", label: "RTGS", sub: "Real Time Settlement" },
  { value: "NETBANKING", label: "Net Banking", sub: "Net Banking" },
];

type LimitRow = { type: TxnType; min: string; max: string; total: string };
type CommissionRow = { base: string; method: "Flatrate" | "Percentage"; gateway: string; partner: string };

const seedVAs = [
  { id: "VA-7821", alias: "Primary collections", accountNumber: "XXXX 4421 9912", bank: "Pinnacle Trust", active: true },
  { id: "VA-7822", alias: "Subscriptions", accountNumber: "XXXX 4421 9913", bank: "Pinnacle Trust", active: true },
  { id: "VA-7823", alias: "Refund pool", accountNumber: "XXXX 4421 9914", bank: "Pinnacle Trust", active: false },
];

function TypeMultiSelect({ value, onChange }: { value: TxnType[]; onChange: (v: TxnType[]) => void }) {
  const [open, setOpen] = useState(false);
  const available = ALL_TYPES.filter((t) => !value.includes(t.value));
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-10 rounded-md border bg-background px-3 py-1.5 text-left text-sm flex flex-wrap items-center gap-1.5"
      >
        {value.length === 0 && <span className="text-muted-foreground">Select types</span>}
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
            {v}
            <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== v)); }} />
          </span>
        ))}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {available.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">All selected</div>}
          {available.map((t) => (
            <button
              key={t.value}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
              onClick={() => { onChange([...value, t.value]); setOpen(false); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UpdateVA() {
  const { id, vaId } = useParams();
  const navigate = useNavigate();
  const org = organizations.find((o) => o.id === id) ?? organizations[0];

  const [selected, setSelected] = useState<string>(vaId ?? seedVAs[0].id);
  const va = useMemo(() => seedVAs.find((v) => v.id === selected) ?? seedVAs[0], [selected]);

  const [txnLimit, setTxnLimit] = useState("10000000");
  const [dailyDeposit, setDailyDeposit] = useState("1000000");
  const [minAmount, setMinAmount] = useState("100");
  const [maxAmount, setMaxAmount] = useState("10000000");
  const [types, setTypes] = useState<TxnType[]>(["IMPS", "NEFT", "RTGS"]);
  const [allowNonWhitelisted, setAllowNonWhitelisted] = useState(false);
  const [limitRows, setLimitRows] = useState<LimitRow[]>([
    { type: "IMPS", min: "100", max: "100000", total: "1000000" },
    { type: "NEFT", min: "100", max: "1000000", total: "1000000" },
    { type: "RTGS", min: "200000", max: "3000000", total: "3000000" },
  ]);
  const [commission, setCommission] = useState<CommissionRow[]>([
    { base: "100", method: "Flatrate", gateway: "3.00", partner: "2.00" },
    { base: "1000", method: "Percentage", gateway: "0.50", partner: "0.50" },
    { base: "10000", method: "Percentage", gateway: "0.50", partner: "1.00" },
  ]);

  const syncedRows = types.map((t) => limitRows.find((r) => r.type === t) ?? { type: t, min: "", max: "", total: "" });

  const goBack = () => navigate(`/organizations/${org.id}?activated=1`);

  return (
    <div className="space-y-5">
      {/* Compact header bar */}
      <div className="flex items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/organizations/${org.id}?activated=1`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <p className="text-xs text-muted-foreground">{org.name} · {org.id}</p>
            <h1 className="text-xl font-semibold leading-tight">Update Virtual Account</h1>
          </div>
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-72 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seedVAs.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.id} — {v.alias}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* LEFT: sticky summary */}
        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <Card className="surface-elevated overflow-hidden">
            <div className="gradient-soft px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Virtual account</span>
              </div>
              <p className="text-lg font-semibold mt-1.5">{va.alias}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{va.id}</p>
            </div>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">A/C</span>
                <span className="ml-auto font-mono text-xs">{va.accountNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Bank</span>
                <span className="ml-auto font-medium">{va.bank}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="ml-auto rounded-full">
                  {va.active ? "Reserved" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex gap-3">
              <ShieldAlert className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Changes are versioned. Updating commission emits a new effective-from rule.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="gradient-primary text-primary-foreground" onClick={() => { toast.success("VA updated"); goBack(); }}>
              <Save className="mr-1.5 h-4 w-4" /> Save changes
            </Button>
            <Button variant="outline" onClick={goBack}>Cancel</Button>
          </div>
        </aside>

        {/* RIGHT: scrollable groups */}
        <div className="space-y-5">
          {/* Limits group */}
          <Card className="surface-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Transaction Limit</Label><Input value={txnLimit} onChange={(e) => setTxnLimit(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Daily Deposit Limit</Label><Input value={dailyDeposit} onChange={(e) => setDailyDeposit(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Minimum Transaction Amount</Label><Input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Maximum Transaction Amount</Label><Input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} /></div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Transaction Types</Label>
                <TypeMultiSelect value={types} onChange={setTypes} />
              </div>
            </CardContent>
          </Card>

          {/* Per-method limits */}
          <Card className="surface-card">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Per-method limits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead>Min</TableHead>
                    <TableHead>Max</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncedRows.map((r, i) => {
                    const meta = ALL_TYPES.find((t) => t.value === r.type)!;
                    const update = (patch: Partial<LimitRow>) => {
                      const next = [...syncedRows];
                      next[i] = { ...r, ...patch };
                      setLimitRows(next);
                    };
                    return (
                      <TableRow key={r.type}>
                        <TableCell>
                          <div className="text-sm font-medium">{meta.label}</div>
                          <div className="text-xs text-muted-foreground">{meta.sub}</div>
                        </TableCell>
                        <TableCell><Input value={r.min} onChange={(e) => update({ min: e.target.value })} /></TableCell>
                        <TableCell><Input value={r.max} onChange={(e) => update({ max: e.target.value })} /></TableCell>
                        <TableCell><Input value={r.total} onChange={(e) => update({ total: e.target.value })} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Non-whitelisted toggle */}
          <Card className="surface-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm">Allow Funds from Non-Whitelisted Accounts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Control whether this VA can receive funds from unverified bank accounts.</p>
                </div>
                <Switch checked={allowNonWhitelisted} onCheckedChange={setAllowNonWhitelisted} />
              </div>
              {allowNonWhitelisted && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 text-destructive p-2.5 text-xs">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Enabling this increases risk exposure. Ensure compliance review has approved this change.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Commission */}
          <Card className="surface-card">
            <CardHeader className="border-b flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Commission setup
              </CardTitle>
              <Select defaultValue="tomorrow">
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Effective today</SelectItem>
                  <SelectItem value="tomorrow">Effective tomorrow</SelectItem>
                  <SelectItem value="next-week">Next week</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                <div>Base Amount</div><div>Method</div><div>Gateway Fee</div><div>Partner Fee</div><div className="w-9"></div>
              </div>
              {commission.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center">
                  <Input value={r.base} disabled={i === 0} onChange={(e) => setCommission(commission.map((x, idx) => idx === i ? { ...x, base: e.target.value } : x))} />
                  <Select value={r.method} onValueChange={(v) => setCommission(commission.map((x, idx) => idx === i ? { ...x, method: v as any } : x))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flatrate">Flatrate ₹</SelectItem>
                      <SelectItem value="Percentage">Percentage %</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={r.gateway} onChange={(e) => setCommission(commission.map((x, idx) => idx === i ? { ...x, gateway: e.target.value } : x))} />
                  <Input value={r.partner} onChange={(e) => setCommission(commission.map((x, idx) => idx === i ? { ...x, partner: e.target.value } : x))} />
                  {i > 0 ? (
                    <Button type="button" size="icon" variant="ghost" className="rounded-full border"
                      onClick={() => setCommission(commission.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : <div className="w-9" />}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm"
                onClick={() => setCommission([...commission, { base: "", method: "Flatrate", gateway: "0", partner: "0" }])}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add tier
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
