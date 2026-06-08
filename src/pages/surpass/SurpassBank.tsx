import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SectionWrapper } from "./SectionWrapper";
import { useSurpass } from "./SurpassContext";
import { VerificationBadge } from "@/components/onboarding/VerificationBadge";
import { Banknote, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SurpassBank() {
  const { data, setData, setProgress } = useSurpass();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setProgress("bank", data.verifications.pennyDrop === "verified" ? 1 : 0.3);
  }, [data.verifications.pennyDrop]);

  const runPennyDrop = async () => {
    setRunning(true);
    setData({ verifications: { ...data.verifications, pennyDrop: "pending" } });
    await new Promise((r) => setTimeout(r, 1100));
    setData({
      verifications: { ...data.verifications, pennyDrop: "verified" },
      bank: { ...data.bank, pennyDrop: "verified" },
    });
    setRunning(false);
    toast.success("Penny drop successful — name matched");
  };

  const success = data.verifications.pennyDrop === "verified";

  return (
    <SectionWrapper
      title="Bank Account"
      description="Add the settlement account and verify it instantly via penny-drop."
      prev="/onboarding/surepass/documents"
      next="/onboarding/surepass/integrations"
    >
      <Card className="p-6 surface-card">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Account number</Label>
            <Input
              value={data.bank.account}
              onChange={(e) => setData({ bank: { ...data.bank, account: e.target.value } })}
              placeholder="50100• • • •1234"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">IFSC</Label>
            <Input
              value={data.bank.ifsc}
              onChange={(e) => setData({ bank: { ...data.bank, ifsc: e.target.value.toUpperCase() } })}
              placeholder="HDFC0001234"
              className="font-mono uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Account type</Label>
            <Select value={data.bank.type} onValueChange={(v) => setData({ bank: { ...data.bank, type: v } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Current", "Savings", "Escrow"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={runPennyDrop}
              disabled={!data.bank.account || !data.bank.ifsc || running || success}
              className="gradient-primary text-primary-foreground shadow-glow w-full"
            >
              {running ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Banknote className="mr-1.5 h-4 w-4" />}
              {success ? "Verified" : running ? "Verifying…" : "Trigger penny drop"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className={`p-5 transition-all ${success ? "border-success/40 bg-success/5" : "surface-card"}`}>
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${success ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            {success ? <CheckCircle2 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Penny Drop Verification</p>
              <VerificationBadge state={data.verifications.pennyDrop} />
            </div>
            {success ? (
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <p>Beneficiary name: <span className="text-foreground font-medium">Nimbus Cloud Technologies Pvt Ltd</span></p>
                <p>Bank: HDFC Bank · IFSC {data.bank.ifsc} · ₹1.00 credited & reversed</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Enter bank details, then trigger a ₹1 penny drop. We'll match the beneficiary
                name to the legal name on record.
              </p>
            )}
          </div>
        </div>
      </Card>
    </SectionWrapper>
  );
}
