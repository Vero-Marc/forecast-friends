import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Stepper } from "@/components/common/Stepper";
import { Store, Handshake, Users, CheckCircle2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Category } from "@/data/mockData";

const steps = [
  { title: "Category", description: "Choose org type" },
  { title: "Details", description: "Basic info" },
  { title: "Review", description: "Confirm & submit" },
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
  });
  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const canContinue = step === 0 ? !!category : step === 1 ? !!form.name && !!form.email : true;

  const submit = () => {
    toast.success("Organization submitted for review");
    navigate("/onboarding");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create organization</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete the steps below to start onboarding a new entity.</p>
      </div>

      <Card className="surface-card">
        <CardContent className="p-6">
          <Stepper steps={steps} current={step} />
        </CardContent>
      </Card>

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
                <p className="text-xs text-muted-foreground">Used to determine compliance requirements.</p>
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

      {step === 2 && (
        <Card className="surface-card">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Review submission</p>
                <p className="text-sm text-muted-foreground">Verify the details below before submitting.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["Category", category],
                ["Organization", form.name || "—"],
                ["Email", form.email || "—"],
                ["Phone", form.phone || "—"],
                ["Business type", form.businessType || "—"],
                ["Service type", form.serviceType || "—"],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="text-sm font-medium mt-0.5">{v as string}</p>
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
        {step < steps.length - 1 ? (
          <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)} className="gradient-primary text-primary-foreground">
            Continue <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} className="gradient-primary text-primary-foreground">Submit for review</Button>
        )}
      </div>
    </div>
  );
}
