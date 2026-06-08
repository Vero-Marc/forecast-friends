import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSurpass } from "./SurpassContext";
import { VerificationBadge } from "@/components/onboarding/VerificationBadge";
import { FieldShimmer } from "@/components/onboarding/FieldShimmer";
import {
  Search, Sparkles, Building2, Calendar, Users, ArrowRight, Wand2,
  ShieldCheck, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function SurpassEntry() {
  const { data, setData, setProgress } = useSurpass();
  const [pan, setPan] = useState(data.pan);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(data.legalName !== "");
  const navigate = useNavigate();

  const validPan = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());

  const runLookup = async () => {
    setLoading(true);
    setFetched(false);
    // Stage verifications progressively
    setData({
      pan: pan.toUpperCase(),
      verifications: {
        ...data.verifications,
        pan: "pending", mca: "pending", gst: "pending",
      },
    });
    await new Promise((r) => setTimeout(r, 900));
    setData({
      legalName: "Nimbus Cloud Technologies Pvt Ltd",
      tradeName: "Nimbus Cloud",
      cin: "U72200KA2018PTC112233",
      gst: "29ABCDE1234F1Z5",
      ckyc: "60012345678901",
      businessType: "Private Limited",
      incorporationDate: "2018-04-12",
      regAddress: "4th Floor, Prestige Tower, MG Road, Bengaluru 560001",
      opsAddress: "4th Floor, Prestige Tower, MG Road, Bengaluru 560001",
      directors: [
        { name: "Arjun Mehta", pan: "ABCPM1234K", aadhaarVerified: false },
        { name: "Sneha Iyer", pan: "ABCSI5678L", aadhaarVerified: false },
      ],
      verifications: {
        pan: "verified",
        mca: "verified",
        gst: "verified",
        aadhaar: "not_found",
        ckyc: "verified",
        pennyDrop: "not_found",
      },
    });
    setProgress("lookup", 1);
    setProgress("business", 0.4);
    setProgress("kyb", 0.8);
    setLoading(false);
    setFetched(true);
    toast.success("Organization data fetched");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          Automated lookup
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Find the organization</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Enter the Business PAN. We'll fetch verified data from MCA, GSTN, and CKYC
          in seconds, then prefill the entire onboarding flow.
        </p>
      </div>

      <Card className="p-6 surface-elevated">
        <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="pan">Business PAN</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="pan"
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="pl-9 h-11 uppercase tracking-wider font-mono"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              10-character alphanumeric PAN. We'll auto-trigger verification.
            </p>
          </div>
          <Button
            disabled={!validPan || loading}
            onClick={runLookup}
            className="h-11 gradient-primary text-primary-foreground shadow-glow"
          >
            {loading ? (
              <><RefreshCw className="mr-1.5 h-4 w-4 animate-spin" /> Fetching…</>
            ) : (
              <><Wand2 className="mr-1.5 h-4 w-4" /> Fetch organization</>
            )}
          </Button>
        </div>
      </Card>

      {(loading || fetched) && (
        <Card className="p-6 surface-elevated relative overflow-hidden animate-fade-in">
          <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <FieldShimmer className="w-64 h-6" />
                ) : (
                  <h2 className="text-lg font-semibold">{data.legalName}</h2>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  PAN <span className="font-mono">{pan || "—"}</span> · {data.businessType || "—"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              <VerificationBadge state={data.verifications.pan} label={`PAN ${labelFor(data.verifications.pan)}`} />
              <VerificationBadge state={data.verifications.gst} label={`GST ${labelFor(data.verifications.gst)}`} />
              <VerificationBadge state={data.verifications.mca} label={`MCA ${labelFor(data.verifications.mca)}`} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <SummaryItem
              icon={Building2}
              label="CIN"
              value={loading ? null : data.cin}
            />
            <SummaryItem
              icon={Calendar}
              label="Incorporated"
              value={loading ? null : new Date(data.incorporationDate).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            />
            <SummaryItem
              icon={Users}
              label="Directors"
              value={loading ? null : `${data.directors.length} on record`}
            />
          </div>

          {fetched && (
            <div className="flex items-center justify-between mt-6 pt-5 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Data fetched & verified via third-party APIs.
              </p>
              <Button
                onClick={() => navigate("/onboarding/surpass/business-details")}
                className="gradient-primary text-primary-foreground shadow-glow"
              >
                Confirm & Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function labelFor(s: string) {
  if (s === "verified") return "Active";
  if (s === "pending") return "Checking";
  if (s === "failed") return "Failed";
  return "—";
}

function SummaryItem({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5">
        {value === null ? <FieldShimmer className="h-5 w-full" /> : (
          <p className="text-sm font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
