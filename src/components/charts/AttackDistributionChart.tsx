import {Pie, PieChart, ResponsiveContainer, Tooltip, Cell} from 'recharts';
import {AttackDistributionPoint} from '../../types/index';

const colorPalette = [
  '#EF4444', // critical
  '#F59E0B', // high
  '#2563EB', // accent
  '#0EA5E9', 
  '#64748B', 
];

export function AttackDistributionChart({data}: Readonly<{data: AttackDistributionPoint[]}>) {
  return (
    <div className="h-full w-full font-mono">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name"
            innerRadius={65} 
            outerRadius={90} 
            paddingAngle={5}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colorPalette[index % colorPalette.length]} 
                fillOpacity={0.8}
              />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
