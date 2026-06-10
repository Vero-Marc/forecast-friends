import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Building2, Banknote, FileText, Plug, MessageSquare, Shield,
  CheckCircle2, XCircle, Download, Eye, Send, AlertCircle, ClipboardList,
  Clock, User, ChevronRight, MessageSquarePlus, RefreshCw, Sparkles, Loader2,
} from "lucide-react";
import { toast } from "sonner";

type SectionKey = "overview" | "kyb" | "bank" | "documents" | "integration";
type ReviewStatus = "under_review" | "changes_requested" | "approved";

const sections: { key: SectionKey; title: string; description: string; icon: any }[] = [
  { key: "overview", title: "Overview", description: "Snapshot", icon: ClipboardList },
  { key: "kyb", title: "KYB", description: "Business verification", icon: Building2 },
  { key: "bank", title: "Bank Account", description: "Banking details", icon: Banknote },
  { key: "documents", title: "Documents", description: "Uploaded files", icon: FileText },
  { key: "integration", title: "Integration", description: "API & webhooks", icon: Plug },
];

export interface BackendError {
  code: string;
  message: string;
  severity: "error" | "warning";
  source?: string;
}

const backendErrors: Record<string, BackendError> = {
  "kyb:GST / Tax ID": { code: "GSTN_MISMATCH", message: "Legal name on GSTN registry does not match submitted legal name.", severity: "error", source: "GSTN Registry" },
  "kyb:Registration number": { code: "MCA_NOT_FOUND", message: "No active record found for this CIN in MCA database.", severity: "error", source: "MCA" },
  "kyb:Date of incorporation": { code: "DATE_FORMAT", message: "Date format differs from registry (registry: 03/12/2019).", severity: "warning", source: "MCA" },
  "bank:Account number": { code: "PENNY_DROP_FAILED", message: "Penny drop returned beneficiary name 'NORTHWND CAP LTD' — partial match (87%).", severity: "warning", source: "Penny Drop" },
  "bank:IFSC / Routing": { code: "IFSC_INVALID", message: "IFSC code not recognised by RBI directory.", severity: "error", source: "RBI" },
  "documents:Director ID.png": { code: "OCR_LOW_CONFIDENCE", message: "OCR confidence 62% — document may be blurred or cropped.", severity: "warning", source: "OCR Engine" },
  "documents:Bank Proof.jpg": { code: "FORMAT_REJECTED", message: "JPG not accepted for bank proof. Upload a signed PDF.", severity: "error", source: "Doc Validator" },
  "integration:Webhook URL": { code: "WEBHOOK_UNREACHABLE", message: "Last ping returned 503 Service Unavailable.", severity: "error", source: "Webhook Probe" },
  "overview:Email": { code: "EMAIL_UNVERIFIED", message: "Email domain not verified via DNS TXT record.", severity: "warning", source: "DNS" },
};

interface ReviewRemark {
  id: string;
  author: string;
  text: string;
  ts: string;
  resolved?: boolean;
}

interface FieldReview {
  status: ReviewStatus;
  remarks: ReviewRemark[];
  submissionRound: number; // increments when merchant resubmits
}

const docs = [
  { name: "Certificate of Incorporation.pdf", date: "May 12, 2026" },
  { name: "Tax Registration.pdf", date: "May 14, 2026" },
  { name: "Director ID.png", date: "May 15, 2026" },
  { name: "Bank Proof.jpg", date: "May 16, 2026" },
];

// ============================================================================
// Helpers
// ============================================================================

const statusMeta: Record<ReviewStatus, { label: string; tone: string; icon: any; dot: string }> = {
  under_review: {
    label: "Under Review",
    tone: "text-info bg-info/10 border-info/30",
    dot: "bg-info",
    icon: Loader2,
  },
  changes_requested: {
    label: "Changes Requested",
    tone: "text-warning bg-warning/10 border-warning/30",
    dot: "bg-warning",
    icon: RefreshCw,
  },
  approved: {
    label: "Approved",
    tone: "text-success bg-success/10 border-success/30",
    dot: "bg-success",
    icon: CheckCircle2,
  },
};

