import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquareWarning, CheckCircle2, Loader2, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const profileStatusData = [
  { status: "Active", count: 312 },
  { status: "On Hold", count: 42 },
  { status: "Inactive", count: 87 },
];

const onboardingStatusData = [
  { name: "In Progress", value: 64 },
  { name: "In Review", value: 38 },
  { name: "Remarked", value: 21 },
  { name: "Approved", value: 248 },
];

const DONUT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];


export default function Dashboard() {
  const recent = organizations.slice(0, 6);
  const totalOnboarding = onboardingStatusData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Sarah</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's how your onboarding pipeline is performing this month.
          </p>
        </div>
        <Button asChild className="gradient-primary text-primary-foreground shadow-soft">
          <Link to="/onboarding/create">
            New Organization <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="In Review"
          value={38}
          trend={6.1}
          subtitle="awaiting compliance review"
          tint="info"
        />
        <StatCard
          icon={MessageSquareWarning}
          label="Remarked"
          value={21}
          trend={-3.4}
          subtitle="requires applicant action"
          tint="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={248}
          trend={12.4}
          subtitle="vs. previous quarter"
          tint="success"
        />
        <StatCard
          icon={Loader2}
          label="In Progress"
          value={64}
          trend={8.2}
          subtitle="across all categories"
          tint="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="surface-card lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Organization profile status</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution by current profile state</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-2)" }} /> Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-3)" }} /> On Hold
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-5)" }} /> Inactive
                </span>
              </div>

            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profileStatusData} barGap={6}>
                  <defs>
                    <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.55} />
                    </linearGradient>
                    <linearGradient id="barHold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.55} />
                    </linearGradient>
                    <linearGradient id="barInactive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={64}>
                    {profileStatusData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.status === "Active"
                            ? "url(#barActive)"
                            : entry.status === "On Hold"
                            ? "url(#barHold)"
                            : "url(#barInactive)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding status</CardTitle>
            <p className="text-xs text-muted-foreground">Pipeline breakdown by stage</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={onboardingStatusData}
                    innerRadius={68}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {onboardingStatusData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                    }}
                    formatter={(v: number, n) => [`${v} (${((v / totalOnboarding) * 100).toFixed(1)}%)`, n]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                <p className="text-2xl font-semibold">{totalOnboarding}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-base">Recent onboarding activity</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Latest organizations entering your pipeline</p>
          </div>
          <div className="relative max-w-xs hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 h-9 bg-muted/60 border-transparent" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/50">
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((o) => (
                  <TableRow key={o.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {o.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-medium">{o.name}</p>
                          <p className="text-xs text-muted-foreground">{o.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{o.businessType}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.createdOn}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/organizations/${o.id}`}>View details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>Showing 1–{recent.length} of {organizations.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7">Previous</Button>
              <Button variant="outline" size="sm" className="h-7">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
