import {useMemo, useState} from 'react';
import {Card, CardContent, CardHeader} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {EmptyState} from '../components/ui/empty-state';
import {Input} from '../components/ui/input';
import {User, Shield, Mail, BadgeCheck} from 'lucide-react';

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
    <div className="space-y-10 pb-20">
      <div className="float-entry" style={{ '--i': 1 } as any}>
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 rounded-lg bg-void/50 border border-white/10 text-accent font-mono font-bold text-xs shadow-l1">
              OPS_ID
           </div>
           <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.3em]">Identity_Matrix // Bio_Sync</p>
        </div>
        <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase leading-none italic">
          Analyst_Dossier
        </h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 float-entry" style={{ '--i': 2 } as any}>
        <div className="lg:col-span-1">
          <Card className="bg-surface/30 h-full">
            <CardContent className="pt-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-void border border-white/10 flex items-center justify-center text-accent shadow-l2 overflow-hidden group">
                  <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-3xl font-display font-black italic relative z-10">AR</span>
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-accent text-void shadow-l1">
                   <BadgeCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight">Alex Rivera</h3>
              <p className="text-[10px] font-mono text-secondary uppercase tracking-widest mt-1">Senior_Security_Analyst</p>
              
              <div className="w-full border-t border-white/5 mt-8 pt-8 space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[9px] font-mono text-secondary uppercase">Access_Lvl</span>
                    <span className="text-[10px] font-mono text-accent">L0_ADMIN</span>
                 </div>
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[9px] font-mono text-secondary uppercase">Up_Time</span>
                    <span className="text-[10px] font-mono text-white">402_HRS</span>
                 </div>
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[9px] font-mono text-secondary uppercase">Status</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                       <span className="text-[10px] font-mono text-white">ACTIVE</span>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface/30">
            <CardHeader title="Field Parameters" subtitle="Core identity variables and communication routing" />
            <CardContent className="grid gap-6 grid-cols-1 md:grid-cols-2 pt-2">
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">First_Name</p>
                <Input className="bg-void/50 border-white/5 font-mono text-[11px]" defaultValue="Alex" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Last_Name</p>
                <Input className="bg-void/50 border-white/5 font-mono text-[11px]" defaultValue="Rivera" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Ciph_Mail</p>
                <Input className="bg-void/50 border-white/5 font-mono text-[11px]" defaultValue="alex.rivera@hawkeye.ai" />
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest px-1">Ops_Designation</p>
                <Input className="bg-void/50 border-white/5 font-mono text-[11px]" defaultValue="Senior Security Analyst" />
              </div>
              <div className="md:col-span-2 flex justify-end pt-4">
                <Button className="font-mono text-[10px] px-8 shadow-l2">UPDATE_DOSSIER</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface/30">
            <CardHeader title="Response Protocols" subtitle="Define triggered redistribution sequences" />
            <CardContent className="space-y-6 pt-2">
                <div className="flex items-center gap-3">
                  <Input
                    className="bg-void/50 border-white/5 font-mono text-[10px]"
                    placeholder="QUERY_PREFERENCE..."
                    value={preferenceSearch}
                    onChange={(event) => setPreferenceSearch(event.target.value)}
                  />
                  <Button variant="secondary" className="font-mono text-[10px] px-6" onClick={() => setPreferenceSearch('')}>
                    HALT
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {filteredPreferences.map((preference) => (
                    <label key={preference.id} className="group flex items-center justify-between rounded-xl border border-white/5 bg-void/30 p-4 transition-all hover:bg-void/50">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-accent opacity-30 group-hover:opacity-100 transition-opacity" />
                         <span className="text-[11px] font-mono font-medium text-white tracking-tight uppercase">{preference.label}</span>
                      </div>
                      <input type="checkbox" defaultChecked={preference.defaultChecked} className="h-4 w-4 accent-accent bg-void border-white/10 rounded cursor-pointer" />
                    </label>
                  ))}
                </div>

                {filteredPreferences.length === 0 && (
                  <EmptyState
                    title="Query_Return_Null"
                    description="No preference nodes match the current filter sequence."
                  />
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
