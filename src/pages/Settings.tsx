import {useMemo, useState} from 'react';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';

export function Settings() {
  const [sectionSearch, setSectionSearch] = useState('');

  const sectionVisibility = useMemo(() => {
    const normalizedSearch = sectionSearch.trim().toLowerCase();
    const matches = (title: string) => normalizedSearch.length === 0 || title.toLowerCase().includes(normalizedSearch);

    return {
      users: matches('User Management'),
      apiKeys: matches('API Keys'),
      thresholds: matches('Detection Thresholds'),
      integrations: matches('Notification Integrations'),
    };
  }, [sectionSearch]);

  const hasVisibleSection = Object.values(sectionVisibility).some(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Configure users, keys, thresholds, and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Settings Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Search section title (users, keys, thresholds, integrations)"
              value={sectionSearch}
              onChange={(event) => setSectionSearch(event.target.value)}
            />
            <Button variant="secondary" onClick={() => setSectionSearch('')}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {sectionVisibility.users && (
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
        )}

        {sectionVisibility.apiKeys && (
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
        )}

        {sectionVisibility.thresholds && (
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
        )}

        {sectionVisibility.integrations && (
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
        )}
      </div>

      {!hasVisibleSection && (
        <EmptyState
          title="No matching settings section"
          description="Try a broader section search or clear the current filter."
        />
      )}
    </div>
  );
}
