import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { useSurpass } from "./SurpassContext";
import { VerificationBadge } from "@/components/onboarding/VerificationBadge";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Edit3, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SurpassReview() {
  const { data, setProgress } = useSurpass();
  const navigate = useNavigate();
  useEffect(() => { setProgress("review", 1); }, []);

  const submit = () => {
    toast.success("Submitted for review");
    navigate("/onboarding/in-review");
  };

  const sections = [
    {
      title: "Business Details",
      edit: "/onboarding/surepass/business-details",
      rows: [
        ["Legal name", data.legalName],
        ["Trade name", data.tradeName],
        ["Type", data.businessType],
        ["Incorporated", data.incorporationDate],
        ["Address", data.regAddress],
      ],
    },
    {
      title: "KYB",
      edit: "/onboarding/surepass/kyb",
      rows: [
        ["PAN", data.pan, data.verifications.pan],
        ["CIN", data.cin, data.verifications.mca],
        ["GST", data.gst, data.verifications.gst],
        ["CKYC", data.ckyc, data.verifications.ckyc],
      ] as any,
    },
    {
      title: "Bank",
      edit: "/onboarding/surepass/bank-accounts",
      rows: [
        ["Account", data.bank.account],
        ["IFSC", data.bank.ifsc],
        ["Penny drop", data.bank.pennyDrop === "verified" ? "Verified" : "Pending", data.verifications.pennyDrop],
      ] as any,
    },
    {
      title: "Integration",
      edit: "/onboarding/surepass/integrations",
      rows: [
        ["Webhook", data.webhook || "—"],
        ["API key", data.apiKey],
      ],
    },
  ];

  return (
    <SectionWrapper
      title="Review & Submit"
      description="Review every section. Submission locks the data and triggers compliance review."
      prev="/onboarding/surepass/integrations"
    >
      <Card className="p-5 border-success/30 bg-success/5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="text-sm font-medium">Compliance checklist complete</p>
            <p className="text-xs text-muted-foreground">All required verifications have passed. Ready to submit.</p>
          </div>
        </div>
      </Card>

      {sections.map((s) => (
        <Card key={s.title} className="p-5 surface-card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-sm flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {s.title}
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link to={s.edit}><Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit</Link>
            </Button>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {s.rows.map(([k, v, state]: any) => (
              <div key={k} className="flex items-start justify-between gap-3 py-1 border-b border-border/50 last:border-0">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-right flex items-center gap-2 max-w-[60%] truncate">
                  <span className="truncate">{v || "—"}</span>
                  {state && <VerificationBadge state={state} />}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button size="lg" onClick={submit} className="gradient-primary text-primary-foreground shadow-glow">
          Submit for review
        </Button>
      </div>
    </SectionWrapper>
  );
}
