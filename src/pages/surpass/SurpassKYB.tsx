import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { useSurpass } from "./SurpassContext";
import { VerificationBadge } from "@/components/onboarding/VerificationBadge";
import { ShieldCheck, RefreshCw, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function SurpassKYB() {
  const { data, setData, setProgress } = useSurpass();
  useEffect(() => { setProgress("kyb", 1); }, []);

  return (
    <SectionWrapper
      title="Know Your Business"
      description="Identity & legal status verified across PAN, CIN, GST, and MCA registries."
      prev="/onboarding/surpass/business-details"
      next="/onboarding/surpass/kyc"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <VerifyCard
          name="PAN Verification"
          subtitle="Permanent Account Number — Income Tax Department"
          value={data.pan}
          state={data.verifications.pan}
          rawSummary={{ status: "ACTIVE", category: "Company", lastSync: "2026-06-08 10:21" }}
        >
          <Input value={data.pan} readOnly className="font-mono uppercase" />
        </VerifyCard>

        <VerifyCard
          name="CIN / MCA"
          subtitle="Ministry of Corporate Affairs registry"
          value={data.cin}
          state={data.verifications.mca}
          rawSummary={{ status: "ACTIVE", roc: "Bangalore", paidUpCapital: "₹50,00,000" }}
        >
          <Input value={data.cin} onChange={(e) => setData({ cin: e.target.value })} className="font-mono" />
        </VerifyCard>

        <VerifyCard
          name="GST Verification"
          subtitle="Goods and Services Tax Network"
          value={data.gst}
          state={data.verifications.gst}
          rawSummary={{ status: "Active", state: "Karnataka", filingStatus: "Up-to-date" }}
        >
          <Input value={data.gst} onChange={(e) => setData({ gst: e.target.value })} className="font-mono" />
        </VerifyCard>

        <VerifyCard
          name="CKYC Record"
          subtitle="Central KYC Records Registry"
          value={data.ckyc}
          state={data.verifications.ckyc}
          rawSummary={{ recordFound: true, sourceFI: "HDFC Bank", lastUpdated: "2025-12-04" }}
        >
          <Input value={data.ckyc} onChange={(e) => setData({ ckyc: e.target.value })} className="font-mono" />
        </VerifyCard>
      </div>
    </SectionWrapper>
  );
}

function VerifyCard({
  name, subtitle, state, rawSummary, children,
}: {
  name: string;
  subtitle: string;
  value: string;
  state: any;
  rawSummary: Record<string, any>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-5 surface-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-sm flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <VerificationBadge state={state} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Reference</Label>
        {children}
      </div>
      <div className="flex items-center justify-between mt-3">
        <Button variant="ghost" size="sm" className="text-xs">
          <RefreshCw className="mr-1.5 h-3 w-3" /> Re-verify
        </Button>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              Raw response <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <pre className="text-[11px] bg-muted/50 p-2.5 rounded-md overflow-x-auto font-mono">
{JSON.stringify(rawSummary, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
