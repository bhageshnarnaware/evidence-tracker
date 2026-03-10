import { useDataStore } from '@/contexts/DataStoreContext';

const actionColors: Record<string, string> = {
  CREATE: 'status-sealed',
  UPDATE: 'status-analysis',
  TRANSFER: 'status-transit',
  ACQUISITION: 'status-returned',
  UPLOAD: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  DELETE: 'bg-destructive/10 text-destructive border border-destructive/30',
};

const AuditLogsPage = () => {
  const { auditLogs } = useDataStore();
  const sorted = [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Immutable system activity log ({sorted.length} entries)</p>
      </div>

      <div className="card-forensic overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((log) => (
              <tr key={log.log_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-xs font-medium">{log.user_name}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${actionColors[log.action] || ''}`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs">{log.entity_type}</td>
                <td className="py-3 px-4 font-mono text-xs text-primary">{log.entity_id}</td>
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No audit logs yet.</p>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
