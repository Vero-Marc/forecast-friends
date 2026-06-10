import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Clock, User, ChevronRight, MessageSquarePlus,
} from "lucide-react";
import { toast } from "sonner";

type SectionKey = "overview" | "kyb" | "bank" | "documents" | "integration" | "comments";

const sections: { key: SectionKey; title: string; description: string; icon: any }[] = [
  { key: "overview", title: "Overview", description: "Snapshot", icon: ClipboardList },
  { key: "kyb", title: "KYB", description: "Business verification", icon: Building2 },
  { key: "bank", title: "Bank Account", description: "Banking details", icon: Banknote },
  { key: "documents", title: "Documents", description: "Uploaded files", icon: FileText },
  { key: "integration", title: "Integration", description: "API & webhooks", icon: Plug },
  { key: "comments", title: "Comments", description: "Reviewer notes", icon: MessageSquare },
];

interface Comment {
  id: string;
  author: string;
  section: SectionKey;
  text: string;
  ts: string;
}

const initialComments: Comment[] = [
  { id: "c1", author: "Sarah Chen", section: "kyb", text: "GST certificate looks valid. Awaiting director ID.", ts: "2h ago" },
  { id: "c2", author: "Marcus Hill", section: "documents", text: "Please reupload the bank proof in PDF format.", ts: "5h ago" },
];

const docs = [
  { name: "Certificate of Incorporation.pdf", date: "May 12, 2026", status: "Approved" },
  { name: "Tax Registration.pdf", date: "May 14, 2026", status: "In Review" },
  { name: "Director ID.png", date: "May 15, 2026", status: "Pending" },
  { name: "Bank Proof.jpg", date: "May 16, 2026", status: "Pending" },
];

// Mock backend validation errors keyed by `${section}:${label}`
// In production these would come from the verification API response.
export interface BackendError {
  code: string;
  message: string;
  severity: "error" | "warning";
  source?: string;
}

const backendErrors: Record<string, BackendError> = {
  "kyb:GST / Tax ID": {
    code: "GSTN_MISMATCH",
    message: "Legal name on GSTN registry does not match submitted legal name.",
    severity: "error",
    source: "GSTN Registry",
  },
  "kyb:Registration number": {
    code: "MCA_NOT_FOUND",
    message: "No active record found for this CIN in MCA database.",
    severity: "error",
    source: "MCA",
  },
  "kyb:Date of incorporation": {
    code: "DATE_FORMAT",
    message: "Date format differs from registry (registry: 03/12/2019).",
    severity: "warning",
    source: "MCA",
  },
  "bank:Account number": {
    code: "PENNY_DROP_FAILED",
    message: "Penny drop returned beneficiary name 'NORTHWND CAP LTD' — partial match (87%).",
    severity: "warning",
    source: "Penny Drop",
  },
  "bank:IFSC / Routing": {
    code: "IFSC_INVALID",
    message: "IFSC code not recognised by RBI directory.",
    severity: "error",
    source: "RBI",
  },
  "documents:Director ID.png": {
    code: "OCR_LOW_CONFIDENCE",
    message: "OCR confidence 62% — document may be blurred or cropped.",
    severity: "warning",
    source: "OCR Engine",
  },
  "documents:Bank Proof.jpg": {
    code: "FORMAT_REJECTED",
    message: "JPG not accepted for bank proof. Upload a signed PDF.",
    severity: "error",
    source: "Doc Validator",
  },
  "integration:Webhook URL": {
    code: "WEBHOOK_UNREACHABLE",
    message: "Last ping returned 503 Service Unavailable.",
    severity: "error",
    source: "Webhook Probe",
  },
  "overview:Email": {
    code: "EMAIL_UNVERIFIED",
    message: "Email domain not verified via DNS TXT record.",
    severity: "warning",
    source: "DNS",
  },
};

