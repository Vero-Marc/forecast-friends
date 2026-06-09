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
          {active === "overview" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" /> Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div key={r.label}>
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-sm font-medium mt-0.5">{r.value}</p>
                  </div>
                ))}
              </CardContent>
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
                <Field label="Business legal name" value={org.name} />
                <Field label="Registration number" value="REG-009211" />
                <Field label="GST / Tax ID" value="GST-22AAAAA0000A1Z5" />
                <Field label="Date of incorporation" value="12 Mar 2019" />
                <Field label="Country" value={org.country} />
                <Field label="Website" value={`https://${org.name.toLowerCase().replace(/\s+/g, "")}.com`} />
                <div className="sm:col-span-2">
                  <Field label="Registered address" value="221B Market Street, Suite 400, San Francisco, CA 94107" />
                </div>
              </CardContent>
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
                <Field label="Account holder" value={org.name} />
                <Field label="Account number" value="•••• •••• 1234" />
                <Field label="Bank" value="Pinnacle Trust" />
                <Field label="Branch" value="SF Downtown" />
                <Field label="IFSC / Routing" value="PINTUS33" />
                <Field label="Account type" value="Current" />
              </CardContent>
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
                {docs.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">Uploaded {f.date}</p>
                    </div>
                    <StatusBadge status={f.status as any} />
                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "integration" && (
            <Card className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plug className="h-4 w-4 text-primary" /> Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Live API key</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <code className="text-sm font-mono px-2 py-1 rounded bg-background border flex-1 truncate">
                      sk_live_4f9a82••••••••••••3201
                    </code>
                    <Button variant="outline" size="sm">Copy</Button>
                  </div>
                </div>
                <Field label="Webhook URL" value="https://api.acme.com/webhooks/fynnix" />
                <Field label="Last delivery" value="200 OK · 2h ago" />
              </CardContent>
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
