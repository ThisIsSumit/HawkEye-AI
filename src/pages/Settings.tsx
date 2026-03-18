import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Configure users, keys, thresholds, and integrations.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Invite analyst by email" />
            <div className="flex items-center gap-2">
              <Select defaultValue="analyst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button>Invite</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value="hk_live_xxxxxxxxxxxxxxx" readOnly />
            <div className="flex gap-2">
              <Button variant="secondary">Rotate Key</Button>
              <Button>Generate New</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detection Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-xs text-slate-500">Critical alert trigger count / 5 min</span>
              <Input type="number" defaultValue={15} />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="text-xs text-slate-500">Brute force lockout threshold</span>
              <Input type="number" defaultValue={7} />
            </label>
            <Button>Save Thresholds</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Slack webhook URL" />
            <Input placeholder="Microsoft Teams webhook URL" />
            <Input placeholder="PagerDuty integration key" />
            <Button>Save Integrations</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
