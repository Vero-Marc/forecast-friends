import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Stepper } from "@/components/common/Stepper";
import {
  Store, Handshake, Users, CheckCircle2, ArrowLeft, ArrowRight, Sparkles,
  LayoutGrid, ClipboardList, Building2, Banknote, FileText, Plug, FileCheck2,
  Upload, Trash2, Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Category } from "@/data/mockData";
import { StatusBadge } from "@/components/common/StatusBadge";

const steps = [
  { title: "Category", description: "Org type", icon: LayoutGrid },
  { title: "Details", description: "Basic info", icon: ClipboardList },
  { title: "KYB", description: "Business", icon: Building2 },
  { title: "Account", description: "Banking", icon: Banknote },
  { title: "Documents", description: "Uploads", icon: FileText },
  { title: "Integration", description: "API", icon: Plug },
  { title: "Review", description: "Submit", icon: FileCheck2 },
];

const categories: { id: Category; title: string; description: string; icon: any }[] = [
  { id: "Merchant", title: "Merchant", description: "Accepts payments directly from customers.", icon: Store },
  { id: "Reseller", title: "Reseller", description: "Resells services on behalf of merchants.", icon: Users },
  { id: "Partner", title: "Partner", description: "Strategic integration or referral partner.", icon: Handshake },
];

