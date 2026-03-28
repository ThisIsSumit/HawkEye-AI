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
    <TableContainer className="max-h-160 relative">
      <Table>
        <thead>
          <tr>
            <Th>TIMESTAMP</Th>
            <Th>SOURCE_IP</Th>
            <Th>
               <button className="flex items-center gap-2 group/btn" onClick={() => onSort('attackType')}>
                ATTACK_VECTOR
                <ArrowUpDown className="h-3 w-3 opacity-30 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            </Th>
            <Th>TARGET_ENDPOINT</Th>
            <Th>
              <button className="flex items-center gap-2 group/btn" onClick={() => onSort('severity')}>
                SEVERITY_LVL
                <ArrowUpDown className="h-3 w-3 opacity-30 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            </Th>
            <Th>SESSION_ST</Th>
          </tr>
        </thead>
        <tbody>
          {threats.map((threat) => (
            <tr
              key={threat.id}
              className="cursor-pointer group/row"
              onClick={() => onRowClick?.(threat)}
            >
              <Td className="font-mono text-[11px] text-secondary">{new Date(threat.timestamp).toLocaleString()}</Td>
              <Td className="font-mono text-[11px] text-accent font-bold tracking-tight">{threat.sourceIp}</Td>
              <Td className="font-mono text-[11px] text-white uppercase">{threat.attackType}</Td>
              <Td className="font-mono text-[10px] text-secondary italic">{threat.endpoint}</Td>
              <Td>
                <SeverityBadge severity={threat.severity} />
              </Td>
              <Td>
                <StatusBadge className="font-mono text-[9px] uppercase tracking-widest bg-void/50 border-white/5">{threat.status}</StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
