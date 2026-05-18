import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace and personal preferences.</p>
      </div>

      <Card className="surface-card">
        <CardHeader className="pb-3"><CardTitle className="text-base">Workspace</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Workspace name</Label><Input defaultValue="Fynnix Admin" /></div>
            <div className="space-y-1.5"><Label>Support email</Label><Input defaultValue="support@fynnix.io" /></div>
          </div>
          <Button className="gradient-primary text-primary-foreground">Save changes</Button>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader className="pb-3"><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { t: "KYB approvals", d: "Get notified when a KYB is approved." },
            { t: "Document uploads", d: "Notify when new documents are uploaded." },
            { t: "Weekly digest", d: "Summary every Monday morning." },
          ].map((n) => (
            <div key={n.t} className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">{n.t}</p><p className="text-xs text-muted-foreground">{n.d}</p></div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
