import {ArrowDownRight, ArrowUpRight} from 'lucide-react';
import {Card, CardContent} from '../ui/card';

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
}

export function KpiCard({label, value, delta}: Readonly<KpiCardProps>) {
  const up = delta >= 0;

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className={`flex items-center text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-600'}`}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
