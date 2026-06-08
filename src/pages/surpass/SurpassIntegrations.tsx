import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SectionWrapper } from "./SectionWrapper";
import { useSurpass } from "./SurpassContext";
import { Plug, Copy, RefreshCw, Webhook } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SurpassIntegrations() {
  const { data, setData, setProgress } = useSurpass();
  useEffect(() => { setProgress("integration", data.webhook ? 1 : 0.4); }, [data.webhook]);

  return (
    <SectionWrapper
      title="Integration"
      description="Configure API access, webhook delivery, and settlement preferences."
      prev="/onboarding/surpass/bank-accounts"
      next="/onboarding/surpass/review"
    >
      <Card className="p-6 surface-card space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Plug className="h-3.5 w-3.5" /> Live API key
        </Label>
        <div className="flex gap-2">
          <code className="text-sm font-mono px-3 py-2 rounded-md bg-muted/50 border flex-1 truncate">
            {data.apiKey}
          </code>
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(data.apiKey); toast.success("Copied"); }}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5" /></Button>
        </div>
        <p className="text-xs text-muted-foreground">Rotate immediately if compromised. Older keys remain valid for 24 hours.</p>
      </Card>

      <Card className="p-6 surface-card space-y-3">
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Webhook className="h-3.5 w-3.5" /> Webhook URL
        </Label>
        <div className="flex gap-2">
          <Input
            value={data.webhook}
            onChange={(e) => setData({ webhook: e.target.value })}
            placeholder="https://api.acme.com/webhooks/fynnix"
          />
          <Button variant="outline">Test</Button>
        </div>
        <p className="text-xs text-muted-foreground">Signed POST requests delivered at-least-once with exponential backoff.</p>
      </Card>

      <Card className="p-6 surface-card space-y-3">
        <Label className="text-xs text-muted-foreground">Settlement preference</Label>
        <Select defaultValue="t+1">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="t+0">Same day (T+0)</SelectItem>
            <SelectItem value="t+1">Next day (T+1)</SelectItem>
            <SelectItem value="t+2">T+2 standard</SelectItem>
            <SelectItem value="weekly">Weekly batch</SelectItem>
          </SelectContent>
        </Select>
      </Card>
    </SectionWrapper>
  );
}
