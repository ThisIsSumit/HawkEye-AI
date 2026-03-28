import {Alert} from '../../types/index';
import {SeverityBadge, StatusBadge} from '../ui/badge';
import {Button} from '../ui/button';
import {Table, TableContainer, Td, Th} from '../ui/table';

interface AlertsTableProps {
  alerts: Alert[];
  onAssign: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

export function AlertsTable({alerts, onAssign, onResolve}: Readonly<AlertsTableProps>) {
  return (
    <TableContainer className="max-h-160 relative">
      <Table>
        <thead>
          <tr>
            <Th>ALERT_TS</Th>
            <Th>INCIDENT_DESC</Th>
            <Th>SOURCE_IP</Th>
            <Th>SEVERITY</Th>
            <Th>STATUS</Th>
            <Th>ASSIGNED_OP</Th>
            <Th className="text-right uppercase">Decomposition</Th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="group/row">
              <Td className="font-mono text-[11px] text-secondary">{new Date(alert.createdAt).toLocaleString()}</Td>
              <Td className="font-display font-medium text-white tracking-tight">{alert.title}</Td>
              <Td className="font-mono text-[11px] text-accent font-bold">{alert.sourceIp}</Td>
              <Td>
                <SeverityBadge severity={alert.severity} />
              </Td>
              <Td>
                <StatusBadge className="font-mono text-[9px] uppercase tracking-widest bg-void/50 border-white/5">{alert.status}</StatusBadge>
              </Td>
              <Td className="font-mono text-[10px] text-secondary italic uppercase">{alert.analyst ?? 'NULL_OP'}</Td>
              <Td>
                <div className="flex justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
                  <Button size="sm" variant="secondary" className="h-7 text-[10px] font-mono px-4" onClick={() => onAssign(alert.id)}>
                    ASSIGN_SEC
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] font-mono px-4 border-white/10" onClick={() => onResolve(alert.id)}>
                    RESOLVE_X
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
