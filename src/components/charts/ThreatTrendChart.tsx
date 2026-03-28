import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {TimePoint} from '../../types/index';

export function ThreatTrendChart({data}: Readonly<{data: TimePoint[]}>) {
  return (
    <div className="h-full w-full font-mono">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
             <linearGradient id="gradient-threats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
             </linearGradient>
             <linearGradient id="gradient-blocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--blue-accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--blue-accent)" stopOpacity={0} />
             </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <XAxis 
            dataKey="time" 
            tick={{fontSize: 9, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            tick={{fontSize: 9, fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)'}} 
            axisLine={false} 
            tickLine={false}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface-modal)', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              boxShadow: 'var(--shadow-l3)',
              backdropFilter: 'blur(12px)'
            }}
            itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Line 
            type="monotone" 
            dataKey="threats" 
            stroke="var(--danger)" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--danger)' }}
            animationDuration={2000}
          />
          <Line 
            type="monotone" 
            dataKey="blocked" 
            stroke="var(--blue-accent)" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--blue-accent)' }}
            animationDuration={2000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
