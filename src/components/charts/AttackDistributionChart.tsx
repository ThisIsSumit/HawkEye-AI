import {Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {AttackDistributionPoint} from '../../types/index';
import {severityColor} from '../../lib/api';

const colorPalette = [
  severityColor('critical'),
  severityColor('high'),
  '#2563EB',
  '#0EA5E9',
  '#64748B',
];

type ChartSlice = AttackDistributionPoint & {fill: string};

export function AttackDistributionChart({data}: Readonly<{data: AttackDistributionPoint[]}>) {
  const chartData: ChartSlice[] = data.map((item, index) => ({
    ...item,
    fill: colorPalette[index % colorPalette.length],
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