export default function CreateOrganization() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", businessType: "",
    serviceType: "", bankPipeline: "", affiliateId: "",
    // KYB
    legalName: "", regNumber: "", taxId: "", country: "us",
    address: "", city: "", state: "", postal: "",
    // Bank
    holder: "", accNo: "", accNo2: "", bank: "", branch: "", ifsc: "",
    // Integration
    webhook: "",
  });
  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const canContinue =
    step === 0 ? !!category :
    step === 1 ? !!form.name && !!form.email :
    step === 2 ? !!form.legalName && !!form.country :
    step === 3 ? !!form.accNo && form.accNo === form.accNo2 :
    true;

  const submit = () => {
    toast.success("Organization submitted for review");
    navigate("/onboarding/in-review");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create organization</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete every step to onboard the entity. Drafts are auto-saved.
        </p>
      </div>

      <Card className="surface-card">
        <CardContent className="p-6">
          <Stepper steps={steps} current={step} />
        </CardContent>
      </Card>

      {/* STEP 0 — CATEGORY */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((c) => {
            const selected = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "text-left surface-card p-5 transition-all hover:shadow-elevated hover:-translate-y-0.5",
                  selected && "ring-2 ring-primary border-primary shadow-glow"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "h-11 w-11 rounded-lg flex items-center justify-center",
                    selected ? "gradient-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    selected ? "border-primary bg-primary" : "border-border"
                  )}>
                    {selected && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                  </span>
                </div>
                <p className="font-semibold mt-4">{c.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 1 — DETAILS */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="surface-card">
            <CardContent className="p-6 space-y-4">
              <p className="font-semibold">Organization info</p>
              <div className="space-y-1.5">
                <Label>Organization name <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Acme Holdings Inc." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Phone number</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 415 555 0100" />
                </div>
                <div className="space-y-1.5">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="ops@acme.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Business type</Label>
                <Select value={form.businessType} onValueChange={(v) => update("businessType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["E-commerce", "SaaS", "Financial Services", "Healthcare", "Retail", "Marketplace", "Education"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardContent className="p-6 space-y-4">
              <p className="font-semibold">Category configuration</p>
              {category === "Merchant" ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Service type</Label>
                    <Select value={form.serviceType} onValueChange={(v) => update("serviceType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select service…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acquiring">Card acquiring</SelectItem>
                        <SelectItem value="ach">ACH & bank transfers</SelectItem>
                        <SelectItem value="wallet">Digital wallets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bank pipeline</Label>
                    <Select value={form.bankPipeline} onValueChange={(v) => update("bankPipeline", v)}>
                      <SelectTrigger><SelectValue placeholder="Select bank…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pinnacle">Pinnacle Trust</SelectItem>
                        <SelectItem value="meridian">Meridian Bank</SelectItem>
                        <SelectItem value="union">Union Federal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Affiliate ID</Label>
                    <Input value={form.affiliateId} onChange={(e) => update("affiliateId", e.target.value)} placeholder="AFF-00000" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="font-medium">No additional configuration required</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    {category ?? "Choose a category"} accounts don't need extra setup at this step.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2 — KYB */}
      {step === 2 && (
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Know Your Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Business legal name <span className="text-destructive">*</span></Label>
                <Input value={form.legalName} onChange={(e) => update("legalName", e.target.value)} placeholder={form.name || "Legal entity name"} />
              </div>
              <div className="space-y-1.5"><Label>Registration number</Label>
                <Input value={form.regNumber} onChange={(e) => update("regNumber", e.target.value)} placeholder="REG-009211" />
              </div>
              <div className="space-y-1.5"><Label>GST / Tax ID</Label>
                <Input value={form.taxId} onChange={(e) => update("taxId", e.target.value)} placeholder="GST-22AAAAA0000A1Z5" />
              </div>
              <div className="space-y-1.5"><Label>Country</Label>
                <Select value={form.country} onValueChange={(v) => update("country", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="sg">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Address line</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, Suite #" />
              </div>
              <div className="space-y-1.5"><Label>City</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="San Francisco" />
              </div>
              <div className="space-y-1.5"><Label>State / Province</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="California" />
              </div>
              <div className="space-y-1.5"><Label>Postal code</Label>
                <Input value={form.postal} onChange={(e) => update("postal", e.target.value)} placeholder="94107" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3 — ACCOUNT */}
      {step === 3 && (
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" /> Account information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2"><Label>Account holder name</Label>
                <Input value={form.holder} onChange={(e) => update("holder", e.target.value)} placeholder="As per bank records" />
              </div>
              <div className="space-y-1.5"><Label>Account number <span className="text-destructive">*</span></Label>
                <Input value={form.accNo} onChange={(e) => update("accNo", e.target.value)} placeholder="•••• 1234" />
              </div>
              <div className="space-y-1.5"><Label>Confirm account number <span className="text-destructive">*</span></Label>
                <Input value={form.accNo2} onChange={(e) => update("accNo2", e.target.value)} placeholder="•••• 1234" />
                {form.accNo && form.accNo2 && form.accNo !== form.accNo2 && (
                  <p className="text-xs text-destructive">Account numbers don't match.</p>
                )}
              </div>
              <div className="space-y-1.5"><Label>Bank</Label>
                <Input value={form.bank} onChange={(e) => update("bank", e.target.value)} placeholder="Pinnacle Trust" />
              </div>
              <div className="space-y-1.5"><Label>Branch</Label>
                <Input value={form.branch} onChange={(e) => update("branch", e.target.value)} placeholder="SF Downtown" />
              </div>
              <div className="space-y-1.5 sm:col-span-2"><Label>IFSC / Routing number</Label>
                <Input value={form.ifsc} onChange={(e) => update("ifsc", e.target.value)} placeholder="PINTUS33" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4 — DOCUMENTS */}
      {step === 4 && (
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Document verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {[
                  { name: "Certificate of Incorporation.pdf", date: "Just now", status: "Pending" },
                  { name: "Tax Registration.pdf", date: "Just now", status: "Pending" },
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
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3"><Upload className="h-5 w-5" /></div>
                <p className="font-medium">Drag & drop files</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB · multiple supported</p>
                <Button variant="outline" className="mt-4">Browse files</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5 — INTEGRATION */}
      {step === 5 && (
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary" /> Application integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Sandbox API key (auto-generated)</p>
              <div className="flex items-center gap-2 mt-1.5">
                <code className="text-sm font-mono px-2 py-1 rounded bg-background border flex-1 truncate">
                  sk_test_4f9a82••••••••••••3201
                </code>
                <Button variant="outline" size="sm">Copy</Button>
                <Button variant="outline" size="sm">Rotate</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input value={form.webhook} onChange={(e) => update("webhook", e.target.value)} placeholder="https://api.acme.com/webhooks/fynnix" />
                <Button variant="outline">Test</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We'll deliver events as POST requests signed with your secret.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 6 — REVIEW */}
      {step === 6 && (
        <Card className="surface-card">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Review submission</p>
                <p className="text-sm text-muted-foreground">Verify the details below before submitting for review.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ["Category", category],
                ["Organization", form.name || "—"],
                ["Email", form.email || "—"],
                ["Phone", form.phone || "—"],
                ["Business type", form.businessType || "—"],
                ["Service type", form.serviceType || "—"],
                ["Legal name", form.legalName || "—"],
                ["Tax ID", form.taxId || "—"],
                ["Country", form.country.toUpperCase()],
                ["Account no.", form.accNo ? `•••• ${form.accNo.slice(-4)}` : "—"],
                ["Bank", form.bank || "—"],
                ["Webhook", form.webhook || "—"],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="text-sm font-medium mt-0.5 truncate">{v as string}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-0 -mx-4 md:-mx-6 lg:-mx-8 bg-background/90 backdrop-blur border-t px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.success("Draft saved")}>Save draft</Button>
          {step < steps.length - 1 ? (
            <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className="gradient-primary text-primary-foreground">
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} className="gradient-primary text-primary-foreground">Submit for review</Button>
          )}
        </div>
      </div>
    </div>
  );
}
