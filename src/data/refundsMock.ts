export type MerchantStatus = "Active" | "Inactive" | "Suspended";
export type RefundStatus = "Pending" | "Processing" | "Success" | "Failed" | "Reversed";

export interface VA {
  vaNo: string;
  label: string;
  bank: string;
  currency: string;
  balance: number;
  status: "Active" | "Inactive";
}

export interface Merchant {
  id: string;
  name: string;
  status: MerchantStatus;
  vas: VA[];
}

export interface Refund {
  refundId: string;
  paymentMethod: string;
  crn: string;
  refundedAmount: number;
  transactionAmount: number;
  status: RefundStatus;
  dateTime: string; // ISO
  reason: string;
  initiatedBy: string;
  txnId: string;
  currency: string;
  merchantRef: string;
  originalPaymentDate: string;
  gateway: string;
}

const banks = ["HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "SBI"];
const methods = ["UPI", "Card", "NetBanking", "Wallet"];

function rand<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const merchants: Merchant[] = Array.from({ length: 14 }).map((_, i) => {
  const id = `MID-${20100 + i}`;
  const names = [
    "Northwind Capital", "Apex Logistics", "Lumen Health", "Vertex Robotics",
    "Pulse Payments", "Orbit Marketplace", "Stellar Foods", "Helix Analytics",
    "Mosaic Retail", "Quanta Finance", "Brightline SaaS", "Cobalt Group",
    "Drift Studios", "Forge Industries",
  ];
  const statuses: MerchantStatus[] = ["Active", "Active", "Active", "Inactive", "Suspended"];
  const vaCount = 2 + (i % 3);
  const vas: VA[] = Array.from({ length: vaCount }).map((_, j) => ({
    vaNo: `VA${900000 + i * 10 + j}`,
    label: `${names[i]} - VA ${j + 1}`,
    bank: rand(banks, i + j),
    currency: "INR",
    balance: 50000 + ((i + 1) * (j + 1) * 7321) % 950000,
    status: j === 0 ? "Active" : (j % 2 === 0 ? "Active" : "Inactive"),
  }));
  return { id, name: names[i], status: rand(statuses, i), vas };
});

export function refundsForVA(vaNo: string): Refund[] {
  const seed = vaNo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const statuses: RefundStatus[] = ["Pending", "Processing", "Success", "Failed", "Reversed", "Success", "Success", "Pending"];
  return Array.from({ length: 24 }).map((_, i) => {
    const amount = 500 + ((seed + i * 137) % 25000);
    const txn = amount + ((seed + i) % 5000);
    const d = new Date(2026, 4, 1 + (i % 28), 8 + (i % 12), (i * 7) % 60);
    return {
      refundId: `RFD-${seed}${1000 + i}`,
      paymentMethod: rand(methods, i + seed),
      crn: `CRN${seed}${200000 + i}`,
      refundedAmount: amount,
      transactionAmount: txn,
      status: statuses[(i + seed) % statuses.length],
      dateTime: d.toISOString(),
      reason: rand(["Customer request", "Duplicate charge", "Product not delivered", "Quality issue"], i),
      initiatedBy: rand(["Admin User", "Merchant Portal", "Auto-Refund"], i),
      txnId: `TXN-${seed}${500000 + i}`,
      currency: "INR",
      merchantRef: `MREF-${seed}${i}`,
      originalPaymentDate: new Date(d.getTime() - 86400000 * (3 + (i % 10))).toISOString(),
      gateway: rand(["Razorpay", "PayU", "Cashfree", "CCAvenue"], i),
    };
  });
}

export function findMerchantByVA(vaNo: string): { merchant: Merchant; va: VA } | undefined {
  for (const m of merchants) {
    const va = m.vas.find((v) => v.vaNo === vaNo);
    if (va) return { merchant: m, va };
  }
  return undefined;
}

export function formatCurrency(n: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
