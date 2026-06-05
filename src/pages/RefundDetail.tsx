import { Link, useParams } from "react-router-dom";
import { ChevronRight, AlertTriangle, Info, CheckCircle2, Clock, Loader2, XCircle, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { findMerchantByVA, refundsForVA, formatCurrency, formatDateTime, RefundStatus } from "@/data/refundsMock";
import { RefundBadge } from "@/components/refunds/RefundBadge";
import { cn } from "@/lib/utils";

export default function RefundDetail() {
  const { vaNo = "", refundId = "" } = useParams();
  const info = findMerchantByVA(vaNo);
  const refund = refundsForVA(vaNo).find((r) => r.refundId === refundId);

  if (!refund) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Refund not found.{" "}
        <Link className="text-primary underline" to={`/payins/refunds/${vaNo}`}>Back to list</Link>
      </div>
    );
  }

  const refundSteps = buildRefundTimeline(refund.status, refund.dateTime);
  const txnSteps = buildTxnTimeline(refund.originalPaymentDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link to="/payins/refunds" className="hover:text-foreground">Payins / Refunds</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{info?.merchant.name ?? "Merchant"}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/payins/refunds/${vaNo}`} className="hover:text-foreground">{vaNo}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{refundId}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{refund.refundId}</h1>
          <p className="text-sm text-muted-foreground mt-1">Refund for {info?.merchant.name} · {vaNo}</p>
        </div>
        <RefundBadge status={refund.status} />
      </div>

      {refund.status === "Failed" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Refund Failed</AlertTitle>
          <AlertDescription>The refund could not be processed by the bank. Reason: insufficient settlement balance. Please retry or contact support.</AlertDescription>
        </Alert>
      )}
      {refund.status === "Pending" && (
        <Alert className="border-warning/30 bg-warning/5 text-warning-foreground">
          <Info className="h-4 w-4 !text-warning" />
          <AlertTitle className="text-warning">Refund Pending</AlertTitle>
          <AlertDescription className="text-foreground/80">This refund is awaiting processing and will be submitted to the bank shortly.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Refund Details</CardTitle></CardHeader>
            <CardContent>
              <KV rows={[
                ["Refund ID", refund.refundId],
                ["Status", <RefundBadge status={refund.status} />],
                ["Refunded Amount", formatCurrency(refund.refundedAmount)],
                ["Payment Method", refund.paymentMethod],
                ["CRN", refund.crn],
                ["Reason", refund.reason],
                ["Initiated By", refund.initiatedBy],
                ["Created At", formatDateTime(refund.dateTime)],
              ]} />
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Transaction Details</CardTitle></CardHeader>
            <CardContent>
              <KV rows={[
                ["Transaction ID", refund.txnId],
                ["Transaction Amount", formatCurrency(refund.transactionAmount)],
                ["Currency", refund.currency],
                ["Payment Method", refund.paymentMethod],
                ["Merchant Reference", refund.merchantRef],
                ["Original Payment Date", formatDateTime(refund.originalPaymentDate)],
                ["Gateway", refund.gateway],
                ["VA Number", vaNo],
              ]} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Refund Timeline</CardTitle></CardHeader>
            <CardContent><Timeline steps={refundSteps} /></CardContent>
          </Card>
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Transaction Timeline</CardTitle></CardHeader>
            <CardContent><Timeline steps={txnSteps} /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KV({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col">
          <span className="text-xs text-muted-foreground">{k}</span>
          <span className="text-sm font-medium mt-0.5">{v}</span>
        </div>
      ))}
    </div>
  );
}

type Step = { label: string; ts?: string; state: "done" | "active" | "failed" | "idle"; description?: string };

function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const Icon = s.state === "done" ? CheckCircle2 : s.state === "failed" ? XCircle : s.state === "active" ? Loader2 : Clock;
        const tone =
          s.state === "done" ? "text-success bg-success/10 border-success/20"
          : s.state === "failed" ? "text-destructive bg-destructive/10 border-destructive/20"
          : s.state === "active" ? "text-info bg-info/10 border-info/20"
          : "text-muted-foreground bg-muted border-border";
        return (
          <li key={i} className="flex gap-3 pb-5 last:pb-0 relative">
            {i < steps.length - 1 && <span className="absolute left-[14px] top-7 bottom-0 w-px bg-border" />}
            <span className={cn("h-7 w-7 rounded-full border flex items-center justify-center shrink-0", tone)}>
              <Icon className={cn("h-3.5 w-3.5", s.state === "active" && "animate-spin")} />
            </span>
            <div className="flex-1 -mt-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{s.label}</p>
                {s.ts && <span className="text-xs text-muted-foreground">{s.ts}</span>}
              </div>
              {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function buildRefundTimeline(status: RefundStatus, initiatedAt: string): Step[] {
  const t0 = new Date(initiatedAt);
  const ts = (mins: number) => formatDateTime(new Date(t0.getTime() + mins * 60000).toISOString());
  const base: Step[] = [
    { label: "Refund Initiated", ts: ts(0), state: "done", description: "Refund request received." },
    { label: "Refund Processing", ts: ts(2), state: "idle" },
    { label: "Bank Submitted", ts: ts(8), state: "idle" },
    { label: "Completed", ts: ts(30), state: "idle" },
  ];
  if (status === "Pending") base[1].state = "active";
  else if (status === "Processing") { base[1].state = "done"; base[2].state = "active"; }
  else if (status === "Success") { base[1].state = "done"; base[2].state = "done"; base[3].state = "done"; base[3].label = "Success"; }
  else if (status === "Failed") { base[1].state = "done"; base[2].state = "done"; base[3].state = "failed"; base[3].label = "Failed"; base[3].description = "Bank rejected the refund."; }
  else if (status === "Reversed") { base[1].state = "done"; base[2].state = "done"; base[3].state = "done"; base[3].label = "Reversed"; }
  return base;
}

function buildTxnTimeline(paidAt: string): Step[] {
  const t0 = new Date(paidAt);
  const ts = (mins: number) => formatDateTime(new Date(t0.getTime() + mins * 60000).toISOString());
  return [
    { label: "Payment Initiated", ts: ts(0), state: "done" },
    { label: "Gateway Processing", ts: ts(1), state: "done" },
    { label: "Payment Captured", ts: ts(2), state: "done" },
    { label: "Settled", ts: ts(60 * 24), state: "done" },
  ];
}
