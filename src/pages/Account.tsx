import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';

export function Account() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Account</h1>
        <p className="text-sm text-slate-500">Security settings for your HawkEye AI account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="password" placeholder="Current password" />
          <Input type="password" placeholder="New password" />
          <Input type="password" placeholder="Confirm new password" />
          <div className="flex justify-end">
            <Button>Update Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">MFA status: Enabled via authenticator app.</p>
          <div className="flex gap-2">
            <Button variant="secondary">Reconfigure MFA</Button>
            <Button variant="danger">Disable MFA</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
