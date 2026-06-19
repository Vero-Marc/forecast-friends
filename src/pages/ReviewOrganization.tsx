import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Building2, Banknote, FileText, Plug, MessageSquare, Shield,
  CheckCircle2, XCircle, Download, Eye, Send, AlertCircle, ClipboardList,
  Clock, User, ChevronDown, ChevronUp, Search, Pencil, Trash2,
  Check, X, Sparkles, ListFilter, ChevronsDownUp, ChevronsUpDown, Save,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// Types & data
// ============================================================================

type SectionKey = "business" | "kyb" | "kyc" | "bank" | "documents" | "integration";
type FieldStatus = "pending" | "approved" | "rejected";
type FilterKey = "all" | "approved" | "rejected" | "pending";

interface Comment {
  id: string;
  author: "Reviewer" | "Applicant";
  text: string;
  ts: string;
}

interface FieldReview {
  status: FieldStatus;
  comments: Comment[];
}

interface BackendError {
  code: string;
  message: string;
  severity: "error" | "warning";
  source?: string;
}

const sections: {
  key: SectionKey;
  title: string;
  description: string;
  icon: any;
}[] = [
  { key: "business", title: "Business Information", description: "Company profile & contacts", icon: ClipboardList },
  { key: "kyb", title: "KYB Details", description: "Business verification", icon: Building2 },
  { key: "kyc", title: "KYC Details", description: "Director identity", icon: User },
  { key: "bank", title: "Bank Account Details", description: "Settlement & routing", icon: Banknote },
  { key: "documents", title: "Documents", description: "Uploaded files", icon: FileText },
  { key: "integration", title: "Integrations", description: "API & webhooks", icon: Plug },
];

const backendErrors: Record<string, BackendError> = {
  "kyb:GST / Tax ID": { code: "GSTN_MISMATCH", message: "Legal name on GSTN registry does not match submitted legal name.", severity: "error", source: "GSTN" },
  "kyb:Registration number": { code: "MCA_NOT_FOUND", message: "No active record found for this CIN in the MCA database.", severity: "error", source: "MCA" },
  "kyb:Date of incorporation": { code: "DATE_FORMAT", message: "Registry shows 03/12/2019.", severity: "warning", source: "MCA" },
  "bank:Account number": { code: "PENNY_DROP_PARTIAL", message: "Penny drop name match 87% — 'NORTHWND CAP LTD'.", severity: "warning", source: "Penny Drop" },
  "bank:IFSC / Routing": { code: "IFSC_INVALID", message: "IFSC not recognised by RBI directory.", severity: "error", source: "RBI" },
  "documents:Director ID.png": { code: "OCR_LOW_CONFIDENCE", message: "OCR confidence 62% — image may be blurred.", severity: "warning", source: "OCR" },
  "documents:Bank Proof.jpg": { code: "FORMAT_REJECTED", message: "JPG not accepted. Upload a signed PDF.", severity: "error", source: "Validator" },
  "integration:Webhook URL": { code: "WEBHOOK_UNREACHABLE", message: "Last ping returned 503.", severity: "error", source: "Probe" },
  "business:Email": { code: "EMAIL_UNVERIFIED", message: "Email domain not verified via DNS TXT.", severity: "warning", source: "DNS" },
};

const docs = [
  { name: "Certificate of Incorporation.pdf", date: "May 12, 2026", size: "412 KB" },
  { name: "Tax Registration.pdf", date: "May 14, 2026", size: "228 KB" },
  { name: "Director ID.png", date: "May 15, 2026", size: "1.1 MB" },
  { name: "Bank Proof.jpg", date: "May 16, 2026", size: "780 KB" },
];

// ============================================================================
// Page
// ============================================================================

