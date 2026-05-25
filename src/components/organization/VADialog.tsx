import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, AlertTriangle, X } from "lucide-react";

type VA = { id: string; alias: string; accountNumber: string; ifsc: string; bank: string; active: boolean };

type TxnType = "UPI" | "CARD" | "NEFT" | "IMPS" | "RTGS" | "NETBANKING";
const ALL_TYPES: { value: TxnType; label: string; sub: string }[] = [
  { value: "UPI", label: "UPI", sub: "Unified Payments Interface" },
  { value: "CARD", label: "CARD", sub: "CARD" },
  { value: "NEFT", label: "NEFT", sub: "Electronic Funds Transfer" },
  { value: "IMPS", label: "IMPS", sub: "Immediate Payment" },
  { value: "RTGS", label: "RTGS", sub: "Real Time Settlement" },
  { value: "NETBANKING", label: "Net Banking", sub: "Net Banking" },
];

type LimitRow = { type: TxnType; min: string; max: string; total: string };
type CommissionRow = { base: string; method: "Flatrate" | "Percentage"; gateway: string; partner: string };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "update";
  vas: VA[];
  editingId?: string;
  onCreated: (va: VA) => void;
  onUpdated: () => void;
}

export function VADialog({ open, onOpenChange, mode, vas, editingId, onCreated, onUpdated }: Props) {
  const [tab, setTab] = useState<"create" | "update">(mode);
  useEffect(() => { if (open) setTab(mode); }, [open, mode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Virtual Account</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="create">Create VA</TabsTrigger>
            <TabsTrigger value="update">Update VA</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-4">
            <CreateVAForm onCancel={() => onOpenChange(false)} onSubmit={onCreated} />
          </TabsContent>
          <TabsContent value="update" className="mt-4">
            <UpdateVAForm vas={vas} initialId={editingId} onCancel={() => onOpenChange(false)} onSubmit={onUpdated} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

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
          <span key={v} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
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

function LimitsTable({ types, rows, setRows }: { types: TxnType[]; rows: LimitRow[]; setRows: (r: LimitRow[]) => void }) {
  // sync rows with types
  useEffect(() => {
    const existing = new Map(rows.map((r) => [r.type, r]));
    const next = types.map((t) => existing.get(t) ?? { type: t, min: "", max: "", total: "" });
    if (next.length !== rows.length || next.some((r, i) => rows[i]?.type !== r.type)) {
      setRows(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types]);

  return (
    <div className="rounded-lg border">
      <div className="px-4 py-2.5 border-b bg-muted/40">
        <p className="text-sm font-medium">Transaction Limits by Method</p>
      </div>
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Transaction Type</TableHead>
            <TableHead>Min Value</TableHead>
            <TableHead>Max Value</TableHead>
            <TableHead>Total Limit</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">Select transaction types above</TableCell></TableRow>
          )}
          {rows.map((r, i) => {
            const meta = ALL_TYPES.find((t) => t.value === r.type)!;
            return (
              <TableRow key={r.type}>
                <TableCell>
                  <div className="text-sm font-medium">{meta.label}</div>
                  <div className="text-xs text-muted-foreground">{meta.sub}</div>
                </TableCell>
                <TableCell><Input placeholder="Min Value" value={r.min} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, min: e.target.value } : x))} /></TableCell>
                <TableCell><Input placeholder="Max Value" value={r.max} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, max: e.target.value } : x))} /></TableCell>
                <TableCell><Input placeholder="Total Limit" value={r.total} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, total: e.target.value } : x))} /></TableCell>
                <TableCell>
                  <Button type="button" size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10"
                    onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function CommissionSetup({ rows, setRows, showFrequency = false }: { rows: CommissionRow[]; setRows: (r: CommissionRow[]) => void; showFrequency?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Commission Setup</p>
        {showFrequency && (
          <Select defaultValue="tomorrow">
            <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="next-week">Next Week</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
        <div>Base Amount</div><div>Method</div><div>Gateway Fee</div><div>Partner Fee</div><div className="w-9"></div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center">
          <Input value={r.base} disabled={i === 0} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, base: e.target.value } : x))} />
          <Select value={r.method} onValueChange={(v) => setRows(rows.map((x, idx) => idx === i ? { ...x, method: v as any } : x))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Flatrate">Flatrate ₹</SelectItem>
              <SelectItem value="Percentage">Percentage %</SelectItem>
            </SelectContent>
          </Select>
          <Input value={r.gateway} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, gateway: e.target.value } : x))} />
          <Input value={r.partner} onChange={(e) => setRows(rows.map((x, idx) => idx === i ? { ...x, partner: e.target.value } : x))} />
          {i > 0 ? (
            <Button type="button" size="icon" variant="ghost" className="rounded-full border"
              onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : <div className="w-9" />}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm"
        onClick={() => setRows([...rows, { base: "", method: "Flatrate", gateway: "0", partner: "0" }])}>
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add More
      </Button>
    </div>
  );
}

function CreateVAForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (va: VA) => void }) {
  const [pipeline, setPipeline] = useState("MOCK");
  const [txnLimit, setTxnLimit] = useState("");
  const [types, setTypes] = useState<TxnType[]>(["UPI", "CARD"]);
  const [dailyDeposit, setDailyDeposit] = useState("");
  const [minAmount, setMinAmount] = useState("100");
  const [maxAmount, setMaxAmount] = useState("");
  const [limitRows, setLimitRows] = useState<LimitRow[]>([]);
  const [commission, setCommission] = useState<CommissionRow[]>([
    { base: "100", method: "Flatrate", gateway: "0", partner: "0" },
    { base: "1000", method: "Flatrate", gateway: "0", partner: "0" },
  ]);

  const canSubmit = pipeline && txnLimit && dailyDeposit && types.length > 0;

  return (
    <div className="space-y-6">
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
          <Label>Transaction Limit</Label>
          <Input placeholder="Enter Transaction Limit" value={txnLimit} onChange={(e) => setTxnLimit(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Transaction Types</Label>
          <TypeMultiSelect value={types} onChange={setTypes} />
        </div>
        <div className="space-y-1.5">
          <Label>Daily Deposit Limit</Label>
          <Input placeholder="Enter Daily Deposit Limit" value={dailyDeposit} onChange={(e) => setDailyDeposit(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Minimum Transaction Amount</Label>
          <Input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Maximum Transaction Amount</Label>
          <Input placeholder="Enter Maximum Transaction Amount" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
        </div>
      </div>

      <LimitsTable types={types} rows={limitRows} setRows={setLimitRows} />

      <div className="border-t pt-6">
        <CommissionSetup rows={commission} setRows={setCommission} />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!canSubmit}
          className="gradient-primary text-primary-foreground"
          onClick={() => {
            const id = `VA-${Math.floor(7800 + Math.random() * 999)}`;
            onSubmit({ id, alias: "New VA", accountNumber: `XXXX ${Math.floor(1000 + Math.random() * 8999)}`, ifsc: pipeline, bank: pipeline, active: true });
          }}
        >Create VA</Button>
      </DialogFooter>
    </div>
  );
}

function UpdateVAForm({ vas, initialId, onCancel, onSubmit }: { vas: VA[]; initialId?: string; onCancel: () => void; onSubmit: () => void }) {
  const [selected, setSelected] = useState<string>(initialId ?? vas[0]?.id ?? "");
  const va = useMemo(() => vas.find((v) => v.id === selected), [vas, selected]);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Select VA :</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-64 h-9"><SelectValue placeholder="Select VA" /></SelectTrigger>
            <SelectContent>
              {vas.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.id} - {v.bank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5"><Label>Transaction Limit</Label><Input value={txnLimit} onChange={(e) => setTxnLimit(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Daily Deposit Limit</Label><Input value={dailyDeposit} onChange={(e) => setDailyDeposit(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Minimum Transaction Amount</Label><Input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Maximum Transaction Amount</Label><Input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Transaction Types</Label><TypeMultiSelect value={types} onChange={setTypes} /></div>
        <div className="space-y-1.5">
          <Label>Virtual Account Status</Label>
          <div><Badge variant="secondary" className="rounded-full">{va?.active ? "Reserved" : "Inactive"}</Badge></div>
        </div>
      </div>

      <LimitsTable types={types} rows={limitRows} setRows={setLimitRows} />

      <div className="rounded-lg border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Allow Funds from Non-Whitelisted Accounts</Label>
          <Switch checked={allowNonWhitelisted} onCheckedChange={setAllowNonWhitelisted} />
        </div>
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 text-destructive p-2.5 text-xs">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Control whether your Virtual Account can receive funds from bank accounts that are not whitelisted or verified.</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSubmit}>Update VA</Button>
        <Button className="gradient-primary text-primary-foreground" onClick={onSubmit}>Update VA Status</Button>
      </div>

      <div className="border-t pt-6">
        <CommissionSetup rows={commission} setRows={setCommission} showFrequency />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onSubmit}>Save Rule</Button>
          <Button className="gradient-primary text-primary-foreground" onClick={onSubmit}>Update Commission Setup</Button>
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Close</Button>
      </DialogFooter>
    </div>
  );
}
