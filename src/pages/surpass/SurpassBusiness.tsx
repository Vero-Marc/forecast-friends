import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SectionWrapper } from "./SectionWrapper";
import { useSurpass } from "./SurpassContext";
import { useEffect } from "react";

export default function SurpassBusiness() {
  const { data, setData, setProgress } = useSurpass();
  useEffect(() => { setProgress("business", 1); }, []);

  return (
    <SectionWrapper
      title="Business Details"
      description="Auto-filled from MCA lookup. Edit anything that needs correction before submission."
      prev="/onboarding/surepass"
      next="/onboarding/surepass/kyb"
    >
      <Card className="p-6 surface-card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Legal name">
            <Input value={data.legalName} onChange={(e) => setData({ legalName: e.target.value })} />
          </Field>
          <Field label="Trade name">
            <Input value={data.tradeName} onChange={(e) => setData({ tradeName: e.target.value })} />
          </Field>
          <Field label="Business type">
            <Select value={data.businessType} onValueChange={(v) => setData({ businessType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Incorporation date">
            <Input type="date" value={data.incorporationDate} onChange={(e) => setData({ incorporationDate: e.target.value })} />
          </Field>
        </div>
        <Field label="Registered address">
          <Textarea rows={2} value={data.regAddress} onChange={(e) => setData({ regAddress: e.target.value })} />
        </Field>
        <Field label="Operational address">
          <Textarea rows={2} value={data.opsAddress} onChange={(e) => setData({ opsAddress: e.target.value })} />
        </Field>
      </Card>
    </SectionWrapper>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
