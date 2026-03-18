import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';

export function Profile() {
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
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <span>Notify me on critical alerts</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <span>Daily threat summary email</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
