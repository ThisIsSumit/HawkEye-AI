import {useMemo, useState} from 'react';
import {Card, CardContent, CardHeader} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {useAuth} from '../hooks/use-auth';
import {getAccessTokenStorageKey} from '../lib/auth';
import {ShieldCheck, Key, Lock, Fingerprint, Activity} from 'lucide-react';
import {StatusBadge} from '../components/ui/badge';

const securityActivity = [
  {
    id: 'ACT-3001',
    action: 'Password changed',
    actor: 'alex.rivera@hawkeye.ai',
    time: '2026-03-20T09:15:00.000Z',
    status: 'success',
  },
  {
    id: 'ACT-3002',
    action: 'MFA reconfigured',
    actor: 'alex.rivera@hawkeye.ai',
    time: '2026-03-19T17:42:00.000Z',
    status: 'success',
  },
  {
    id: 'ACT-3003',
    action: 'Failed sign-in challenge',
    actor: 'unknown-device',
    time: '2026-03-18T22:11:00.000Z',
    status: 'failed',
  },
] as const;

export function Account() {
  const {user, token, logout} = useAuth();
  const [activitySearch, setActivitySearch] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  const filteredActivity = useMemo(() => {
    const normalizedSearch = activitySearch.trim().toLowerCase();

    return securityActivity.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [item.id, item.action, item.actor]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus = activityStatusFilter === 'all' || item.status === activityStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activitySearch, activityStatusFilter]);

  return (
    <div className="space-y-10 pb-20">
      <div className="float-entry" style={{ '--i': 1 } as any}>
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 rounded-lg bg-void/50 border border-white/10 text-accent font-mono font-bold text-xs shadow-l1">
              SEC_CTR
           </div>
           <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.3em]">Access_Control // Security_Vault</p>
        </div>
        <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
          Account_Security
        </h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 float-entry" style={{ '--i': 2 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Session Signature" subtitle="Active cryptographic handshake and authorization state" />
          <CardContent className="space-y-6 pt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-void/50 border border-white/5 space-y-1">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest">Handler_Name</p>
                <p className="text-sm font-display font-bold text-white tracking-tight">{user?.name ?? '-'}</p>
              </div>
              <div className="p-4 rounded-xl bg-void/50 border border-white/5 space-y-1">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest">Authorized_Role</p>
                <p className="text-sm font-display font-bold text-accent tracking-tight uppercase italic">{user?.role ?? '-'}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-void/50 border border-white/5 space-y-2">
              <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest">Registry_Key</p>
              <div className="font-mono text-[10px] text-white/50 bg-black/20 p-2 rounded border border-white/5 break-all">
                {getAccessTokenStorageKey()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-void/50 border border-white/5 space-y-2">
              <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest">Token_Fragment</p>
              <div className="font-mono text-[10px] text-accent/70 bg-black/20 p-2 rounded border border-white/5 break-all">
                {token ? `${token.slice(0, 24)}...${token.slice(-12)}` : 'NULL_PTR'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" className="font-mono text-[10px] h-11 px-8 shadow-l1" onClick={logout}>
                TERMINATE_SESSION
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-surface/30">
            <CardHeader title="Cipher Rotation" subtitle="Modify existing biometric access sequences" />
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-3">
                <Input type="password" placeholder="CURRENT_CIPHER..." className="bg-void/50 border-white/5 font-mono text-[11px]" />
                <Input type="password" placeholder="NEW_CIPHER..." className="bg-void/50 border-white/5 font-mono text-[11px]" />
                <Input type="password" placeholder="CONFIRM_UPGRADE..." className="bg-void/50 border-white/5 font-mono text-[11px]" />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="font-mono text-[10px] h-11 px-8 shadow-l2">DEPLOY_CIPHER</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/30">
            <CardHeader title="Multi-Factor Auth" subtitle="Hardware-level secondary validation protocols" />
            <CardContent className="space-y-6 pt-2">
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex items-center gap-4">
                 <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Fingerprint className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[11px] font-mono font-bold text-white uppercase">MFA_ACTIVE</p>
                    <p className="text-[10px] font-mono text-secondary mt-0.5">Physical authenticator link established.</p>
                 </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 font-mono text-[10px] h-11 shadow-l1">RECFG_MFA</Button>
                <Button variant="danger" className="flex-1 font-mono text-[10px] h-11 shadow-l1">PURGE_MFA</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="float-entry" style={{ '--i': 3 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Sentinel Activity" subtitle="Historical audit of account authorization events" />
          <CardContent className="space-y-6 pt-2">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="md:col-span-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1 mb-2">Audit_Query</p>
                <Input
                  placeholder="ID_ACTION_ACTOR..."
                  className="bg-void/50 border-white/5 font-mono text-[11px]"
                  value={activitySearch}
                  onChange={(event) => setActivitySearch(event.target.value)}
                />
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1 mb-2">Filter_Status</p>
                <Select value={activityStatusFilter} onValueChange={(value) => setActivityStatusFilter(value as typeof activityStatusFilter)}>
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[11px] uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="all">ALL_STATUS</SelectItem>
                    <SelectItem value="success">SUCCESS_ONLY</SelectItem>
                    <SelectItem value="failed">FAILED_ONLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-0.5">
                <Button
                  variant="secondary"
                  className="w-full font-mono text-[10px] h-10 px-6 shadow-l1"
                  onClick={() => {
                    setActivitySearch('');
                    setActivityStatusFilter('all');
                  }}
                >
                  HALT_FILTER
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {filteredActivity.map((activity) => (
                <div key={activity.id} className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-void/20 hover:bg-void/40 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg border border-white/5 ${activity.status === 'failed' ? 'text-danger bg-danger/10' : 'text-accent bg-accent/10'}`}>
                       <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-white tracking-tight uppercase">{activity.action}</h4>
                      <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mt-0.5">{activity.id} // {activity.actor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge className="bg-void/50 border-white/5 font-mono text-[9px] uppercase tracking-widest px-3 block mb-1">
                      {new Date(activity.time).toLocaleString()}
                    </StatusBadge>
                    <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${activity.status === 'failed' ? 'text-danger' : 'text-accent opacity-50'}`}>
                       [{activity.status}]
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredActivity.length === 0 && (
              <EmptyState
                title="Log_Return_Null"
                description="The Sentinel activity buffer returned no entries matching the current filter."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
