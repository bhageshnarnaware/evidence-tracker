import { useDataStore } from '@/contexts/DataStoreContext';
import { Archive, Lock } from 'lucide-react';

const statusClassMap: Record<string, string> = {
  Sealed: 'status-sealed',
  'In Transit': 'status-transit',
  'Under Analysis': 'status-analysis',
  'In Storage': 'status-returned',
  Returned: 'status-returned',
};

const StoragePage = () => {
  const { evidence, devices } = useDataStore();

  const storageGroups = evidence.reduce((acc, ev) => {
    const loc = ev.storage_location || 'Unknown';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(ev);
    return acc;
  }, {} as Record<string, typeof evidence>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Storage Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Physical storage locations and inventory</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Evidence', value: evidence.length },
          { label: 'In Storage', value: evidence.filter(e => e.current_status === 'In Storage').length },
          { label: 'Sealed', value: evidence.filter(e => e.current_status === 'Sealed').length },
          { label: 'Storage Locations', value: Object.keys(storageGroups).length },
        ].map(stat => (
          <div key={stat.label} className="card-forensic text-center">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {Object.entries(storageGroups).map(([location, items]) => (
        <div key={location} className="card-forensic space-y-4">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">{location}</h2>
            <span className="text-xs text-muted-foreground ml-auto">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {items.map((ev) => {
              const device = devices.find(d => d.device_id === ev.device_id);
              return (
                <div key={ev.evidence_id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-primary">{ev.evidence_tag}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {device ? `${device.brand} ${device.model}` : 'Unknown Device'} · Locker {ev.locker_number}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusClassMap[ev.current_status]}`}>
                    {ev.current_status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {evidence.length === 0 && (
        <div className="card-forensic text-center py-12">
          <Archive className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No evidence in storage</p>
        </div>
      )}
    </div>
  );
};

export default StoragePage;
