import {FormEvent, useState} from 'react';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {Shield} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import {useAuth} from '../hooks/use-auth';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {isAuthenticated, isLoading, login} = useAuth();

  const [email, setEmail] = useState('admin@hawkeye.ai');
  const [password, setPassword] = useState('AdminPass!123');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      const nextPath = (location.state as {from?: {pathname?: string}} | undefined)?.from?.pathname ?? '/dashboard';
      navigate(nextPath, {replace: true});
    } catch (loginError) {
      console.error('[auth:login]', loginError);
      setError(loginError instanceof Error ? loginError.message : 'Unable to login. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <CardTitle>Sign in to HawkEye</CardTitle>
          <p className="text-sm text-slate-500">Use your SOC account credentials to continue.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" required />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
