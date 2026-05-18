import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Upload, FileText, Download, Search, Trash2 } from "lucide-react";

const files = [
  { name: "Certificate of Incorporation.pdf", org: "Northwind Capital", date: "May 12, 2026", status: "Approved", size: "1.2 MB" },
  { name: "Tax Registration.pdf", org: "Apex Logistics", date: "May 14, 2026", status: "In Review", size: "884 KB" },
  { name: "Director ID.png", org: "Lumen Health", date: "May 15, 2026", status: "Pending", size: "412 KB" },
  { name: "Bank Statement Q1.pdf", org: "Vertex Robotics", date: "May 16, 2026", status: "Approved", size: "2.4 MB" },
  { name: "MSA Signed.pdf", org: "Pulse Payments", date: "May 17, 2026", status: "Approved", size: "740 KB" },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">Central repository for all uploaded organization documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="surface-card lg:col-span-3">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 gap-3">
            <CardTitle className="text-base">All files</CardTitle>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search files…" className="pl-9 h-9 bg-muted/60 border-transparent" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {files.map((f) => (
              <div key={f.name} className="flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.org} · {f.size} · uploaded {f.date}</p>
                </div>
                <StatusBadge status={f.status as any} />
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Upload</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed bg-muted/30 p-10 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3"><Upload className="h-6 w-6"/></div>
              <p className="font-medium">Drag & drop files here</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB · multiple supported</p>
              <Button className="mt-4 gradient-primary text-primary-foreground">Browse files</Button>
              <p className="text-[11px] text-muted-foreground mt-3">Uploads are scanned automatically before they appear in the list.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
