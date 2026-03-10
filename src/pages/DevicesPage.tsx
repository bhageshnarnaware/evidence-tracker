import { useState } from 'react';
import { useDataStore } from '@/contexts/DataStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Trash2, FileJson, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Device } from '@/types';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';

const deviceTypeIcons: Record<string, string> = {
  Phone: '📱', Laptop: '💻', HDD: '💾', USB: '💿', Tablet: '📱', Other: '🔧',
};

const DevicesPage = () => {
  const { devices, cases, addDevice, deleteDevice, addAuditLog } = useDataStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [caseFilter, setCaseFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [caseId, setCaseId] = useState('');

  const filtered = devices.filter((d) => {
    const matchesSearch =
      d.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      d.brand.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase()) ||
      d.case_id.toLowerCase().includes(search.toLowerCase());
    const matchesCase = caseFilter === 'all' || d.case_id === caseFilter;
    return matchesSearch && matchesCase;
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newDevice: Device = {
      device_id: `d${Date.now()}`,
      case_id: caseId,
      device_type: fd.get('device_type') as Device['device_type'],
      brand: fd.get('brand') as string,
      model: fd.get('model') as string,
      serial_number: fd.get('serial_number') as string,
      imei: (fd.get('imei') as string) || undefined,
      storage_capacity: fd.get('storage_capacity') as string,
      color: fd.get('color') as string,
      seizure_location: fd.get('seizure_location') as string,
      seizure_date: fd.get('seizure_date') as string,
      seizing_officer: fd.get('seizing_officer') as string || user?.name || '',
      condition_notes: fd.get('condition_notes') as string,
    };
    addDevice(newDevice);
    addAuditLog({
      log_id: `al${Date.now()}`,
      user_id: user?.id || '',
      user_name: user?.name || '',
      action: 'CREATE',
      entity_type: 'Device',
      entity_id: newDevice.device_id,
      timestamp: new Date().toISOString(),
      ip_address: '10.0.1.1',
    });
    setDialogOpen(false);
    setCaseId('');
  };

  const handleDelete = (deviceId: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      deleteDevice(deviceId);
      addAuditLog({
        log_id: `al${Date.now()}`,
        user_id: user?.id || '',
        user_name: user?.name || '',
        action: 'DELETE',
        entity_type: 'Device',
        entity_id: deviceId,
        timestamp: new Date().toISOString(),
        ip_address: '10.0.1.1',
      });
    }
  };

  const handleExportCSV = () => {
    exportToCSV(devices as unknown as object[], `devices_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportJSON = () => {
    exportToJSON(devices as unknown as object[], `devices_report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Device Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">Register and manage seized digital devices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <FileJson className="w-4 h-4 mr-2" />Export JSON
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Register Device</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Register Seized Device</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <Label>Case</Label>
                  <Select value={caseId} onValueChange={setCaseId} required>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select case" /></SelectTrigger>
                    <SelectContent>
                      {cases.filter(c => c.case_status === 'Open').map(c => (
                        <SelectItem key={c.case_id} value={c.case_id}>{c.case_id} - {c.case_title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Device Type</Label>
                    <Select name="device_type" required>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        {['Phone', 'Laptop', 'HDD', 'USB', 'Tablet', 'Other'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Brand</Label><Input name="brand" required className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Model</Label><Input name="model" required className="mt-1" /></div>
                  <div><Label>Serial Number</Label><Input name="serial_number" required className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>IMEI (optional)</Label><Input name="imei" className="mt-1" /></div>
                  <div><Label>Storage Capacity</Label><Input name="storage_capacity" required className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Color</Label><Input name="color" required className="mt-1" /></div>
                  <div><Label>Seizure Date</Label><Input name="seizure_date" type="date" required className="mt-1" /></div>
                </div>
                <div><Label>Seizure Location</Label><Input name="seizure_location" required className="mt-1" /></div>
                <div><Label>Seizing Officer</Label><Input name="seizing_officer" defaultValue={user?.name} required className="mt-1" /></div>
                <div><Label>Condition Notes</Label><Textarea name="condition_notes" required className="mt-1" /></div>
                <Button type="submit" className="w-full" disabled={!caseId}>Register Device</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by serial, brand, model, or case ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by case" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cases</SelectItem>
            {cases.map(c => (
              <SelectItem key={c.case_id} value={c.case_id}>{c.case_id} - {c.case_title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <div key={d.device_id} className="card-forensic space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{deviceTypeIcons[d.device_type] || '🔧'}</span>
                <div>
                  <p className="font-semibold">{d.brand} {d.model}</p>
                  <p className="text-xs text-muted-foreground font-mono">{d.serial_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded">{d.case_id}</span>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(d.device_id)} className="text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Type:</span> {d.device_type}</div>
              <div><span className="text-muted-foreground">Storage:</span> {d.storage_capacity}</div>
              <div><span className="text-muted-foreground">Color:</span> {d.color}</div>
              <div><span className="text-muted-foreground">IMEI:</span> {d.imei || 'N/A'}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Location:</span> {d.seizure_location}</div>
              <div><span className="text-muted-foreground">Date:</span> {d.seizure_date}</div>
              <div><span className="text-muted-foreground">Officer:</span> {d.seizing_officer}</div>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-2">{d.condition_notes}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-muted-foreground text-sm py-8">No devices found.</p>
        )}
      </div>
    </div>
  );
};

export default DevicesPage;

