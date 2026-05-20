import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Stepper } from "@/components/common/Stepper";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import {
  ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, FileText, Upload,
  Building2, Banknote, Plug, Shield, Trash2, Download,
} from "lucide-react";
import { toast } from "sonner";

const steps = [
  { title: "KYB", description: "Business verification", icon: Building2 },
  { title: "Account", description: "Banking", icon: Banknote },
  { title: "Documents", description: "Upload files", icon: FileText },
  { title: "Integration", description: "API & webhook", icon: Plug },
];

export default function OnboardingDetail() {
  const { id } = useParams();
  const org = useMemo(() => organizations.find((o) => o.id === id) ?? organizations[0], [id]);
  const [step, setStep] = useState(0);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [remarks, setRemarks] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link to="/onboarding"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
            {org.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">{org.name}</h1>
            <p className="text-xs text-muted-foreground">{org.id} · {org.category} · {org.businessType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={org.status} />
          <Button variant="outline">Save draft</Button>
          <Button onClick={() => setApproveOpen(true)} className="gradient-primary text-primary-foreground"><Shield className="mr-1.5 h-4 w-4" />Approve</Button>
        </div>
      </div>

      <Card className="surface-card">
        <CardContent className="p-6">
          <Stepper steps={steps} current={step} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="surface-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {step === 0 && <><Building2 className="h-4 w-4 text-primary"/>Know Your Business</>}
              {step === 1 && <><Banknote className="h-4 w-4 text-primary"/>Account information</>}
              {step === 2 && <><FileText className="h-4 w-4 text-primary"/>Document verification</>}
              {step === 3 && <><Plug className="h-4 w-4 text-primary"/>Application integration</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Business legal name</Label><Input defaultValue={org.name} /></div>
                <div className="space-y-1.5"><Label>Registration number</Label><Input placeholder="REG-009211" /></div>
                <div className="space-y-1.5"><Label>GST / Tax ID</Label><Input placeholder="GST-22AAAAA0000A1Z5" /></div>
                <div className="space-y-1.5"><Label>Country</Label>
                  <Select defaultValue="us">
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Address line</Label><Input placeholder="Street, Suite #" /></div>
                <div className="space-y-1.5"><Label>City</Label><Input placeholder="San Francisco" /></div>
                <div className="space-y-1.5"><Label>State / Province</Label><Input placeholder="California" /></div>
                <div className="space-y-1.5"><Label>Postal code</Label><Input placeholder="94107" /></div>
              </div>
            )}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2"><Label>Account holder name</Label><Input placeholder="As per bank records" /></div>
                <div className="space-y-1.5"><Label>Account number</Label><Input placeholder="•••• 1234" /></div>
                <div className="space-y-1.5"><Label>Confirm account number</Label><Input placeholder="•••• 1234" /></div>
                <div className="space-y-1.5"><Label>Bank</Label><Input placeholder="Pinnacle Trust" /></div>
                <div className="space-y-1.5"><Label>Branch</Label><Input placeholder="SF Downtown" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>IFSC / Routing number</Label><Input placeholder="PINTUS33" /></div>
              </div>
            )}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {[
                    { name: "Certificate of Incorporation.pdf", date: "May 12, 2026", status: "Approved" },
                    { name: "Tax Registration.pdf", date: "May 14, 2026", status: "In Review" },
                    { name: "Director ID.png", date: "May 15, 2026", status: "Pending" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors">
                      <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">Uploaded {f.date}</p>
                      </div>
                      <StatusBadge status={f.status as any} />
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border-2 border-dashed bg-muted/30 p-8 flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3"><Upload className="h-5 w-5"/></div>
                  <p className="font-medium">Drag & drop files</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB · multiple supported</p>
                  <Button variant="outline" className="mt-4">Browse files</Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Live API key</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <code className="text-sm font-mono px-2 py-1 rounded bg-background border flex-1 truncate">sk_live_4f9a82••••••••••••3201</code>
                    <Button variant="outline" size="sm">Copy</Button>
                    <Button variant="outline" size="sm">Rotate</Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input defaultValue="https://api.acme.com/webhooks/fynnix" />
                    <Button variant="outline">Test webhook</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">We'll deliver events as POST requests signed with your secret.</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4"/> Previous
              </Button>
              <Button disabled={step === steps.length - 1} onClick={() => setStep((s) => s + 1)} className="gradient-primary text-primary-foreground">
                Save & continue <ArrowRight className="ml-1.5 h-4 w-4"/>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="surface-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Completion checklist</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "KYB submitted", done: true },
                { label: "Banking verified", done: true },
                { label: "Documents uploaded", done: false },
                { label: "Integration tested", done: false },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className={c.done ? "h-4 w-4 text-success" : "h-4 w-4 text-muted-foreground/50"} />
                  <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Activity timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative border-l border-border ml-2 space-y-4">
                {[
                  { t: "KYB approved by Sarah", ts: "2 hours ago", color: "text-success" },
                  { t: "Documents in review", ts: "5 hours ago", color: "text-info" },
                  { t: "Banking details added", ts: "Yesterday", color: "text-primary" },
                  { t: "Organization created", ts: "May 10", color: "text-muted-foreground" },
                ].map((e, i) => (
                  <li key={i} className="ml-4">
                    <span className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-background ${e.color.replace("text-","bg-")}`} />
                    <p className="text-sm">{e.t}</p>
                    <p className="text-xs text-muted-foreground">{e.ts}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="surface-card border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div className="text-sm">
                <p className="font-medium">2 items need attention</p>
                <p className="text-muted-foreground text-xs mt-0.5">Missing director ID and webhook validation.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approved ? "Organization approved" : "Approve organization?"}</DialogTitle>
            <DialogDescription>
              {approved
                ? `${org.name} is now active and can process transactions.`
                : `This will mark ${org.name} as approved and notify the requester.`}
            </DialogDescription>
          </DialogHeader>
          {!approved && (
            <div className="space-y-1.5">
              <Label>Remarks (optional)</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add internal notes…" />
            </div>
          )}
          <DialogFooter>
            {approved ? (
              <Button onClick={() => { setApproveOpen(false); setApproved(false); }}>Done</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
                <Button
                  className="gradient-primary text-primary-foreground"
                  onClick={() => { setApproved(true); toast.success("Approval recorded"); }}
                >Approve</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
