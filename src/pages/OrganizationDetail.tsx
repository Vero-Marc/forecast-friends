import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import { ArrowLeft, Mail, Phone, MapPin, FileText, Download, Plug } from "lucide-react";

export default function OrganizationDetail() {
  const { id } = useParams();
  const org = useMemo(() => organizations.find((o) => o.id === id) ?? organizations[0], [id]);

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className="text-sm font-medium">{v}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link to="/organizations"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div className="h-12 w-12 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center font-semibold">
            {org.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight">{org.name}</h1>
              <StatusBadge status={org.status} />
            </div>
            <p className="text-xs text-muted-foreground">{org.id} · {org.category} · {org.businessType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit</Button>
          <Button className="gradient-primary text-primary-foreground">Manage access</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="surface-card"><CardContent className="p-4 flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{org.email}</p></div></CardContent></Card>
        <Card className="surface-card"><CardContent className="p-4 flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{org.phone}</p></div></CardContent></Card>
        <Card className="surface-card"><CardContent className="p-4 flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Country</p><p className="text-sm font-medium">{org.country}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="kyb">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="kyb">KYB</TabsTrigger>
          <TabsTrigger value="bank">Bank details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="integration">Application integration</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="kyb" className="mt-4">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Business verification</CardTitle></CardHeader>
            <CardContent>
              <Row k="Legal name" v={org.name} />
              <Row k="Registration number" v="REG-099821" />
              <Row k="GST / Tax ID" v="22AAAAA0000A1Z5" />
              <Row k="Country" v={org.country} />
              <Row k="Address" v="221B Market Street, San Francisco, CA 94107" />
              <Row k="KYB status" v={org.kybStatus} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="mt-4">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Banking</CardTitle></CardHeader>
            <CardContent>
              <Row k="Account holder" v={org.name} />
              <Row k="Account number" v="•••• •••• 4421" />
              <Row k="Bank" v="Pinnacle Trust" />
              <Row k="Branch" v="San Francisco Downtown" />
              <Row k="Routing / IFSC" v="PINTUS33" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Certificate of Incorporation.pdf", status: "Approved" },
                { name: "Tax Registration.pdf", status: "Approved" },
                { name: "Director ID.png", status: "In Review" },
                { name: "Bank Statement.pdf", status: "Approved" },
              ].map((f) => (
                <div key={f.name} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30">
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                  <p className="text-sm font-medium flex-1 truncate">{f.name}</p>
                  <StatusBadge status={f.status as any} />
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="mt-4">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plug className="h-4 w-4 text-primary" /> Integration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Live API key</p>
                <code className="text-sm font-mono mt-1 block">sk_live_4f9a82••••••••••••3201</code>
              </div>
              <Row k="Webhook URL" v="https://api.acme.com/webhooks/fynnix" />
              <Row k="Last delivery" v="2 minutes ago · 200 OK" />
              <Row k="Environment" v="Production" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="mt-4">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
            <CardContent>
              <Row k="Service type" v="Card acquiring" />
              <Row k="Bank pipeline" v="Pinnacle Trust" />
              <Row k="Affiliate ID" v="AFF-00042" />
              <Row k="Settlement cycle" v="T+2" />
              <Row k="Risk tier" v="Standard" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
