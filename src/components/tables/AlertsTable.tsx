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
    <TableContainer className="max-h-130 rounded-lg border border-slate-200">
      <Table className="table-sticky-header">
        <thead>
          <tr>
            <Th>Created</Th>
            <Th>Alert</Th>
            <Th>Source IP</Th>
            <Th>Severity</Th>
            <Th>Status</Th>
            <Th>Analyst</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="bg-white hover:bg-slate-50">
              <Td>{new Date(alert.createdAt).toLocaleString()}</Td>
              <Td>{alert.title}</Td>
              <Td className="font-mono text-xs">{alert.sourceIp}</Td>
              <Td>
                <SeverityBadge severity={alert.severity} />
              </Td>
              <Td>
                <StatusBadge className="capitalize">{alert.status}</StatusBadge>
              </Td>
              <Td>{alert.analyst ?? 'Unassigned'}</Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onAssign(alert.id)}>
                    Assign
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onResolve(alert.id)}>
                    Resolve
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
