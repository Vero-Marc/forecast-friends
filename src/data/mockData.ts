export type OrgStatus =
  | "Approved"
  | "Active"
  | "Inactive"
  | "On Hold"
  | "Rejected"
  | "Pending"
  | "In Review"
  | "In Progress";

export type BusinessType =
  | "E-commerce"
  | "SaaS"
  | "Financial Services"
  | "Healthcare"
  | "Retail"
  | "Marketplace"
  | "Education";

export type Category = "Merchant" | "Reseller" | "Partner";

export interface Organization {
  id: string;
  name: string;
  businessType: BusinessType;
  category: Category;
  status: OrgStatus;
  kybStatus: "Pending" | "In Review" | "In Progress" | "Approved";
  createdOn: string;
  lastUpdated: string;
  assignedAdmin: string;
  email: string;
  phone: string;
  country: string;
}

const admins = ["Sarah Chen", "Marcus Hill", "Priya Raman", "David Okonkwo", "Elena Vasquez"];
const types: BusinessType[] = ["E-commerce", "SaaS", "Financial Services", "Healthcare", "Retail", "Marketplace", "Education"];
const cats: Category[] = ["Merchant", "Reseller", "Partner"];
const orgStatuses: OrgStatus[] = ["Approved", "Active", "Inactive", "On Hold", "Rejected"];
const obStatuses: OrgStatus[] = ["Pending", "In Review", "In Progress"];
const kybStatuses: Organization["kybStatus"][] = ["Pending", "In Review", "In Progress", "Approved"];

const names = [
  "Northwind Capital", "Apex Logistics", "Lumen Health", "Vertex Robotics", "Pulse Payments",
  "Orbit Marketplace", "Stellar Foods", "Helix Analytics", "Mosaic Retail", "Quanta Finance",
  "Brightline SaaS", "Cobalt Group", "Drift Studios", "Forge Industries", "Nimbus Cloud",
  "Patriot Bank", "Sienna Wellness", "Voltaic Energy", "Westfield Holdings", "Zephyr Tech",
];

export const organizations: Organization[] = names.map((n, i) => ({
  id: `ORG-${1000 + i}`,
  name: n,
  businessType: types[i % types.length],
  category: cats[i % cats.length],
  status: i < 8 ? obStatuses[i % obStatuses.length] : orgStatuses[(i - 8) % orgStatuses.length],
  kybStatus: kybStatuses[i % kybStatuses.length],
  createdOn: new Date(2025, (i * 2) % 12, ((i * 5) % 27) + 1).toISOString().slice(0, 10),
  lastUpdated: new Date(2026, 4, ((i * 3) % 17) + 1).toISOString().slice(0, 10),
  assignedAdmin: admins[i % admins.length],
  email: `ops@${n.toLowerCase().replace(/\s+/g, "")}.com`,
  phone: `+1 415 555 0${100 + i}`,
  country: "United States",
}));

export const monthlySeries = [
  { month: "Jan", inProgress: 18, onHold: 6 },
  { month: "Feb", inProgress: 24, onHold: 9 },
  { month: "Mar", inProgress: 31, onHold: 7 },
  { month: "Apr", inProgress: 28, onHold: 11 },
  { month: "May", inProgress: 36, onHold: 8 },
  { month: "Jun", inProgress: 42, onHold: 14 },
  { month: "Jul", inProgress: 38, onHold: 10 },
  { month: "Aug", inProgress: 45, onHold: 12 },
  { month: "Sep", inProgress: 51, onHold: 9 },
  { month: "Oct", inProgress: 47, onHold: 13 },
  { month: "Nov", inProgress: 54, onHold: 11 },
  { month: "Dec", inProgress: 62, onHold: 15 },
];

export const stats = {
  approved: { value: 248, trend: 12.4, label: "Approved Organizations" },
  inProgress: { value: 64, trend: 8.2, label: "In Progress Organizations" },
  active: { value: 312, trend: 4.7, label: "Active Organizations" },
};

export const activeDistribution = [
  { name: "Active", value: 312 },
  { name: "Inactive", value: 87 },
];
