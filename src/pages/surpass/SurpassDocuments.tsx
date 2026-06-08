import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { useSurpass } from "./SurpassContext";
import { VerificationBadge } from "@/components/onboarding/VerificationBadge";
import { Upload, FileText, Sparkles, Check } from "lucide-react";
import { useEffect, useState } from "react";

const docs = [
  { key: "gst", name: "GST Certificate", hint: "Auto-detected from GSTN — please upload signed PDF." },
  { key: "incorp", name: "Certificate of Incorporation", hint: "MCA reference matched. Upload notarized copy." },
  { key: "address", name: "Address Proof", hint: "Utility bill or registered lease (≤ 3 months old)." },
  { key: "cheque", name: "Cancelled Cheque", hint: "Required for penny-drop bank verification." },
  { key: "board", name: "Board Resolution", hint: "Authorising payment-gateway integration." },
];

export default function SurpassDocuments() {
  const { setProgress } = useSurpass();
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({ gst: true, incorp: true });

  useEffect(() => {
    setProgress("documents", Object.values(uploaded).filter(Boolean).length / docs.length);
  }, [uploaded]);

  return (
    <SectionWrapper
      title="Smart document upload"
      description="We've matched documents to verification records. Upload only what's missing — fields are pre-filled."
      prev="/onboarding/surepass/kyc"
      next="/onboarding/surepass/bank-accounts"
    >
      <div className="grid md:grid-cols-2 gap-3">
        {docs.map((d) => {
          const done = uploaded[d.key];
          return (
            <Card key={d.key} className="p-4 surface-card flex gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                {done ? <Check className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{d.name}</p>
                  {done ? (
                    <VerificationBadge state="verified" label="Uploaded" />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                      <Sparkles className="h-3 w-3" /> Prefilled hint
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{d.hint}</p>
                <Button
                  size="sm"
                  variant={done ? "ghost" : "outline"}
                  className="mt-3"
                  onClick={() => setUploaded((p) => ({ ...p, [d.key]: !p[d.key] }))}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {done ? "Replace" : "Upload"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
