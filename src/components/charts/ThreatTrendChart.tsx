import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {TimePoint} from '../../types/index';

export function ThreatTrendChart({data}: Readonly<{data: TimePoint[]}>) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="time" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
          <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="blocked" stroke="#2563EB" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