const reviewChecks: Record<SectionKey, { label: string; done: boolean }[]> = {
  overview: [],
  kyb: [
    { label: "Legal name matches registration", done: true },
    { label: "Tax ID validated", done: true },
    { label: "Director KYC verified", done: false },
  ],
  bank: [
    { label: "Account holder name matches", done: true },
    { label: "Penny drop successful", done: true },
    { label: "IFSC / routing validated", done: false },
  ],
  documents: [
    { label: "All mandatory documents uploaded", done: false },
    { label: "Documents readable & unexpired", done: true },
  ],
  integration: [
    { label: "Webhook reachable", done: true },
    { label: "Test transaction completed", done: false },
  ],
  comments: [],
};

export default function ReviewOrganization() {
  const { id } = useParams();
  const org = useMemo(() => organizations.find((o) => o.id === id) ?? organizations[0], [id]);

  const [active, setActive] = useState<SectionKey>("overview");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [fieldNotes, setFieldNotes] = useState<Record<string, string>>({});
  const [sectionDecisions, setSectionDecisions] = useState<Record<SectionKey, "approved" | "rejected" | null>>({
    overview: null, kyb: null, bank: null, documents: null, integration: null, comments: null,
  });

  const setFieldNote = (key: string, value: string) =>
    setFieldNotes((p) => ({ ...p, [key]: value }));

  const decideSection = (s: SectionKey, d: "approved" | "rejected") => {
    setSectionDecisions((p) => ({ ...p, [s]: d }));
    toast.success(`${sections.find(x => x.key === s)?.title} ${d}`);
  };

  const addComment = (section: SectionKey) => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      { id: `c${Date.now()}`, author: "You", section, text: newComment.trim(), ts: "just now" },
      ...prev,
    ]);
    setNewComment("");
    toast.success("Comment added");
  };

  const sectionComments = (s: SectionKey) => comments.filter((c) => c.section === s);
  const checks = reviewChecks[active];
  const completion = (() => {
    const all = Object.values(reviewChecks).flat();
    if (!all.length) return 0;
    return Math.round((all.filter((c) => c.done).length / all.length) * 100);
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/onboarding/in-review"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
            {org.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">{org.name}</h1>
            <p className="text-xs text-muted-foreground">
              {org.id} · {org.category} · {org.businessType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={org.kybStatus} />
          <Button variant="outline" onClick={() => setRejectOpen(true)}>
            <XCircle className="mr-1.5 h-4 w-4" /> Reject
          </Button>
          <Button
            onClick={() => setApproveOpen(true)}
            className="gradient-primary text-primary-foreground"
          >
            <Shield className="mr-1.5 h-4 w-4" /> Approve
          </Button>
        </div>
      </div>

      {decision && (
        <Card
          className={cn(
            "surface-card",
            decision === "approved" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
          )}
        >
          <CardContent className="p-4 flex items-center gap-3">
            {decision === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <div className="text-sm">
              <p className="font-medium">
                {decision === "approved" ? "Organization approved" : "Organization rejected"}
              </p>
              <p className="text-xs text-muted-foreground">
                Notification sent to the requester.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split layout: side nav + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Side nav */}
        <Card className="surface-card h-fit lg:sticky lg:top-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Review sections
              <span className="text-xs text-muted-foreground font-normal">{completion}%</span>
            </CardTitle>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <nav className="space-y-1">
              {sections.map((s) => {
                const isActive = active === s.key;
                const count = sectionComments(s.key).length;
                return (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>
                    </div>
                    {count > 0 && (
                      <span className="text-[10px] rounded-full bg-muted px-1.5 py-0.5">{count}</span>
                    )}
                    <ChevronRight className={cn("h-3.5 w-3.5 opacity-0", isActive && "opacity-100")} />
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-4 min-w-0">
          <SectionErrorSummary section={active} />
          {active === "overview" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" /> Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Legal name", value: org.name },
                  { label: "Category", value: org.category },
                  { label: "Business type", value: org.businessType },
                  { label: "Country", value: org.country },
                  { label: "Email", value: org.email },
                  { label: "Phone", value: org.phone },
                  { label: "Submitted on", value: org.createdOn },
                  { label: "Assigned reviewer", value: org.assignedAdmin },
                ].map((r) => (
                  <ReviewableField
                    key={r.label}
                    fieldKey={`overview:${r.label}`}
                    label={r.label}
                    value={r.value}
                    note={fieldNotes[`overview:${r.label}`]}
                    onSaveNote={(v) => setFieldNote(`overview:${r.label}`, v)}
                    error={backendErrors[`overview:${r.label}`]}
                  />
                ))}
              </CardContent>
              <SectionActions decision={sectionDecisions.overview} onDecide={(d) => decideSection("overview", d)} />
            </Card>
          )}

          {active === "kyb" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Know Your Business
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Business legal name", value: org.name },
                  { label: "Registration number", value: "REG-009211" },
                  { label: "GST / Tax ID", value: "GST-22AAAAA0000A1Z5" },
                  { label: "Date of incorporation", value: "12 Mar 2019" },
                  { label: "Country", value: org.country },
                  { label: "Website", value: `https://${org.name.toLowerCase().replace(/\s+/g, "")}.com` },
                  { label: "Registered address", value: "221B Market Street, Suite 400, San Francisco, CA 94107", wide: true },
                ].map((r) => (
                  <div key={r.label} className={r.wide ? "sm:col-span-2" : ""}>
                    <ReviewableField
                      fieldKey={`kyb:${r.label}`}
                      label={r.label}
                      value={r.value}
                      note={fieldNotes[`kyb:${r.label}`]}
                      onSaveNote={(v) => setFieldNote(`kyb:${r.label}`, v)}
                      error={backendErrors[`kyb:${r.label}`]}
                    />
                  </div>
                ))}
              </CardContent>
              <SectionActions decision={sectionDecisions.kyb} onDecide={(d) => decideSection("kyb", d)} />
            </Card>
          )}

          {active === "bank" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-primary" /> Bank account
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Account holder", value: org.name },
                  { label: "Account number", value: "•••• •••• 1234" },
                  { label: "Bank", value: "Pinnacle Trust" },
                  { label: "Branch", value: "SF Downtown" },
                  { label: "IFSC / Routing", value: "PINTUS33" },
                  { label: "Account type", value: "Current" },
                ].map((r) => (
                  <ReviewableField
                    key={r.label}
                    fieldKey={`bank:${r.label}`}
                    label={r.label}
                    value={r.value}
                    note={fieldNotes[`bank:${r.label}`]}
                    onSaveNote={(v) => setFieldNote(`bank:${r.label}`, v)}
                    error={backendErrors[`bank:${r.label}`]}
                  />
                ))}
              </CardContent>
              <SectionActions decision={sectionDecisions.bank} onDecide={(d) => decideSection("bank", d)} />
            </Card>
          )}

          {active === "documents" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {docs.map((f) => {
                  const k = `documents:${f.name}`;
                  const err = backendErrors[k];
                  const isError = err?.severity === "error";
                  const isWarn = err?.severity === "warning";
                  return (
                    <div
                      key={f.name}
                      className={cn(
                        "rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors",
                        isError && "border-destructive/50 bg-destructive/5",
                        isWarn && "border-warning/50 bg-warning/5",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{f.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {f.date}
                            {fieldNotes[k] && <span className="ml-2 text-primary">· Review note added</span>}
                          </p>
                        </div>
                        <StatusBadge status={f.status as any} />
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                        <FieldNotePopover
                          label={f.name}
                          note={fieldNotes[k]}
                          onSave={(v) => setFieldNote(k, v)}
                        />
                      </div>
                      {err && (
                        <div className={cn(
                          "mt-2 ml-12 rounded-md border p-2 flex gap-2",
                          isError ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10",
                        )}>
                          <AlertCircle className={cn(
                            "h-3.5 w-3.5 mt-0.5 shrink-0",
                            isError ? "text-destructive" : "text-warning",
                          )} />
                          <div className="min-w-0">
                            <p className={cn(
                              "text-[11px] font-semibold flex items-center gap-1.5 flex-wrap",
                              isError ? "text-destructive" : "text-warning",
                            )}>
                              {err.code}
                              {err.source && (
                                <span className="font-normal text-muted-foreground">· {err.source}</span>
                              )}
                            </p>
                            <p className="text-xs text-foreground mt-0.5 break-words">{err.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
              <SectionActions decision={sectionDecisions.documents} onDecide={(d) => decideSection("documents", d)} />
            </Card>
          )}

          {active === "integration" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plug className="h-4 w-4 text-primary" /> Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Live API key</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <code className="text-sm font-mono px-2 py-1 rounded bg-background border flex-1 truncate">
                      sk_live_4f9a82••••••••••••3201
                    </code>
                    <Button variant="outline" size="sm">Copy</Button>
                  </div>
                </div>
                {[
                  { label: "Webhook URL", value: "https://api.acme.com/webhooks/fynnix" },
                  { label: "Last delivery", value: "200 OK · 2h ago" },
                ].map((r) => (
                  <ReviewableField
                    key={r.label}
                    fieldKey={`integration:${r.label}`}
                    label={r.label}
                    value={r.value}
                    note={fieldNotes[`integration:${r.label}`]}
                    onSaveNote={(v) => setFieldNote(`integration:${r.label}`, v)}
                    error={backendErrors[`integration:${r.label}`]}
                  />
                ))}
              </CardContent>
              <SectionActions decision={sectionDecisions.integration} onDecide={(d) => decideSection("integration", d)} />
            </Card>
          )}

          {active === "comments" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> All comments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No comments yet.</p>
                )}
                {comments.map((c) => (
                  <CommentRow key={c.id} c={c} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Review checklist + Comment thread for the active section */}
          {active !== "comments" && active !== "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="surface-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Review checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={cn("h-4 w-4", c.done ? "text-success" : "text-muted-foreground/40")} />
                      <span className={cn(!c.done && "text-muted-foreground")}>{c.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="surface-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Section comments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 max-h-48 overflow-auto pr-1">
                    {sectionComments(active).length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No comments on this section.</p>
                    ) : (
                      sectionComments(active).map((c) => <CommentRow key={c.id} c={c} compact />)
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs">Add a comment</Label>
                    <Textarea
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={`Write a note about ${sections.find((s) => s.key === active)?.title}…`}
                    />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => addComment(active)} className="gradient-primary text-primary-foreground">
                        <Send className="mr-1.5 h-3.5 w-3.5" /> Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Comments composer when on comments tab */}
          {active === "comments" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Add a general comment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share a note with the review team…"
                />
                <div className="flex justify-end">
                  <Button onClick={() => addComment("comments")} className="gradient-primary text-primary-foreground">
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Post comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "overview" && (
            <Card className="surface-card border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Items needing attention</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Director KYC pending · Test transaction not completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {org.name}?</DialogTitle>
            <DialogDescription>
              This marks the organization as approved and notifies the requester. The
              organization will move to Active.
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
                setDecision("approved");
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

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {org.name}?</DialogTitle>
            <DialogDescription>
              Provide a reason so the requester knows what to fix. The organization will
              move back to the merchant for action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason for rejection</Label>
            <Textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="e.g. Director ID is unreadable, please resubmit."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!decisionNote.trim()) {
                  toast.error("Please add a reason");
                  return;
                }
                setDecision("rejected");
                setRejectOpen(false);
                setDecisionNote("");
                toast.success("Organization rejected");
              }}
            >
              <XCircle className="mr-1.5 h-4 w-4" /> Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card/50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-1 break-words">{value}</p>
    </div>
  );
}

function CommentRow({ c, compact }: { c: Comment; compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-card/50 p-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <User className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{c.author}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.ts}</span>
          {!compact && (
            <>
              <span>·</span>
              <span className="capitalize">{c.section}</span>
            </>
          )}
        </div>
        <p className="text-sm mt-1 break-words">{c.text}</p>
      </div>
    </div>
  );
}

function FieldNotePopover({
  label, note, onSave,
}: { label: string; note?: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(note ?? "");
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setDraft(note ?? ""); }}>
      <PopoverTrigger asChild>
        <Button
          variant={note ? "secondary" : "ghost"}
          size="sm"
          className={cn("h-7 gap-1", note && "text-primary")}
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          {note ? "Review" : "Add review"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
          <Textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a review note for this field…"
          />
          <div className="flex justify-end gap-1.5">
            {note && (
              <Button variant="ghost" size="sm" onClick={() => { onSave(""); setOpen(false); }}>
                Clear
              </Button>
            )}
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground"
              onClick={() => { onSave(draft.trim()); setOpen(false); toast.success("Review note saved"); }}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ReviewableField({
  fieldKey, label, value, note, onSaveNote, error,
}: { fieldKey: string; label: string; value: string; note?: string; onSaveNote: (v: string) => void; error?: BackendError }) {
  const isError = error?.severity === "error";
  const isWarn = error?.severity === "warning";
  return (
    <div className={cn(
      "rounded-md border bg-card/50 p-3 transition-colors",
      note && "border-primary/40 bg-primary/5",
      isError && "border-destructive/50 bg-destructive/5",
      isWarn && "border-warning/50 bg-warning/5",
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn(
            "text-sm font-medium mt-1 break-words",
            isError && "text-destructive",
          )}>{value}</p>
        </div>
        <FieldNotePopover label={label} note={note} onSave={onSaveNote} />
      </div>
      {error && (
        <div className={cn(
          "mt-2 rounded-md border p-2 flex gap-2",
          isError ? "border-destructive/40 bg-destructive/10" : "border-warning/40 bg-warning/10",
        )}>
          <AlertCircle className={cn(
            "h-3.5 w-3.5 mt-0.5 shrink-0",
            isError ? "text-destructive" : "text-warning",
          )} />
          <div className="min-w-0">
            <p className={cn(
              "text-[11px] font-semibold flex items-center gap-1.5 flex-wrap",
              isError ? "text-destructive" : "text-warning",
            )}>
              {error.code}
              {error.source && (
                <span className="font-normal text-muted-foreground">· {error.source}</span>
              )}
            </p>
            <p className="text-xs text-foreground mt-0.5 break-words">{error.message}</p>
          </div>
        </div>
      )}
      {note && (
        <div className="mt-2 rounded-md bg-background/60 border border-dashed border-primary/30 p-2">
          <p className="text-[11px] text-primary font-medium flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Reviewer note
          </p>
          <p className="text-xs text-foreground mt-0.5 break-words">{note}</p>
        </div>
      )}
    </div>
  );
}

function SectionActions({
  decision, onDecide,
}: { decision: "approved" | "rejected" | null; onDecide: (d: "approved" | "rejected") => void }) {
  return (
    <div className="border-t px-6 py-3 flex items-center justify-between gap-3 bg-muted/20">
      <div className="text-xs text-muted-foreground">
        {decision === "approved" && (
          <Badge variant="outline" className="border-success/40 text-success bg-success/10">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Section approved
          </Badge>
        )}
        {decision === "rejected" && (
          <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10">
            <XCircle className="mr-1 h-3 w-3" /> Section rejected
          </Badge>
        )}
        {!decision && <span>Decide on this section once you've added any review notes.</span>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDecide("rejected")}
          className={cn(decision === "rejected" && "border-destructive text-destructive")}
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject section
        </Button>
        <Button
          size="sm"
          onClick={() => onDecide("approved")}
          className={cn(
            "gradient-primary text-primary-foreground",
            decision === "approved" && "ring-2 ring-success/40"
          )}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve section
        </Button>
      </div>
    </div>
  );
}

