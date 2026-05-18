import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { stats, monthlySeries, activeDistribution, organizations } from "@/data/mockData";
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
import { Search } from "lucide-react";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))"];

export default function Dashboard() {
  const recent = organizations.slice(0, 6);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle2}
          label={stats.approved.label}
          value={stats.approved.value}
          trend={stats.approved.trend}
          subtitle="vs. previous quarter"
          tint="success"
        />
        <StatCard
          icon={Clock}
          label={stats.inProgress.label}
          value={stats.inProgress.value}
          trend={stats.inProgress.trend}
          subtitle="across all categories"
          tint="info"
        />
        <StatCard
          icon={Building2}
          label={stats.active.label}
          value={stats.active.value}
          trend={stats.active.trend}
          subtitle="processing live transactions"
          tint="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="surface-card lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Onboarding pipeline</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">In progress vs on hold, monthly</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> In progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> On hold
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySeries} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
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
                  <Bar dataKey="inProgress" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="onHold" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Organization status</CardTitle>
            <p className="text-xs text-muted-foreground">Active vs inactive</p>
          </CardHeader>
          <CardContent>
            <div className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeDistribution}
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                  >
                    {activeDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
                <p className="text-2xl font-semibold">
                  {activeDistribution.reduce((a, b) => a + b.value, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total orgs</p>
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
