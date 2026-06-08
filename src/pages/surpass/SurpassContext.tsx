import { createContext, useContext, useState, ReactNode } from "react";
import type { VerificationState } from "@/components/onboarding/VerificationBadge";

export type SectionKey =
  | "lookup"
  | "business"
  | "kyb"
  | "kyc"
  | "documents"
  | "bank"
  | "integration"
  | "review";

export interface SurpassData {
  pan: string;
  legalName: string;
  tradeName: string;
  cin: string;
  gst: string;
  ckyc: string;
  businessType: string;
  incorporationDate: string;
  regAddress: string;
  opsAddress: string;
  directors: { name: string; pan: string; aadhaarVerified: boolean }[];
  bank: { account: string; ifsc: string; type: string; pennyDrop: VerificationState };
  webhook: string;
  apiKey: string;
  verifications: {
    pan: VerificationState;
    gst: VerificationState;
    mca: VerificationState;
    aadhaar: VerificationState;
    ckyc: VerificationState;
    pennyDrop: VerificationState;
  };
  progress: Record<SectionKey, number>;
}

const defaults: SurpassData = {
  pan: "",
  legalName: "",
  tradeName: "",
  cin: "",
  gst: "",
  ckyc: "",
  businessType: "",
  incorporationDate: "",
  regAddress: "",
  opsAddress: "",
  directors: [],
  bank: { account: "", ifsc: "", type: "Current", pennyDrop: "not_found" },
  webhook: "",
  apiKey: "sk_live_••••••••••••3201",
  verifications: {
    pan: "not_found",
    gst: "not_found",
    mca: "not_found",
    aadhaar: "not_found",
    ckyc: "not_found",
    pennyDrop: "not_found",
  },
  progress: {
    lookup: 0, business: 0, kyb: 0, kyc: 0,
    documents: 0, bank: 0, integration: 0, review: 0,
  },
};

interface Ctx {
  data: SurpassData;
  setData: (d: Partial<SurpassData>) => void;
  setProgress: (k: SectionKey, value: number) => void;
}

const SurpassCtx = createContext<Ctx | null>(null);

export function SurpassProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<SurpassData>(defaults);
  const setData = (d: Partial<SurpassData>) =>
    setDataState((p) => ({ ...p, ...d }));
  const setProgress = (k: SectionKey, value: number) =>
    setDataState((p) => ({ ...p, progress: { ...p.progress, [k]: value } }));
  return (
    <SurpassCtx.Provider value={{ data, setData, setProgress }}>
      {children}
    </SurpassCtx.Provider>
  );
}

export function useSurpass() {
  const ctx = useContext(SurpassCtx);
  if (!ctx) throw new Error("useSurpass must be used within SurpassProvider");
  return ctx;
}
