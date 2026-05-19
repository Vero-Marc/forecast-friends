import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { organizations } from "@/data/mockData";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function CreateVA() {
  const { id, vaId } = useParams();
  const navigate = useNavigate();
  const org = useMemo(() => organizations.find((o) => o.id === id) ?? organizations[0], [id]);
  const isEdit = !!vaId && vaId !== "new";

  const populated = isEdit
    ? {
        alias: "Primary collections",
        accountNumber: "44219912",
        ifsc: "PINTUS33",
        bank: "Pinnacle Trust",
        branch: "San Francisco Downtown",
        purpose: "Customer collections",
        currency: "USD",
        notes: "Default VA for inbound subscription payments.",
        active: true,
      }
    : {
        alias: "",
        accountNumber: "",
        ifsc: "",
        bank: "",
        branch: "",
        purpose: "",
        currency: "USD",
        notes: "",
        active: true,
      };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEdit ? "Virtual account updated" : "Virtual account created");
    navigate(`/organizations/${org.id}?activated=1`);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" asChild>
            <Link to={`/organizations/${org.id}?activated=1`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {isEdit ? "Update virtual account" : "Create virtual account"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {org.name} · {org.id} {isEdit && vaId ? `· ${vaId}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to={`/organizations/${org.id}?activated=1`}>Cancel</Link>
          </Button>
          <Button type="submit" className="gradient-primary text-primary-foreground">
            <ShieldCheck className="mr-1.5 h-4 w-4" /> {isEdit ? "Save changes" : "Create VA"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="surface-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">VA details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Alias</Label>
                <Input defaultValue={populated.alias} placeholder="e.g. Primary collections" required />
              </div>
              <div className="space-y-1.5">
                <Label>Purpose</Label>
                <Input defaultValue={populated.purpose} placeholder="Customer collections" />
              </div>
              <div className="space-y-1.5">
                <Label>Account number</Label>
                <Input defaultValue={populated.accountNumber} placeholder="44219912" required />
              </div>
              <div className="space-y-1.5">
                <Label>IFSC / Routing</Label>
                <Input defaultValue={populated.ifsc} placeholder="PINTUS33" required />
              </div>
              <div className="space-y-1.5">
                <Label>Bank</Label>
                <Input defaultValue={populated.bank} placeholder="Pinnacle Trust" required />
              </div>
              <div className="space-y-1.5">
                <Label>Branch</Label>
                <Input defaultValue={populated.branch} placeholder="SF Downtown" />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select defaultValue={populated.currency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Settlement cycle</Label>
                <Select defaultValue="t2">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t0">T+0</SelectItem>
                    <SelectItem value="t1">T+1</SelectItem>
                    <SelectItem value="t2">T+2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Notes</Label>
                <Textarea defaultValue={populated.notes} placeholder="Internal notes for this VA…" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Toggle to enable / disable this VA.</p>
                </div>
                <Switch defaultChecked={populated.active} />
              </div>
              <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Webhook notifications</p>
                  <p className="text-xs text-muted-foreground">Send events to organization webhook.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader><CardTitle className="text-base">Limits</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5"><Label>Min per txn</Label><Input defaultValue="1" /></div>
              <div className="space-y-1.5"><Label>Max per txn</Label><Input defaultValue="25000" /></div>
              <div className="space-y-1.5"><Label>Daily cap</Label><Input defaultValue="250000" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
