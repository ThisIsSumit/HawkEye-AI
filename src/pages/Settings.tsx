import {useMemo, useState} from 'react';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader} from '../components/ui/card';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Cog, ShieldCheck, Key, Zap, Bell} from 'lucide-react';

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
    <div className="space-y-10 pb-20">
      <div className="float-entry" style={{ '--i': 1 } as any}>
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 rounded-lg bg-void/50 border border-white/10 text-accent font-mono font-bold text-xs shadow-l1">
              SYS_CFG
           </div>
           <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.3em]">Environment_Variables // Global_Control</p>
        </div>
        <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
          System_Configurations
        </h1>
      </div>

      <div className="float-entry" style={{ '--i': 2 } as any}>
        <Card className="bg-surface/30">
          <CardHeader title="Registry Query" subtitle="Filter configuration nodes for surgical modification" />
          <CardContent>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <div className="relative group">
                <Input
                  className="bg-void/50 border-white/5 font-mono text-[10px] h-12"
                  placeholder="SEARCH_SECTION_ID (users, keys, thresholds, integrations)..."
                  value={sectionSearch}
                  onChange={(event) => setSectionSearch(event.target.value)}
                />
              </div>
              <Button variant="secondary" className="h-12 font-mono text-[10px]" onClick={() => setSectionSearch('')}>
                HALT_FILTER
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 float-entry" style={{ '--i': 3 } as any}>
        {sectionVisibility.users && (
        <Card className="hover:bg-surface/40 transition-colors duration-500">
          <CardHeader title="User Management" subtitle="Manage operator access levels and authorization tokens" />
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2">
               <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Invite_Handle</p>
               <Input className="bg-void/50 border-white/5 font-mono text-[11px]" placeholder="OPERATOR@HAWKEYE.AI" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1 mb-2">Access_Level</p>
                <Select defaultValue="analyst">
                  <SelectTrigger className="bg-void/50 border-white/5 font-mono text-[10px] uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-modal border-white/5">
                    <SelectItem value="admin">ADMIN_LVL_0</SelectItem>
                    <SelectItem value="analyst">ANALYST_LVL_1</SelectItem>
                    <SelectItem value="viewer">VIEWER_LVL_2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="mt-6 h-10 px-8 text-[10px] font-mono shadow-l1">DEPLOY_INVITE</Button>
            </div>
          </CardContent>
        </Card>
        )}

        {sectionVisibility.apiKeys && (
        <Card className="hover:bg-surface/40 transition-colors duration-500">
          <CardHeader title="API Credentials" subtitle="Machine-to-machine authentication signatures" />
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2">
               <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Active_Token</p>
               <Input className="bg-void/50 border-white/5 font-mono text-[11px]" value="hk_live_xxxxxxxxxxxxxxx" readOnly />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 text-[10px] font-mono">ROTATE_CIPHER</Button>
              <Button className="flex-1 text-[10px] font-mono shadow-l1">GEN_NEW_SIGNATURE</Button>
            </div>
          </CardContent>
        </Card>
        )}

        {sectionVisibility.thresholds && (
        <Card className="hover:bg-surface/40 transition-colors duration-500">
          <CardHeader title="Detection Parameters" subtitle="Configure automated threat decomposition triggers" />
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1 italic">Trigger_Floor // 5_MIN_WINDOW</p>
                <Input className="bg-void/50 border-white/5 font-mono text-[11px]" type="number" defaultValue={15} />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1 italic">Lockout_Threshold // BRUTE_FORCE</p>
                <Input className="bg-void/50 border-white/5 font-mono text-[11px]" type="number" defaultValue={7} />
              </div>
            </div>
            <Button className="w-full text-[10px] font-mono shadow-l2">COMMIT_THRESHOLDS</Button>
          </CardContent>
        </Card>
        )}

        {sectionVisibility.integrations && (
        <Card className="hover:bg-surface/40 transition-colors duration-500">
          <CardHeader title="External Up-links" subtitle="Configure multi-channel notification webhooks" />
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-3">
              <Input className="bg-void/50 border-white/5 font-mono text-[10px]" placeholder="SLACK_WEBHOOK_URL..." />
              <Input className="bg-void/50 border-white/5 font-mono text-[10px]" placeholder="TEAMS_CHANNEL_URL..." />
              <Input className="bg-void/50 border-white/5 font-mono text-[10px]" placeholder="PAGERDUTY_API_INT..." />
            </div>
            <Button className="w-full text-[10px] font-mono shadow-l2">SYNC_GATEWAYS</Button>
          </CardContent>
        </Card>
        )}
      </div>

      {!hasVisibleSection && (
        <EmptyState
          title="Section_Not_Found"
          description="The configuration registry returned null for the current path."
        />
      )}
    </div>
  );
}
