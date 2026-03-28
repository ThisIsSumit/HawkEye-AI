import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/use-auth';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      const nextPath = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ?? '/dashboard';
      navigate(nextPath, { replace: true });
    } catch (loginError) {
      console.error('[auth:login]', loginError);
      setError(loginError instanceof Error ? loginError.message : 'Unable to login. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic background elements for Login */}
      <div className="absolute inset-0 bg-void z-[-1]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-danger/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-md float-entry shadow-l3 border-white/5 bg-surface/40 backdrop-blur-xl">
        <CardHeader title="MISSION_AUTH" subtitle="Sector-7 access required. Deploy credentials.">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-void border border-white/10 text-accent shadow-l2 relative group overflow-hidden">
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield className="h-6 w-6 relative z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-[0.2em] px-1">Operator_ID</p>
              <Input
                className="bg-void/50 border-white/5 font-mono text-xs h-10 lowercase"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="admin@hawkeye.ai"
                required
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-[0.2em] px-1">Access_Cipher</p>
              <Input
                className="bg-void/50 border-white/5 font-mono text-xs h-10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="••••••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-danger animate-pulse" />
                <p className="text-[9px] font-mono text-danger uppercase tracking-tight">{error}</p>
              </div>
            )}

            <Button className="w-full h-11 text-xs font-mono tracking-[0.2em] uppercase shadow-l2 mt-2" type="submit" disabled={isLoading}>
              {isLoading ? 'DECODING...' : 'INITIATE_UP_LINK'}
            </Button>

            <div className="flex items-center justify-center border-t border-white/5 pt-6 mt-6">
              <p className="text-[9px] font-mono text-secondary uppercase tracking-[0.2em]">Encrypted Handshake Protocol v2.4.0</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
