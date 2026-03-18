import {ArrowUpDown} from 'lucide-react';
import {Threat} from '../../types/index';
import {Button} from '../ui/button';
import {SeverityBadge, StatusBadge} from '../ui/badge';
import {Table, TableContainer, Td, Th} from '../ui/table';

interface ThreatsTableProps {
  threats: Threat[];
  onSort: (field: keyof Threat) => void;
  onRowClick?: (threat: Threat) => void;
}

export function ThreatsTable({threats, onSort, onRowClick}: Readonly<ThreatsTableProps>) {
  return (
    <TableContainer className="max-h-115 rounded-lg border border-slate-200">
      <Table className="table-sticky-header">
        <thead>
          <tr>
            <Th>Timestamp</Th>
            <Th>Source IP</Th>
            <Th>
              <Button variant="outline" size="sm" className="h-auto border-0 p-0 text-xs" onClick={() => onSort('attackType')}>
                Attack Type
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </Th>
            <Th>Endpoint</Th>
            <Th>
              <Button variant="outline" size="sm" className="h-auto border-0 p-0 text-xs" onClick={() => onSort('severity')}>
                Severity
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {threats.map((threat) => (
            <tr
              key={threat.id}
              className="cursor-pointer bg-white hover:bg-slate-50"
              onClick={() => onRowClick?.(threat)}
            >
              <Td>{new Date(threat.timestamp).toLocaleString()}</Td>
              <Td className="font-mono text-xs">{threat.sourceIp}</Td>
              <Td>{threat.attackType}</Td>
              <Td>{threat.endpoint}</Td>
              <Td>
                <SeverityBadge severity={threat.severity} />
              </Td>
              <Td>
                <StatusBadge className="capitalize">{threat.status}</StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
