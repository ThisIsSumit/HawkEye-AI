import {useMemo, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';

export function Profile() {
  const [preferenceSearch, setPreferenceSearch] = useState('');

  const preferences = useMemo(
    () => [
      {id: 'critical-alerts', label: 'Notify me on critical alerts', defaultChecked: true},
      {id: 'daily-summary', label: 'Daily threat summary email', defaultChecked: true},
    ],
    [],
  );

  const filteredPreferences = useMemo(() => {
    const normalizedSearch = preferenceSearch.trim().toLowerCase();
    if (normalizedSearch.length === 0) {
      return preferences;
    }

    return preferences.filter((preference) => preference.label.toLowerCase().includes(normalizedSearch));
  }, [preferenceSearch, preferences]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Manage your analyst profile and response preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input defaultValue="Alex" placeholder="First name" />
          <Input defaultValue="Rivera" placeholder="Last name" />
          <Input defaultValue="alex.rivera@hawkeye.ai" placeholder="Email" />
          <Input defaultValue="Senior Security Analyst" placeholder="Role" />
          <div className="md:col-span-2 flex justify-end">
            <Button>Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Filter preference options"
                value={preferenceSearch}
                onChange={(event) => setPreferenceSearch(event.target.value)}
              />
              <Button variant="secondary" onClick={() => setPreferenceSearch('')}>
                Reset Filter
              </Button>
            </div>
            {filteredPreferences.map((preference) => (
              <label key={preference.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <span>{preference.label}</span>
                <input type="checkbox" defaultChecked={preference.defaultChecked} className="h-4 w-4" />
              </label>
            ))}
            {filteredPreferences.length === 0 && (
              <EmptyState
                title="No matching preference"
                description="No response preference matches the current filter."
              />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