export default function ReviewOrganization() {
  const { id } = useParams();
  const org = useMemo(() => organizations.find((o) => o.id === id) ?? organizations[0], [id]);

  const [reviews, setReviews] = useState<Record<string, FieldReview>>({});
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    business: true, kyb: true, kyc: true, bank: true, documents: true, integration: true,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState<null | "approved" | "rejected" | "changes_requested">(null);
  const [unsaved, setUnsaved] = useState(false);

  const getReview = (key: string): FieldReview =>
    reviews[key] ?? { status: "pending", comments: [] };

  const updateField = (key: string, mutator: (r: FieldReview) => FieldReview) => {
    setReviews((p) => ({ ...p, [key]: mutator(p[key] ?? { status: "pending", comments: [] }) }));
    setUnsaved(true);
  };

  const approveField = (k: string) => { updateField(k, (r) => ({ ...r, status: "approved" })); toast.success("Field approved"); };
  const rejectField  = (k: string) => { updateField(k, (r) => ({ ...r, status: "rejected" })); toast.message("Field rejected"); };
  const addComment   = (k: string, text: string) => {
    if (!text.trim()) return;
    updateField(k, (r) => ({
      ...r,
      comments: [...r.comments, { id: `c${Date.now()}`, author: "Reviewer", text: text.trim(), ts: "just now" }],
    }));
    toast.success("Comment saved");
  };
  const editComment = (k: string, id: string, text: string) =>
    updateField(k, (r) => ({ ...r, comments: r.comments.map((c) => c.id === id ? { ...c, text } : c) }));
  const deleteComment = (k: string, id: string) =>
    updateField(k, (r) => ({ ...r, comments: r.comments.filter((c) => c.id !== id) }));

  // -------------------- field definitions --------------------
  const sectionFields: Record<Exclude<SectionKey, "documents">, { label: string; value: string; wide?: boolean }[]> = {
    business: [
      { label: "Business name", value: org.name },
      { label: "Category", value: org.category },
      { label: "Business type", value: org.businessType },
      { label: "Country", value: org.country },
      { label: "Email", value: org.email },
      { label: "Phone", value: org.phone },
    ],
    kyb: [
      { label: "Legal name", value: org.name },
      { label: "Registration number", value: "REG-009211" },
      { label: "GST / Tax ID", value: "GST-22AAAAA0000A1Z5" },
      { label: "Date of incorporation", value: "12 Mar 2019" },
      { label: "Website", value: `https://${org.name.toLowerCase().replace(/\s+/g, "")}.com` },
      { label: "Registered address", value: "221B Market Street, Suite 400, San Francisco, CA 94107", wide: true },
    ],
    kyc: [
      { label: "Director name", value: "Marcus Hill" },
      { label: "PAN", value: "ABCDE1234F" },
      { label: "Aadhaar (last 4)", value: "•••• 4421" },
      { label: "Date of birth", value: "08 Aug 1984" },
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
  };

  const fieldKeysForSection = (s: SectionKey): string[] =>
    s === "documents" ? docs.map((d) => `documents:${d.name}`)
                      : sectionFields[s].map((f) => `${s}:${f.label}`);

  const allKeys = sections.flatMap((s) => fieldKeysForSection(s.key));
  const total = allKeys.length;
  const approved = allKeys.filter((k) => getReview(k).status === "approved").length;
  const rejected = allKeys.filter((k) => getReview(k).status === "rejected").length;
  const pending = total - approved - rejected;
  const reviewedPct = Math.round(((approved + rejected) / Math.max(total, 1)) * 100);

  const matchesFilter = (k: string) => {
    const st = getReview(k).status;
    if (filter === "all") return true;
    if (filter === "pending") return st === "pending";
    return st === filter;
  };

  const matchesSearch = (label: string, value: string) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return label.toLowerCase().includes(q) || value.toLowerCase().includes(q);
  };

  const overallStatus =
    decision === "approved" ? "Approved"
    : decision === "rejected" ? "Rejected"
    : decision === "changes_requested" ? "Changes Requested"
    : rejected > 0 ? "Changes Requested"
    : approved === total ? "Approved"
    : "Under Review";

  const toggleAll = (open: boolean) =>
    setOpenSections({ business: open, kyb: open, kyc: open, bank: open, documents: open, integration: open });

  const sendRequestChanges = () => {
    if (!reason.trim()) return toast.error("Add a reason for changes");
    setDecision("changes_requested");
    setRequestChangesOpen(false);
    setReason("");
    setUnsaved(false);
    toast.success("Change request sent to applicant");
  };
  const sendReject = () => {
    if (!reason.trim()) return toast.error("Add a rejection reason");
    setDecision("rejected");
    setRejectOpen(false);
    setReason("");
    setUnsaved(false);
    toast.message("Application rejected");
  };
  const sendApprove = () => {
    setDecision("approved");
    setApproveOpen(false);
    setUnsaved(false);
    toast.success("Application approved");
  };

  // Recent comments / lists for summary
  const recentComments = allKeys
    .flatMap((k) => getReview(k).comments.map((c) => ({ k, c })))
    .slice(-3).reverse();
  const pendingList = allKeys.filter((k) => getReview(k).status === "pending");
  const rejectedList = allKeys.filter((k) => getReview(k).status === "rejected");

  // ==========================================================================
  return (
    <div className="space-y-5 pb-10">
      {/* Sticky page header */}
      <header className="sticky top-0 z-30 -mx-6 px-6 py-4 backdrop-blur-xl bg-background/70 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/onboarding"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="h-11 w-11 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center font-semibold shadow-glow shrink-0">
              {org.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold leading-tight truncate">{org.name}</h1>
                <StatusBadge status={overallStatus} />
                {unsaved && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-warning bg-warning/10 border border-warning/30 rounded-full px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" /> Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {org.id} · Reviewer: {org.assignedAdmin} · Updated {org.lastUpdated}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fields…"
                className="h-9 pl-8 w-56"
              />
            </div>
            <FilterTabs value={filter} onChange={setFilter} counts={{ all: total, approved, rejected, pending }} />
            <Button variant="outline" size="sm" onClick={() => toggleAll(false)} title="Collapse all">
              <ChevronsDownUp className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleAll(true)} title="Expand all">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {decision && (
        <Card className={cn(
          "surface-card border",
          decision === "approved" && "border-success/30 bg-success/5",
          decision === "rejected" && "border-destructive/30 bg-destructive/5",
          decision === "changes_requested" && "border-warning/30 bg-warning/5",
        )}>
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className={cn("h-5 w-5",
              decision === "approved" && "text-success",
              decision === "rejected" && "text-destructive",
              decision === "changes_requested" && "text-warning")} />
            <div className="text-sm">
              <p className="font-medium">
                {decision === "approved" && "Application approved"}
                {decision === "rejected" && "Application rejected"}
                {decision === "changes_requested" && "Changes requested from applicant"}
              </p>
              <p className="text-xs text-muted-foreground">The applicant has been notified by email.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split: 70 / 30 */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-5">
        {/* LEFT */}
        <div className="space-y-4 min-w-0">
          {sections.map((s) => {
            const keys = fieldKeysForSection(s.key);
            const visibleKeys = keys.filter((k) => {
              if (!matchesFilter(k)) return false;
              if (s.key === "documents") {
                const name = k.replace("documents:", "");
                return matchesSearch(name, "");
              }
              const f = sectionFields[s.key as Exclude<SectionKey, "documents">]
                .find((x) => `${s.key}:${x.label}` === k);
              return f ? matchesSearch(f.label, f.value) : true;
            });

            const sApproved = keys.filter((k) => getReview(k).status === "approved").length;
            const sRejected = keys.filter((k) => getReview(k).status === "rejected").length;
            const sStatus = sRejected > 0 ? "Changes Requested" : sApproved === keys.length ? "Approved" : "Under Review";
            const isOpen = openSections[s.key];

            return (
              <Card key={s.key} className="surface-card overflow-hidden">
                <button
                  onClick={() => setOpenSections((p) => ({ ...p, [s.key]: !p[s.key] }))}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 border-b bg-gradient-to-r from-muted/30 to-transparent hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={sStatus} />
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {sApproved}/{keys.length}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {isOpen && (
                  <CardContent className="p-5 space-y-3 animate-fade-in">
                    {visibleKeys.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No fields match your filter.
                      </div>
                    ) : s.key === "documents" ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {docs.filter((d) => visibleKeys.includes(`documents:${d.name}`)).map((d) => (
                          <DocumentCard
                            key={d.name}
                            doc={d}
                            review={getReview(`documents:${d.name}`)}
                            error={backendErrors[`documents:${d.name}`]}
                            onApprove={() => approveField(`documents:${d.name}`)}
                            onReject={() => rejectField(`documents:${d.name}`)}
                            onAddComment={(t) => addComment(`documents:${d.name}`, t)}
                            onEditComment={(id, t) => editComment(`documents:${d.name}`, id, t)}
                            onDeleteComment={(id) => deleteComment(`documents:${d.name}`, id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {sectionFields[s.key as Exclude<SectionKey, "documents">]
                          .filter((f) => visibleKeys.includes(`${s.key}:${f.label}`))
                          .map((f) => {
                            const k = `${s.key}:${f.label}`;
                            return (
                              <ReviewField
                                key={k}
                                label={f.label}
                                value={f.value}
                                review={getReview(k)}
                                error={backendErrors[k]}
                                onApprove={() => approveField(k)}
                                onReject={() => rejectField(k)}
                                onAddComment={(t) => addComment(k, t)}
                                onEditComment={(id, t) => editComment(k, id, t)}
                                onDeleteComment={(id) => deleteComment(k, id)}
                              />
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* RIGHT — sticky summary */}
        <aside className="lg:sticky lg:top-[88px] lg:self-start space-y-4">
          <Card className="surface-card overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Review Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <SummaryTile label="Total" value={total} />
                <SummaryTile label="Approved" value={approved} tone="success" />
                <SummaryTile label="Rejected" value={rejected} tone="destructive" />
                <SummaryTile label="Pending" value={pending} tone="warning" />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Reviewed</span>
                  <span className="font-semibold">{reviewedPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                    style={{ width: `${reviewedPct}%` }}
                  />
                </div>
              </div>

              {pendingList.length > 0 && (
                <SummaryList
                  icon={Clock}
                  title="Pending review"
                  tone="warning"
                  items={pendingList.slice(0, 4)}
                />
              )}
              {rejectedList.length > 0 && (
                <SummaryList
                  icon={XCircle}
                  title="Rejected fields"
                  tone="destructive"
                  items={rejectedList.slice(0, 4)}
                />
              )}
              {recentComments.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Recent comments
                  </p>
                  <ul className="space-y-1.5">
                    {recentComments.map(({ k, c }) => (
                      <li key={c.id} className="rounded-lg border bg-muted/30 p-2 text-xs">
                        <p className="text-foreground line-clamp-2">{c.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                          {k.split(":")[1]} · {c.ts}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>

            <div className="border-t p-3 space-y-2 bg-muted/20">
              <Button
                className="w-full gradient-primary text-primary-foreground shadow-glow"
                disabled={approved !== total || !!decision}
                onClick={() => setApproveOpen(true)}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve Application
              </Button>
              <Button
                variant="outline"
                className="w-full border-warning/40 text-warning hover:text-warning hover:bg-warning/10"
                disabled={!!decision}
                onClick={() => setRequestChangesOpen(true)}
              >
                <Send className="mr-1.5 h-4 w-4" /> Request Changes
              </Button>
              <Button
                variant="outline"
                className="w-full border-destructive/40 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={!!decision}
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Reject Application
              </Button>
              {approved !== total && !decision && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  Approve every field to enable final approval.
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>

      {/* Request Changes modal */}
      <Dialog open={requestChangesOpen} onOpenChange={setRequestChangesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request changes from applicant</DialogTitle>
            <DialogDescription>
              The applicant will be notified and can resubmit affected fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason for changes</Label>
            <Textarea rows={5} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Describe what needs to be corrected…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRequestChangesOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={sendRequestChanges}>
              <Send className="mr-1.5 h-4 w-4" /> Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject modal */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>This will close the application. The applicant will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Rejection reason</Label>
            <Textarea rows={5} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for rejection…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={sendReject}>
              <XCircle className="mr-1.5 h-4 w-4" /> Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve modal */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {org.name}?</DialogTitle>
            <DialogDescription>
              All {total} fields are approved. The applicant will be moved to Active.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={sendApprove}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirm approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function FilterTabs({
  value, onChange, counts,
}: {
  value: FilterKey;
  onChange: (v: FilterKey) => void;
  counts: { all: number; approved: number; rejected: number; pending: number };
}) {
  const items: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "pending", label: "Pending" },
  ];
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={cn(
            "px-2.5 h-8 text-xs rounded-md flex items-center gap-1.5 transition-colors",
            value === it.key
              ? "bg-background shadow-sm text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {it.label}
          <span className="text-[10px] tabular-nums opacity-70">{counts[it.key]}</span>
        </button>
      ))}
    </div>
  );
}

function SummaryTile({
  label, value, tone,
}: { label: string; value: number; tone?: "success" | "destructive" | "warning" }) {
  const tones: Record<string, string> = {
    success: "text-success bg-success/10 border-success/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    warning: "text-warning bg-warning/10 border-warning/20",
  };
  return (
    <div className={cn("rounded-xl border p-3", tone ? tones[tone] : "bg-muted/30")}>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-2xl font-semibold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

function SummaryList({
  icon: Icon, title, tone, items,
}: { icon: any; title: string; tone: "warning" | "destructive"; items: string[] }) {
  const toneCls = tone === "warning" ? "text-warning" : "text-destructive";
  return (
    <div>
      <p className={cn("text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5", toneCls)}>
        <Icon className="h-3 w-3" /> {title}
      </p>
      <ul className="space-y-1">
        {items.map((k) => (
          <li key={k} className="text-xs text-muted-foreground rounded-md bg-muted/30 px-2 py-1 truncate">
            {k.split(":")[1]}
            <span className="text-[10px] opacity-60"> · {k.split(":")[0]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusDot({ status }: { status: FieldStatus }) {
  const map: Record<FieldStatus, string> = {
    approved: "bg-success",
    rejected: "bg-destructive",
    pending: "bg-warning",
  };
  return <span className={cn("h-2 w-2 rounded-full", map[status])} />;
}

function CommentThread({
  comments, onEdit, onDelete,
}: {
  comments: Comment[];
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  return (
    <ul className="space-y-2">
      {comments.map((c) => (
        <li
          key={c.id}
          className={cn(
            "rounded-lg border p-2.5 text-xs",
            c.author === "Reviewer" ? "border-primary/30 bg-primary/5" : "border-info/30 bg-info/5"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium text-foreground">{c.author}</span>
              <span>·</span>
              <Clock className="h-3 w-3" /> {c.ts}
            </div>
            {c.author === "Reviewer" && editingId !== c.id && (
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-6 w-6"
                  onClick={() => { setEditingId(c.id); setDraft(c.text); }}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                  onClick={() => onDelete(c.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {editingId === c.id ? (
            <div className="mt-1.5 space-y-1.5">
              <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="flex justify-end gap-1.5">
                <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button size="sm" className="h-7 gradient-primary text-primary-foreground"
                  onClick={() => { if (draft.trim()) { onEdit(c.id, draft.trim()); setEditingId(null); } }}>
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-foreground break-words">{c.text}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function CommentComposer({ onSubmit, onClose }: { onSubmit: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState("");
  // simulate autosave indicator
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1.5">
      <Textarea
        rows={2}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment for the applicant…"
        className="bg-background"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Autosaves as you type</span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" className="h-7" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            className="h-7 gradient-primary text-primary-foreground"
            disabled={!text.trim()}
            onClick={() => { onSubmit(text); setText(""); onClose(); }}
          >
            <Send className="h-3 w-3 mr-1" /> Post
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldActionButtons({
  status, onApprove, onReject, onToggleComment, commentOpen, commentCount,
}: {
  status: FieldStatus;
  onApprove: () => void;
  onReject: () => void;
  onToggleComment: () => void;
  commentOpen: boolean;
  commentCount: number;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={onApprove}
        title="Approve"
        className={cn(
          "h-8 w-8 rounded-lg border flex items-center justify-center transition-all",
          status === "approved"
            ? "bg-success text-success-foreground border-success shadow-sm"
            : "border-border hover:border-success/50 hover:bg-success/10 hover:text-success"
        )}
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        onClick={onReject}
        title="Reject"
        className={cn(
          "h-8 w-8 rounded-lg border flex items-center justify-center transition-all",
          status === "rejected"
            ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
            : "border-border hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
        )}
      >
        <X className="h-4 w-4" />
      </button>
      <button
        onClick={onToggleComment}
        title="Comment"
        className={cn(
          "h-8 px-2 rounded-lg border flex items-center gap-1 transition-all",
          commentOpen
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        {commentCount > 0 && <span className="text-[10px] font-semibold tabular-nums">{commentCount}</span>}
      </button>
    </div>
  );
}

function ReviewField({
  label, value, review, error,
  onApprove, onReject, onAddComment, onEditComment, onDeleteComment,
}: {
  label: string;
  value: string;
  review: FieldReview;
  error?: BackendError;
  onApprove: () => void;
  onReject: () => void;
  onAddComment: (text: string) => void;
  onEditComment: (id: string, text: string) => void;
  onDeleteComment: (id: string) => void;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const st = review.status;
  return (
    <div
      tabIndex={0}
      className={cn(
        "group rounded-xl border bg-card/60 p-3.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30",
        st === "approved" && "border-success/40 bg-success/5",
        st === "rejected" && "border-destructive/40 bg-destructive/5",
        st === "pending" && error?.severity === "error" && "border-destructive/30",
        st === "pending" && error?.severity === "warning" && "border-warning/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <StatusDot status={st} />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          </div>
          <p className="text-sm font-medium mt-1 break-words">{value || "—"}</p>
        </div>
        <FieldActionButtons
          status={st}
          onApprove={onApprove}
          onReject={onReject}
          onToggleComment={() => setComposerOpen((v) => !v)}
          commentOpen={composerOpen}
          commentCount={review.comments.length}
        />
      </div>

      {error && st !== "approved" && (
        <div className={cn(
          "mt-2.5 rounded-lg border p-2 flex gap-2 text-xs",
          error.severity === "error" ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10",
        )}>
          <AlertCircle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0",
            error.severity === "error" ? "text-destructive" : "text-warning")} />
          <div className="min-w-0">
            <p className={cn("font-semibold", error.severity === "error" ? "text-destructive" : "text-warning")}>
              {error.code}
              {error.source && <span className="font-normal text-muted-foreground"> · {error.source}</span>}
            </p>
            <p className="mt-0.5 break-words">{error.message}</p>
          </div>
        </div>
      )}

      {review.comments.length > 0 && (
        <div className="mt-3 animate-fade-in">
          <CommentThread comments={review.comments} onEdit={onEditComment} onDelete={onDeleteComment} />
        </div>
      )}

      {composerOpen && (
        <div className="mt-2.5 animate-fade-in">
          <CommentComposer onSubmit={onAddComment} onClose={() => setComposerOpen(false)} />
        </div>
      )}
    </div>
  );
}

function DocumentCard({
  doc, review, error,
  onApprove, onReject, onAddComment, onEditComment, onDeleteComment,
}: {
  doc: { name: string; date: string; size: string };
  review: FieldReview;
  error?: BackendError;
  onApprove: () => void;
  onReject: () => void;
  onAddComment: (t: string) => void;
  onEditComment: (id: string, t: string) => void;
  onDeleteComment: (id: string) => void;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const st = review.status;
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(doc.name);
  return (
    <div className={cn(
      "rounded-xl border bg-card/60 overflow-hidden flex flex-col transition-all",
      st === "approved" && "border-success/40",
      st === "rejected" && "border-destructive/40",
    )}>
      <div className="relative h-28 bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center">
        {isImage
          ? <FileText className="h-10 w-10 text-muted-foreground/60" />
          : <FileText className="h-10 w-10 text-primary/60" />}
        <div className="absolute top-2 left-2"><StatusDot status={st} /></div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button variant="secondary" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
          <Button variant="secondary" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div>
          <p className="text-sm font-medium truncate">{doc.name}</p>
          <p className="text-[11px] text-muted-foreground">{doc.date} · {doc.size}</p>
        </div>
        {error && st !== "approved" && (
          <div className={cn(
            "rounded-md border p-1.5 text-[11px] flex gap-1.5",
            error.severity === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-warning/40 bg-warning/10 text-warning"
          )}>
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="break-words">{error.message}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <Badge variant="outline" className="text-[10px] capitalize">{st}</Badge>
          <FieldActionButtons
            status={st}
            onApprove={onApprove}
            onReject={onReject}
            onToggleComment={() => setComposerOpen((v) => !v)}
            commentOpen={composerOpen}
            commentCount={review.comments.length}
          />
        </div>
        {review.comments.length > 0 && (
          <CommentThread comments={review.comments} onEdit={onEditComment} onDelete={onDeleteComment} />
        )}
        {composerOpen && (
          <CommentComposer onSubmit={onAddComment} onClose={() => setComposerOpen(false)} />
        )}
      </div>
    </div>
  );
}
