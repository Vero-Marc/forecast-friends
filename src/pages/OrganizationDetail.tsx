import { useMemo, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { organizations } from "@/data/mockData";
import {
  ArrowLeft, Mail, Phone, MapPin, FileText, Download, Eye, ShieldCheck,
  PauseCircle, XCircle, CheckCircle2, AlertTriangle, Lock, Plus, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";

type VA = { id: string; alias: string; accountNumber: string; ifsc: string; bank: string; active: boolean };

const seedVAs: VA[] = [
  { id: "VA-7821", alias: "Primary collections", accountNumber: "XXXX 4421 9912", ifsc: "PINTUS33", bank: "Pinnacle Trust", active: true },
  { id: "VA-7822", alias: "Subscriptions", accountNumber: "XXXX 4421 9913", ifsc: "PINTUS33", bank: "Pinnacle Trust", active: true },
  { id: "VA-7823", alias: "Refund pool", accountNumber: "XXXX 4421 9914", ifsc: "PINTUS33", bank: "Pinnacle Trust", active: false },
];

export default function OrganizationDetail() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const org = useMemo(() => organizations.find((o) => o.id === id) ?? organizations[0], [id]);
  const isMerchant = org.category === "Merchant";

  const initialActivated = params.get("activated") === "1" || ["Approved", "Active"].includes(org.status);
  const [activated, setActivated] = useState(initialActivated);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [vas, setVAs] = useState<VA[]>(seedVAs);

  const displayStatus = activated ? "Active" : org.status;

  const confirmActivate = () => {
    setActivated(true);
    setConfirmOpen(false);
    const next = new URLSearchParams(params);
    next.set("activated", "1");
    setParams(next, { replace: true });
    toast.success(`${org.name} activated`);
  };

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0 gap-4">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className="text-sm font-medium text-right">{v}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/organizations"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="h-12 w-12 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center font-semibold shadow-glow">
            {org.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold leading-tight">{org.name}</h1>
              <StatusBadge status={displayStatus} />
              {activated && (
                <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Activated
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {org.id} · {org.category} · {org.businessType}
            </p>
          </div>
        </div>

        {activated && (
          <div className="flex items-center gap-2">
            <Button variant="outline">Edit</Button>
            <Button className="gradient-primary text-primary-foreground">Manage access</Button>
          </div>
        )}
      </div>

      {/* Quick contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="surface-card"><CardContent className="p-4 flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /><div className="min-w-0"><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium truncate">{org.email}</p></div></CardContent></Card>
        <Card className="surface-card"><CardContent className="p-4 flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{org.phone}</p></div></CardContent></Card>
        <Card className="surface-card"><CardContent className="p-4 flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Country</p><p className="text-sm font-medium">{org.country}</p></div></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kyb">KYB</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {isMerchant && <TabsTrigger value="configuration">Configuration</TabsTrigger>}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="surface-card lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Organization details</CardTitle></CardHeader>
              <CardContent>
                <Row k="Legal name" v={org.name} />
                <Row k="Organization ID" v={org.id} />
                <Row k="Category" v={org.category} />
                <Row k="Industry" v={org.businessType} />
                <Row k="Country" v={org.country} />
                <Row k="Assigned admin" v={org.assignedAdmin} />
                <Row k="Created on" v={org.createdOn} />
                <Row k="Last updated" v={org.lastUpdated} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="surface-card">
                <CardHeader><CardTitle className="text-base">Onboarding summary</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "KYB completed", done: true },
                    { label: "Banking verified", done: true },
                    { label: "Documents uploaded", done: true },
                    { label: "Compliance reviewed", done: activated },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={c.done ? "h-4 w-4 text-success" : "h-4 w-4 text-muted-foreground/40"} />
                      <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="surface-card">
                <CardHeader><CardTitle className="text-base">Primary contact</CardTitle></CardHeader>
                <CardContent>
                  <Row k="Name" v={org.assignedAdmin} />
                  <Row k="Email" v={org.email} />
                  <Row k="Phone" v={org.phone} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* KYB */}
        <TabsContent value="kyb" className="mt-4">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Business verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Row k="Legal company name" v={org.name} />
              <Row k="Registration number" v="REG-099821" />
              <Row k="Incorporation date" v="14 Mar 2018" />
              <Row k="Registered address" v="221B Market Street, San Francisco, CA 94107" />
              <Row k="Verification date" v="12 May 2026" />
              <Row k="KYB provider status" v={<StatusBadge status={org.kybStatus} />} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="surface-card">
              <CardHeader><CardTitle className="text-base">Admin contact</CardTitle></CardHeader>
              <CardContent>
                <Row k="Name" v={org.assignedAdmin} />
                <Row k="Role" v="Compliance Admin" />
                <Row k="Email" v={org.email} />
                <Row k="Phone" v={org.phone} />
                <Row k="Timezone" v="America/Los_Angeles (UTC-7)" />
              </CardContent>
            </Card>
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
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Uploaded documents</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "Certificate of Incorporation.pdf", type: "Incorporation", date: "12 May 2026", status: "Approved" },
                  { name: "Tax Registration.pdf", type: "Tax", date: "12 May 2026", status: "Approved" },
                  { name: "Director ID.png", type: "ID Proof", date: "13 May 2026", status: "In Review" },
                  { name: "Bank Statement.pdf", type: "Bank Proof", date: "14 May 2026", status: "Approved" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors">
                    <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.type} · Uploaded {f.date}</p>
                    </div>
                    <StatusBadge status={f.status as any} />
                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {!isMerchant && !activated && (
            <Card className="surface-card border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Ready to activate</p>
                    <p className="text-xs text-muted-foreground">All required documents verified for this {org.category.toLowerCase()}.</p>
                  </div>
                </div>
                <Button onClick={() => setConfirmOpen(true)} className="gradient-primary text-primary-foreground">
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Activate Organization
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Configuration (Merchant only) */}
        {isMerchant && (
          <TabsContent value="configuration" className="mt-4">
            <Tabs defaultValue="payins">
              <TabsList>
                <TabsTrigger value="payins">Payins</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
              </TabsList>

              {(["payins", "payouts"] as const).map((mode) => (
                <TabsContent key={mode} value={mode} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="surface-card">
                      <CardHeader><CardTitle className="text-base">Transaction limits</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5"><Label>Min amount (USD)</Label><Input defaultValue="1" /></div>
                          <div className="space-y-1.5"><Label>Max amount (USD)</Label><Input defaultValue="25000" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5"><Label>Daily limit</Label><Input defaultValue="250000" /></div>
                          <div className="space-y-1.5"><Label>Monthly limit</Label><Input defaultValue="5000000" /></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="surface-card">
                      <CardHeader><CardTitle className="text-base">Payment methods</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {(mode === "payins"
                          ? ["Cards", "UPI", "Net Banking", "Wallets"]
                          : ["Bank transfer", "UPI payout", "IMPS", "RTGS"]
                        ).map((m) => (
                          <div key={m} className="flex items-center justify-between rounded-md border bg-card px-3 py-2.5">
                            <span className="text-sm font-medium">{m}</span>
                            <Switch defaultChecked />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="surface-card lg:col-span-2">
                      <CardHeader><CardTitle className="text-base">Commission setup</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label>Pricing model</Label>
                            <Select defaultValue="flat">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flat">Flat fee</SelectItem>
                                <SelectItem value="percent">Percentage</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5"><Label>Rate (%)</Label><Input defaultValue="1.8" /></div>
                          <div className="space-y-1.5"><Label>Fixed fee (USD)</Label><Input defaultValue="0.30" /></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* VA Management */}
                  <Card className="surface-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base">Virtual account management</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Create and manage VAs for this organization.</p>
                      </div>
                      {activated && (
                        <Button
                          asChild
                          className="gradient-primary text-primary-foreground"
                        >
                          <Link to={`/organizations/${org.id}/va/new`}>
                            <Plus className="mr-1.5 h-4 w-4" /> Create VA
                          </Link>
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="p-0">
                      {!activated ? (
                        <div className="m-4 rounded-lg border-2 border-dashed bg-muted/40 p-8 text-center">
                          <div className="h-11 w-11 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-medium">Virtual accounts are locked</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Activate organization to manage virtual accounts.
                          </p>
                          <Button
                            onClick={() => setConfirmOpen(true)}
                            className="mt-4 gradient-primary text-primary-foreground"
                            size="sm"
                          >
                            <ShieldCheck className="mr-1.5 h-4 w-4" /> Activate Organization
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border-t">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead>VA ID</TableHead>
                                <TableHead>Alias</TableHead>
                                <TableHead>Account number</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {vas.map((va) => (
                                <TableRow key={va.id} className="hover:bg-muted/40">
                                  <TableCell className="font-mono text-xs">{va.id}</TableCell>
                                  <TableCell className="text-sm font-medium">{va.alias}</TableCell>
                                  <TableCell className="text-sm">{va.accountNumber}</TableCell>
                                  <TableCell className="text-sm">{va.bank}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={va.active}
                                        onCheckedChange={(v) =>
                                          setVAs((s) => s.map((x) => (x.id === va.id ? { ...x, active: v } : x)))
                                        }
                                      />
                                      <span className={`text-xs font-medium ${va.active ? "text-success" : "text-muted-foreground"}`}>
                                        {va.active ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                      <Link to={`/organizations/${org.id}/va/${va.id}`}><Pencil className="h-4 w-4" /></Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setVAs((s) => s.filter((x) => x.id !== va.id));
                                        toast.success("Virtual account deleted");
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {vas.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                                    No virtual accounts yet.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        )}
      </Tabs>

      {/* Activation confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Activate organization
            </DialogTitle>
            <DialogDescription>
              You're about to activate <span className="font-medium text-foreground">{org.name}</span>.
              This will unlock production access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 rounded-lg border bg-muted/40 p-3">
            {[
              { label: "KYB verification completed", ok: true },
              { label: "Documents verified", ok: true },
              { label: "Banking details confirmed", ok: true },
              { label: "Compliance checklist signed-off", ok: true },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${c.ok ? "text-success" : "text-muted-foreground/40"}`} />
                <span>{c.label}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 text-xs text-warning border-t pt-2.5 mt-1">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Activation cannot be undone via this dialog. Use the suspend action to pause access later.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={confirmActivate}>
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Confirm activation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold */}
      <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Put organization on hold</DialogTitle>
            <DialogDescription>{org.name} will be paused pending review.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea value={holdReason} onChange={(e) => setHoldReason(e.target.value)} placeholder="Add internal note…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setHoldOpen(false)}>Cancel</Button>
            <Button onClick={() => { setHoldOpen(false); toast.success("Organization placed on hold"); }}>
              Confirm hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject organization</DialogTitle>
            <DialogDescription>This will close the onboarding for {org.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Share rejection reason with the requester…" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { setRejectOpen(false); toast.success("Organization rejected"); navigate("/organizations"); }}
            >
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
