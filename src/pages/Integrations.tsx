import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, Send, Plug } from "lucide-react";
import { toast } from "sonner";

export default function Integrations() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure API access, webhooks, and connected systems.</p>
      </div>

      <Card className="surface-card">
        <CardHeader className="pb-3"><CardTitle className="text-base">API keys</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Live secret key", value: "sk_live_4f9a82••••••••••••3201", env: "Production" },
            { label: "Test secret key", value: "sk_test_8b21f0••••••••••••7755", env: "Sandbox" },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{k.label}</p>
                  <p className="text-xs text-muted-foreground">{k.env}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => toast.success("Copied")}><Copy className="h-3.5 w-3.5 mr-1" />Copy</Button>
                  <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1" />Rotate</Button>
                </div>
              </div>
              <code className="block mt-3 text-sm font-mono px-2 py-1.5 rounded bg-background border">{k.value}</code>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Plug className="h-4 w-4 text-primary" /> Webhook</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Endpoint URL</Label>
            <div className="flex gap-2">
              <Input defaultValue="https://api.acme.com/webhooks/fynnix" />
              <Button variant="outline"><Send className="h-3.5 w-3.5 mr-1.5" />Test webhook</Button>
            </div>
            <p className="text-xs text-muted-foreground">Events delivered as signed POST requests.</p>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Signature verification</p>
              <p className="text-xs text-muted-foreground">Reject requests without a valid signature.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Retry failed deliveries</p>
              <p className="text-xs text-muted-foreground">Retry up to 5 times with exponential backoff.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
