import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import { Download, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Onboarding() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const data = useMemo(
    () =>
      organizations
        .filter((o) => ["Pending", "In Review", "In Progress"].includes(o.status))
        .filter((o) => (status === "all" ? true : o.status === status))
        .filter((o) => (type === "all" ? true : o.businessType === type))
        .filter((o) => o.name.toLowerCase().includes(q.toLowerCase())),
    [q, status, type]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage organizations going through KYB and review.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="mr-1.5 h-4 w-4" /> Export</Button>
          <Button asChild className="gradient-primary text-primary-foreground shadow-glow">
            <Link to="/onboarding/start"><Plus className="mr-1.5 h-4 w-4" /> Add Organization</Link>
          </Button>
        </div>
      </div>

      <Card className="surface-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 pb-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search organizations…" className="pl-9 h-9 bg-muted/60 border-transparent" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Business type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Array.from(new Set(organizations.map((o) => o.businessType))).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto border-t">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/50">
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>KYB Status</TableHead>
                  <TableHead>Last updated</TableHead>
                  <TableHead>Assigned admin</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((o) => (
                  <TableRow key={o.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {o.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-medium">{o.name}</p>
                          <p className="text-xs text-muted-foreground">{o.businessType}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{o.category}</TableCell>
                    <TableCell><StatusBadge status={o.kybStatus} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.lastUpdated}</TableCell>
                    <TableCell className="text-sm">{o.assignedAdmin}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={o.status === "In Review" ? `/onboarding/review/${o.id}` : `/onboarding/${o.id}`}>
                          {o.status === "In Review" ? "Review" : "Open"}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">No matching organizations.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>Showing {data.length} of {organizations.filter(o=>["Pending","In Review","In Progress"].includes(o.status)).length}</span>
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
