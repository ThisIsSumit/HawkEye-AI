import {ArrowDownRight, ArrowUpRight} from 'lucide-react';
import {Card, CardContent} from '../ui/card';
import {cn} from '../../utils';

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
}

export function KpiCard({label, value, delta}: Readonly<KpiCardProps>) {
  const up = delta >= 0;
  const prefix = label.slice(0, 3).toUpperCase();

  return (
    <Card className="relative overflow-hidden group shadow-l2 ring-1 ring-white/10 hover:-translate-y-1 transition-all duration-500">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-accent tracking-[0.2em]">{prefix} //</span>
            <span className="text-[11px] font-display font-medium text-secondary uppercase tracking-wider">{label}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold",
            up ? "text-success bg-success/10" : "text-danger bg-danger/10"
          )}>
             {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </div>
        </div>

        <div className="relative mb-6">
          <h2 className="text-4xl font-display font-bold text-white tracking-tighter leading-none">
            {value}
          </h2>
        </div>

        {/* INSTRUMENT SPARKLINE */}
        <div className="h-12 w-full mb-4 overflow-hidden relative">
           <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
             <path 
               d="M0 35 Q 25 30, 40 20 T 70 15 T 100 5" 
               fill="none" 
               stroke={up ? "var(--success)" : "var(--danger)"} 
               strokeWidth="1.5"
               strokeOpacity="0.8"
               className="drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
             />
             <path 
               d="M0 35 Q 25 30, 40 20 T 70 15 T 100 5 V 40 H 0 Z" 
               fill={`url(#gradient-${prefix})`} 
               opacity="0.1"
             />
             <defs>
               <linearGradient id={`gradient-${prefix}`} x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor={up ? "var(--success)" : "var(--danger)"} />
                 <stop offset="100%" stopColor="transparent" />
               </linearGradient>
             </defs>
           </svg>
        </div>

        {/* PROGRESS BAR GAUGE */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-mono text-text-tertiary">
             <span>0%</span>
             <span>100%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden ring-1 ring-white/5">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", up ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]")} 
              style={{ width: `${Math.min(75, 50 + delta * 2)}%` }}
            />
          </div>
        </div>
      </CardContent>
      
      {/* CORNER DECORATION */}
      <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
        <div className="w-4 h-4 border-t border-r border-accent/40 rounded-tr" />
      </div>
    </Card>
  );
}
