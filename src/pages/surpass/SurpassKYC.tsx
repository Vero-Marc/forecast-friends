import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./SectionWrapper";
import { useSurpass } from "./SurpassContext";
import { VerificationBadge } from "@/components/onboarding/VerificationBadge";
import { UserCheck, Smartphone, ShieldCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SurpassKYC() {
  const { data, setData, setProgress } = useSurpass();
  const [otpFor, setOtpFor] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const allDone = data.directors.every((d) => d.aadhaarVerified);
    setProgress("kyc", allDone ? 1 : data.directors.filter(d => d.aadhaarVerified).length / Math.max(1, data.directors.length));
  }, [data.directors]);

  const sendOtp = (i: number) => {
    setOtpFor(i);
    toast.info("OTP sent to registered Aadhaar mobile");
  };

  const verifyOtp = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 700));
    const directors = data.directors.map((d, i) =>
      i === otpFor ? { ...d, aadhaarVerified: true } : d
    );
    setData({
      directors,
      verifications: { ...data.verifications, aadhaar: directors.every(d => d.aadhaarVerified) ? "verified" : "pending" },
    });
    setVerifying(false);
    setOtpFor(null);
    setOtp("");
    toast.success("Director verified via Aadhaar eKYC");
  };

  return (
    <SectionWrapper
      title="Know Your Customer"
      description="Verify directors and beneficial owners via Aadhaar eKYC and CKYC."
      prev="/onboarding/surepass/kyb"
      next="/onboarding/surepass/documents"
    >
      <Card className="p-5 surface-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-sm flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-primary" />
              Directors & Beneficial Owners
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fetched from MCA. Trigger Aadhaar OTP-based eKYC to verify each individual.
            </p>
          </div>
          <VerificationBadge state={data.verifications.aadhaar} label={`Aadhaar eKYC ${data.verifications.aadhaar === "verified" ? "complete" : "pending"}`} />
        </div>

        <div className="space-y-2">
          {data.directors.map((d, i) => (
            <div key={i} className="rounded-lg border bg-muted/20 p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                {d.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{d.pan}</p>
              </div>
              {d.aadhaarVerified ? (
                <VerificationBadge state="verified" label="eKYC verified" />
              ) : otpFor === i ? (
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-32 font-mono"
                  />
                  <Button size="sm" onClick={verifyOtp} disabled={otp.length !== 6 || verifying}>
                    {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify"}
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => sendOtp(i)}>
                  <Smartphone className="mr-1.5 h-3.5 w-3.5" />
                  Send Aadhaar OTP
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-info/30 bg-info/5 p-3 flex gap-2 text-xs">
          <ShieldCheck className="h-4 w-4 text-info shrink-0 mt-0.5" />
          <p>Consent is captured per individual as required by UIDAI. Aadhaar numbers are never stored.</p>
        </div>
      </Card>
    </SectionWrapper>
  );
}
