import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { organizations } from "@/data/mockData";
import {
  ArrowLeft, ShieldCheck, Building2, Sliders, ListChecks, Percent,
  Plus, Trash2, X,
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

function SectionCard({
  step, icon: Icon, title, desc, children,
}: { step: number; icon: any; title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card className="surface-card overflow-hidden">
      <div className="flex items-start gap-4 border-b bg-gradient-soft px-5 py-4">
        <div className="h-10 w-10 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center font-semibold shadow-glow shrink-0">
          {step}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

export default function CreateVA() {
  const { id } = useParams();
  const navigate = useNavigate();
  const org = organizations.find((o) => o.id === id) ?? organizations[0];

  const [pipeline, setPipeline] = useState("MOCK");
  const [txnLimit, setTxnLimit] = useState("");
  const [dailyDeposit, setDailyDeposit] = useState("");
  const [minAmount, setMinAmount] = useState("100");
  const [maxAmount, setMaxAmount] = useState("");
  const [types, setTypes] = useState<TxnType[]>(["UPI", "CARD"]);
  const [limitRows, setLimitRows] = useState<LimitRow[]>([]);
  const [commission, setCommission] = useState<CommissionRow[]>([
    { base: "100", method: "Flatrate", gateway: "0", partner: "0" },
    { base: "1000", method: "Flatrate", gateway: "0", partner: "0" },
  ]);

  // sync limit rows with selected types
  const syncedRows = types.map((t) => limitRows.find((r) => r.type === t) ?? { type: t, min: "", max: "", total: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Virtual account created");
    navigate(`/organizations/${org.id}?activated=1`);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl gradient-primary text-primary-foreground p-5 md:p-6 shadow-glow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" asChild className="text-primary-foreground hover:bg-white/10">
              <Link to={`/organizations/${org.id}?activated=1`}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
                <span>{org.name}</span><span>·</span><span>{org.id}</span>
              </div>
              <h1 className="text-2xl font-semibold leading-tight mt-0.5">Create Virtual Account</h1>
              <p className="text-sm text-primary-foreground/80 mt-1">Configure pipeline, limits, methods and commission in a single guided flow.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" asChild className="text-primary-foreground hover:bg-white/10">
              <Link to={`/organizations/${org.id}?activated=1`}>Cancel</Link>
            </Button>
            <Button type="submit" variant="secondary" className="font-medium">
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Create VA
            </Button>
          </div>
        </div>
      </div>

      {/* Step 1: Pipeline */}
      <SectionCard step={1} icon={Building2} title="Banking pipeline" desc="Pick the pipeline that will host this virtual account.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Banking Pipeline</Label>
            <Select value={pipeline} onValueChange={setPipeline}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MOCK">MOCK</SelectItem>
                <SelectItem value="IDFC">IDFC</SelectItem>
                <SelectItem value="ICICI">ICICI</SelectItem>
                <SelectItem value="HDFC">HDFC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Transaction Types</Label>
            <TypeMultiSelect value={types} onChange={setTypes} />
          </div>
        </div>
      </SectionCard>

      {/* Step 2: Limits */}
      <SectionCard step={2} icon={Sliders} title="Limits" desc="Overall caps applied across this VA.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5"><Label>Transaction Limit</Label><Input placeholder="Enter Transaction Limit" value={txnLimit} onChange={(e) => setTxnLimit(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Daily Deposit Limit</Label><Input placeholder="Enter Daily Deposit Limit" value={dailyDeposit} onChange={(e) => setDailyDeposit(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Minimum Transaction Amount</Label><Input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Maximum Transaction Amount</Label><Input placeholder="Enter Max Amount" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} /></div>
        </div>
      </SectionCard>

      {/* Step 3: Per-method limits */}
      <SectionCard step={3} icon={ListChecks} title="Per-method limits" desc="Tune min, max and total caps for each selected transaction type.">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Transaction Type</TableHead>
                <TableHead>Min Value</TableHead>
                <TableHead>Max Value</TableHead>
                <TableHead>Total Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncedRows.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">Select transaction types in step 1</TableCell></TableRow>
              )}
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
                    <TableCell><Input placeholder="Min" value={r.min} onChange={(e) => update({ min: e.target.value })} /></TableCell>
                    <TableCell><Input placeholder="Max" value={r.max} onChange={(e) => update({ max: e.target.value })} /></TableCell>
                    <TableCell><Input placeholder="Total" value={r.total} onChange={(e) => update({ total: e.target.value })} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Step 4: Commission */}
      <SectionCard step={4} icon={Percent} title="Commission setup" desc="Define gateway and partner fees by base amount tier.">
        <div className="space-y-3">
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
        </div>
      </SectionCard>

      {/* Sticky footer */}
      <div className="sticky bottom-4 z-10">
        <div className="surface-elevated flex items-center justify-between px-4 py-3 rounded-xl">
          <p className="text-xs text-muted-foreground">All set? Create the virtual account with the configuration above.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to={`/organizations/${org.id}?activated=1`}>Cancel</Link>
            </Button>
            <Button type="submit" className="gradient-primary text-primary-foreground">
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Create VA
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