function ReviewPill({ status, size = "sm" }: { status: ReviewStatus; size?: "xs" | "sm" }) {
  const m = statusMeta[status];
  const Icon = m.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      m.tone,
      size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
    )}>
      <Icon className={cn("h-3 w-3", status === "under_review" && "animate-pulse")} />
      {m.label}
    </span>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function ReviewOrganization() {
  const { id } = useParams();
  const org = useMemo(() => organizations.find((o) => o.id === id) ?? organizations[0], [id]);

  const [active, setActive] = useState<SectionKey>("overview");
  const [approveOpen, setApproveOpen] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [finalDecision, setFinalDecision] = useState<"approved" | null>(null);

  // Field-level review state. Default = under_review.
  const [fieldReviews, setFieldReviews] = useState<Record<string, FieldReview>>({});

  const getReview = (key: string): FieldReview =>
    fieldReviews[key] ?? { status: "under_review", remarks: [], submissionRound: 1 };

  const requestChanges = (key: string, text: string) => {
    if (!text.trim()) return;
    setFieldReviews((p) => {
      const cur = p[key] ?? { status: "under_review", remarks: [], submissionRound: 1 };
      return {
        ...p,
        [key]: {
          ...cur,
          status: "changes_requested",
          remarks: [
            ...cur.remarks,
            { id: `r${Date.now()}`, author: "You", text: text.trim(), ts: "just now" },
          ],
        },
      };
    });
    toast.success("Changes requested — merchant notified");
  };

  const resolveAndApprove = (key: string) => {
    setFieldReviews((p) => {
      const cur = p[key] ?? { status: "under_review", remarks: [], submissionRound: 1 };
      return {
        ...p,
        [key]: {
          ...cur,
          status: "approved",
          remarks: cur.remarks.map((r) => ({ ...r, resolved: true })),
        },
      };
    });
    toast.success("Field approved");
  };

  // Simulate merchant resubmission cycle for demo
  const simulateResubmit = (key: string) => {
    setFieldReviews((p) => {
      const cur = p[key];
      if (!cur || cur.status !== "changes_requested") return p;
      return {
        ...p,
        [key]: {
          ...cur,
          status: "under_review",
          submissionRound: cur.submissionRound + 1,
          remarks: [
            ...cur.remarks,
            { id: `r${Date.now()}`, author: "Merchant", text: "Updated and resubmitted for review.", ts: "just now" },
          ],
        },
      };
    });
    toast.info("Merchant resubmitted — back to Under Review");
  };

  // Derive section status from field reviews of that section
  const sectionStatus = (s: SectionKey, fieldKeys: string[]): ReviewStatus => {
    const reviews = fieldKeys.map(getReview);
    if (reviews.some((r) => r.status === "changes_requested")) return "changes_requested";
    if (reviews.length && reviews.every((r) => r.status === "approved")) return "approved";
    return "under_review";
  };

  // ============================================================================
  // Field config per section
  // ============================================================================

  const sectionFields: Record<SectionKey, { label: string; value: string; wide?: boolean }[]> = {
    overview: [
      { label: "Legal name", value: org.name },
      { label: "Category", value: org.category },
      { label: "Business type", value: org.businessType },
      { label: "Country", value: org.country },
      { label: "Email", value: org.email },
      { label: "Phone", value: org.phone },
      { label: "Submitted on", value: org.createdOn },
      { label: "Assigned reviewer", value: org.assignedAdmin },
    ],
    kyb: [
      { label: "Business legal name", value: org.name },
      { label: "Registration number", value: "REG-009211" },
      { label: "GST / Tax ID", value: "GST-22AAAAA0000A1Z5" },
      { label: "Date of incorporation", value: "12 Mar 2019" },
      { label: "Country", value: org.country },
      { label: "Website", value: `https://${org.name.toLowerCase().replace(/\s+/g, "")}.com` },
      { label: "Registered address", value: "221B Market Street, Suite 400, San Francisco, CA 94107", wide: true },
    ],
    bank: [
      { label: "Account holder", value: org.name },
      { label: "Account number", value: "•••• •••• 1234" },
      { label: "Bank", value: "Pinnacle Trust" },
      { label: "Branch", value: "SF Downtown" },
      { label: "IFSC / Routing", value: "PINTUS33" },
      { label: "Account type", value: "Current" },
    ],
    integration: [
      { label: "Webhook URL", value: "https://api.acme.com/webhooks/fynnix" },
      { label: "Last delivery", value: "200 OK · 2h ago" },
    ],
    documents: [], // handled separately
  };

  const fieldKeysForSection = (s: SectionKey): string[] => {
    if (s === "documents") return docs.map((d) => `documents:${d.name}`);
    return sectionFields[s].map((f) => `${s}:${f.label}`);
  };

  // Overall progress
  const allKeys = sections.flatMap((s) => fieldKeysForSection(s.key));
  const approvedCount = allKeys.filter((k) => getReview(k).status === "approved").length;
  const changesCount = allKeys.filter((k) => getReview(k).status === "changes_requested").length;
  const completion = Math.round((approvedCount / Math.max(allKeys.length, 1)) * 100);

  const allApproved = approvedCount === allKeys.length;

  const sendAllChangesToMerchant = () => {
    if (changesCount === 0) {
      toast.error("No fields marked as Changes Requested");
      return;
    }
    toast.success(`Sent ${changesCount} change request${changesCount > 1 ? "s" : ""} to merchant`);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-background to-primary/5 p-5">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/onboarding"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="h-12 w-12 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center font-semibold shadow-glow">
              {org.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{org.name}</h1>
              <p className="text-xs text-muted-foreground">
                {org.id} · {org.category} · {org.businessType}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={changesCount > 0 ? "Changes Requested" : allApproved ? "Approved" : "Under Review"} />
            {changesCount > 0 && (
              <Button variant="outline" onClick={sendAllChangesToMerchant}>
                <Send className="mr-1.5 h-4 w-4" /> Send {changesCount} to merchant
              </Button>
            )}
            <Button
              onClick={() => setApproveOpen(true)}
              disabled={!allApproved || !!finalDecision}
              className="gradient-primary text-primary-foreground shadow-glow"
            >
              <Shield className="mr-1.5 h-4 w-4" />
              {finalDecision ? "Approved" : "Approve organization"}
            </Button>
          </div>
        </div>

        {/* Progress meta */}
        <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetaTile label="Overall" value={`${completion}%`} accent="text-primary" />
          <MetaTile label="Approved" value={`${approvedCount} / ${allKeys.length}`} accent="text-success" />
          <MetaTile label="Changes requested" value={String(changesCount)} accent="text-warning" />
          <MetaTile label="Under review" value={String(allKeys.length - approvedCount - changesCount)} accent="text-info" />
        </div>
      </div>

      {finalDecision === "approved" && (
        <Card className="surface-card border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-success" />
            <div className="text-sm">
              <p className="font-medium">Organization approved</p>
              <p className="text-xs text-muted-foreground">Notification sent to the merchant. Account moved to Active.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split layout: side nav + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Side nav */}
        <Card className="surface-card h-fit lg:sticky lg:top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Review sections
              <span className="text-xs text-muted-foreground font-normal">{completion}%</span>
            </CardTitle>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all" style={{ width: `${completion}%` }} />
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((s) => {
                const isActive = active === s.key;
                const keys = fieldKeysForSection(s.key);
                const st = sectionStatus(s.key, keys);
                const m = statusMeta[st];
                return (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-all",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>
                    </div>
                    <span className={cn("h-2 w-2 rounded-full shrink-0", m.dot)} title={m.label} />
                    <ChevronRight className={cn("h-3.5 w-3.5 opacity-0 transition-opacity", isActive && "opacity-100")} />
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-4 min-w-0">
          {sections.map((s) => {
            if (active !== s.key) return null;
            const keys = fieldKeysForSection(s.key);
            const st = sectionStatus(s.key, keys);
            const Icon = s.icon;

            return (
              <Card key={s.key} className="surface-card overflow-hidden">
                <CardHeader className="pb-3 border-b bg-gradient-to-r from-muted/20 to-transparent">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" /> {s.title}
                    </CardTitle>
                    <ReviewPill status={st} />
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <SectionErrorSummary section={s.key} />

                  {s.key === "documents" ? (
                    <div className="space-y-2">
                      {docs.map((f) => {
                        const k = `documents:${f.name}`;
                        return (
                          <DocumentRow
                            key={f.name}
                            name={f.name}
                            date={f.date}
                            fieldKey={k}
                            review={getReview(k)}
                            error={backendErrors[k]}
                            onRequestChanges={(t) => requestChanges(k, t)}
                            onResolve={() => resolveAndApprove(k)}
                            onResubmit={() => simulateResubmit(k)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sectionFields[s.key].map((r) => {
                        const k = `${s.key}:${r.label}`;
                        return (
                          <div key={r.label} className={r.wide ? "md:col-span-2" : ""}>
                            <ReviewableField
                              fieldKey={k}
                              label={r.label}
                              value={r.value}
                              review={getReview(k)}
                              error={backendErrors[k]}
                              onRequestChanges={(t) => requestChanges(k, t)}
                              onResolve={() => resolveAndApprove(k)}
                              onResubmit={() => simulateResubmit(k)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>

                <SectionFooter
                  status={st}
                  fieldCount={keys.length}
                  approvedCount={keys.filter((k) => getReview(k).status === "approved").length}
                  changesCount={keys.filter((k) => getReview(k).status === "changes_requested").length}
                  onSendChanges={sendAllChangesToMerchant}
                />
              </Card>
            );
          })}
        </div>
      </div>

      {/* Approve organization dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {org.name}?</DialogTitle>
            <DialogDescription>
              All sections are approved. This marks the organization as live and notifies the merchant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Approval note (optional)</Label>
            <Textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="Add internal notes…"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={() => {
                setFinalDecision("approved");
                setApproveOpen(false);
                setDecisionNote("");
                toast.success("Organization approved");
              }}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirm approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Field components
// ============================================================================

function MetaTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border bg-card/60 backdrop-blur px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold mt-0.5", accent)}>{value}</p>
    </div>
  );
}

function ReviewableField({
  fieldKey, label, value, review, error,
  onRequestChanges, onResolve, onResubmit,
}: {
  fieldKey: string;
  label: string;
  value: string;
  review: FieldReview;
  error?: BackendError;
  onRequestChanges: (text: string) => void;
  onResolve: () => void;
  onResubmit: () => void;
}) {
  const isError = error?.severity === "error";
  const isWarn = error?.severity === "warning";
  const st = review.status;

  return (
    <div className={cn(
      "rounded-xl border bg-card/50 p-3.5 transition-all",
      st === "changes_requested" && "border-warning/40 bg-warning/5",
      st === "approved" && "border-success/40 bg-success/5",
      isError && st === "under_review" && "border-destructive/40 bg-destructive/5",
      isWarn && st === "under_review" && "border-warning/40 bg-warning/5",
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
            {review.submissionRound > 1 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-info/40 text-info">
                v{review.submissionRound}
              </Badge>
            )}
          </div>
          <p className={cn(
            "text-sm font-medium mt-1 break-words",
            isError && st !== "approved" && "text-destructive",
          )}>{value || "—"}</p>
        </div>
        <ReviewPill status={st} size="xs" />
      </div>

      {error && st !== "approved" && (
        <div className={cn(
          "mt-2.5 rounded-lg border p-2 flex gap-2",
          isError ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10",
        )}>
          <AlertCircle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", isError ? "text-destructive" : "text-warning")} />
          <div className="min-w-0">
            <p className={cn("text-[11px] font-semibold flex items-center gap-1.5 flex-wrap", isError ? "text-destructive" : "text-warning")}>
              {error.code}
              {error.source && <span className="font-normal text-muted-foreground">· {error.source}</span>}
            </p>
            <p className="text-xs text-foreground mt-0.5 break-words">{error.message}</p>
          </div>
        </div>
      )}

      {/* Remarks thread */}
      {review.remarks.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {review.remarks.map((r) => (
            <div key={r.id} className={cn(
              "rounded-lg border p-2 text-xs",
              r.resolved
                ? "border-success/30 bg-success/5 opacity-70"
                : r.author === "Merchant"
                  ? "border-info/30 bg-info/5"
                  : "border-warning/30 bg-warning/5"
            )}>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="font-medium text-foreground">{r.author}</span>
                <span>·</span>
                <Clock className="h-3 w-3" /> {r.ts}
                {r.resolved && (
                  <Badge variant="outline" className="ml-auto h-4 px-1.5 text-[9px] border-success/40 text-success">
                    Resolved
                  </Badge>
                )}
              </div>
              <p className="text-foreground mt-1 break-words">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <FieldActions
        status={st}
        hasRemarks={review.remarks.length > 0}
        onRequestChanges={onRequestChanges}
        onResolve={onResolve}
        onResubmit={onResubmit}
      />
    </div>
  );
}

function FieldActions({
  status, hasRemarks, onRequestChanges, onResolve, onResubmit,
}: {
  status: ReviewStatus;
  hasRemarks: boolean;
  onRequestChanges: (text: string) => void;
  onResolve: () => void;
  onResubmit: () => void;
}) {
  return (
    <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-end gap-1.5 flex-wrap">
      {status === "changes_requested" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[11px] text-info hover:text-info"
          onClick={onResubmit}
        >
          <RefreshCw className="mr-1 h-3 w-3" /> Simulate resubmit
        </Button>
      )}

      {status !== "approved" && (
        <RequestChangesPopover
          mode={status === "changes_requested" ? "again" : "first"}
          onSubmit={onRequestChanges}
        />
      )}

      {status === "approved" ? (
        <Badge variant="outline" className="border-success/40 text-success bg-success/10 h-7">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
        </Badge>
      ) : (
        <Button
          size="sm"
          className="h-7 text-[11px] gradient-primary text-primary-foreground"
          onClick={onResolve}
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {hasRemarks ? "Resolve & Approve" : "Approve"}
        </Button>
      )}
    </div>
  );
}

function RequestChangesPopover({
  mode, onSubmit,
}: { mode: "first" | "again"; onSubmit: (text: string) => void }) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setDraft(""); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 text-[11px]",
            mode === "again" && "border-warning/40 text-warning hover:text-warning",
          )}
        >
          <MessageSquarePlus className="mr-1 h-3 w-3" />
          {mode === "again" ? "Request again" : "Request changes"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-2">
          <p className="text-xs font-medium">
            {mode === "again" ? "Send another change request" : "Tell the merchant what to fix"}
          </p>
          <Textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. The legal name on the GST certificate doesn't match. Please re-upload."
          />
          <div className="flex justify-end gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground"
              disabled={!draft.trim()}
              onClick={() => { onSubmit(draft); setOpen(false); setDraft(""); }}
            >
              <Send className="mr-1.5 h-3 w-3" /> Send to merchant
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Documents
// ============================================================================

function DocumentRow({
  name, date, fieldKey, review, error,
  onRequestChanges, onResolve, onResubmit,
}: {
  name: string;
  date: string;
  fieldKey: string;
  review: FieldReview;
  error?: BackendError;
  onRequestChanges: (text: string) => void;
  onResolve: () => void;
  onResubmit: () => void;
}) {
  const isError = error?.severity === "error";
  const isWarn = error?.severity === "warning";
  const st = review.status;

  return (
    <div className={cn(
      "rounded-xl border p-3.5 bg-card transition-all",
      st === "changes_requested" && "border-warning/40 bg-warning/5",
      st === "approved" && "border-success/40 bg-success/5",
      isError && st === "under_review" && "border-destructive/40 bg-destructive/5",
      isWarn && st === "under_review" && "border-warning/40 bg-warning/5",
    )}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate flex items-center gap-2">
            {name}
            {review.submissionRound > 1 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-info/40 text-info">
                v{review.submissionRound}
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">Uploaded {date}</p>
        </div>
        <ReviewPill status={st} size="xs" />
        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
      </div>

      {error && st !== "approved" && (
        <div className={cn(
          "mt-2.5 ml-12 rounded-lg border p-2 flex gap-2",
          isError ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10",
        )}>
          <AlertCircle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", isError ? "text-destructive" : "text-warning")} />
          <div className="min-w-0">
            <p className={cn("text-[11px] font-semibold", isError ? "text-destructive" : "text-warning")}>
              {error.code}
              {error.source && <span className="font-normal text-muted-foreground"> · {error.source}</span>}
            </p>
            <p className="text-xs text-foreground mt-0.5 break-words">{error.message}</p>
          </div>
        </div>
      )}

      {review.remarks.length > 0 && (
        <div className="mt-3 ml-12 space-y-1.5">
          {review.remarks.map((r) => (
            <div key={r.id} className={cn(
              "rounded-lg border p-2 text-xs",
              r.resolved ? "border-success/30 bg-success/5 opacity-70"
                : r.author === "Merchant" ? "border-info/30 bg-info/5"
                : "border-warning/30 bg-warning/5"
            )}>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">{r.author}</span>
                <span>·</span>
                <Clock className="h-3 w-3" /> {r.ts}
              </div>
              <p className="text-foreground mt-1 break-words">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <FieldActions
        status={st}
        hasRemarks={review.remarks.length > 0}
        onRequestChanges={onRequestChanges}
        onResolve={onResolve}
        onResubmit={onResubmit}
      />
    </div>
  );
}

// ============================================================================
// Section footer + helpers
// ============================================================================

function SectionFooter({
  status, fieldCount, approvedCount, changesCount, onSendChanges,
}: {
  status: ReviewStatus;
  fieldCount: number;
  approvedCount: number;
  changesCount: number;
  onSendChanges: () => void;
}) {
  return (
    <div className="border-t px-5 py-3 flex items-center justify-between gap-3 bg-muted/20 flex-wrap">
      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
        <ReviewPill status={status} />
        <span>
          {approvedCount}/{fieldCount} approved
          {changesCount > 0 && ` · ${changesCount} pending changes`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {changesCount > 0 && (
          <Button size="sm" variant="outline" onClick={onSendChanges} className="border-warning/40 text-warning">
            <Send className="mr-1.5 h-3.5 w-3.5" /> Send changes to merchant
          </Button>
        )}
        {status === "approved" && (
          <Badge variant="outline" className="border-success/40 text-success bg-success/10">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Section approved
          </Badge>
        )}
      </div>
    </div>
  );
}

function SectionErrorSummary({ section }: { section: SectionKey }) {
  const prefix = `${section}:`;
  const items = Object.entries(backendErrors).filter(([k]) => k.startsWith(prefix));
  if (!items.length) return null;
  const errors = items.filter(([, v]) => v.severity === "error").length;
  const warns = items.filter(([, v]) => v.severity === "warning").length;
  return (
    <div className={cn(
      "rounded-lg border p-3 flex items-start gap-3",
      errors > 0 ? "border-destructive/40 bg-destructive/5" : "border-warning/40 bg-warning/5",
    )}>
      <AlertCircle className={cn("h-4 w-4 mt-0.5 shrink-0", errors > 0 ? "text-destructive" : "text-warning")} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", errors > 0 ? "text-destructive" : "text-warning")}>
          {errors > 0 && `${errors} backend error${errors > 1 ? "s" : ""}`}
          {errors > 0 && warns > 0 && " · "}
          {warns > 0 && `${warns} warning${warns > 1 ? "s" : ""}`}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Issues returned from verification APIs — request changes inline below.
        </p>
      </div>
    </div>
  );
}
