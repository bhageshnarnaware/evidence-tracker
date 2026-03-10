import { useState } from 'react';
import { useDataStore } from '@/contexts/DataStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Shield, Plus, Download, FileJson, FileSpreadsheet, Eye, Edit2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Evidence, Device as DeviceType, Case } from '@/types';
import { exportToCSV, exportToJSON, formatEvidenceForExport } from '@/utils/exportUtils';

const statusClassMap: Record<string, string> = {
  Sealed: 'status-sealed',
  'In Transit': 'status-transit',
  'Under Analysis': 'status-analysis',
  'In Storage': 'status-returned',
  Returned: 'status-returned',
};

const deviceTypeIcons: Record<string, string> = {
  Phone: '📱',
  Laptop: '💻',
  HDD: '💾',
  USB: '💿',
  Tablet: '📱',
  Other: '🔧',
};

interface EnrichedEvidence {
  evidence_id: string;
  device_id: string;
  evidence_tag: string;
  current_status: Evidence['current_status'];
  current_custodian: string;
  storage_location: string;
  locker_number: string;
  seal_number: string;
  created_at: string;
  device?: DeviceType;
  caseInfo?: Case;
}

const EvidencePage = () => {
  const { evidence, devices, cases, custodyLogs, addEvidence, updateEvidence, deleteEvidence, addAuditLog } = useDataStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseFilter, setCaseFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [status, setStatus] = useState<Evidence['current_status']>('Sealed');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EnrichedEvidence | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const enriched: EnrichedEvidence[] = evidence.map((ev) => {
    const device = devices.find((d) => d.device_id === ev.device_id);
    const caseInfo = device ? cases.find((c) => c.case_id === device.case_id) : undefined;
    return {
      ...ev,
      device,
      caseInfo,
    };
  });

  const filtered = enriched.filter((ev) => {
    const matchesSearch =
      ev.evidence_tag.toLowerCase().includes(search.toLowerCase()) ||
      ev.current_custodian.toLowerCase().includes(search.toLowerCase()) ||
      ev.device?.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
      ev.device?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      ev.device?.model?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ev.current_status === statusFilter;
    const matchesCase = caseFilter === 'all' || ev.device?.case_id === caseFilter;
    return matchesSearch && matchesStatus && matchesCase;
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const seq = String(evidence.length + 1).padStart(3, '0');
    const newEv: Evidence = {
      evidence_id: `e${Date.now()}`,
      device_id: deviceId,
      evidence_tag: `EVD-${new Date().getFullYear()}-${seq}`,
      current_status: status,
      current_custodian: fd.get('custodian') as string,
      storage_location: fd.get('storage_location') as string,
      locker_number: fd.get('locker_number') as string,
      seal_number: `SEAL-${Math.floor(Math.random() * 9000 + 1000)}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    addEvidence(newEv);
    addAuditLog({
      log_id: `al${Date.now()}`,
      user_id: user?.id || '',
      user_name: user?.name || '',
      action: 'CREATE',
      entity_type: 'Evidence',
      entity_id: newEv.evidence_id,
      timestamp: new Date().toISOString(),
      ip_address: '10.0.1.1',
    });
    setDialogOpen(false);
    setDeviceId('');
  };

  const handleStatusChange = (evidenceId: string, newStatus: Evidence['current_status']) => {
    updateEvidence(evidenceId, { current_status: newStatus });
    addAuditLog({
      log_id: `al${Date.now()}`,
      user_id: user?.id || '',
      user_name: user?.name || '',
      action: 'UPDATE',
      entity_type: 'Evidence',
      entity_id: evidenceId,
      timestamp: new Date().toISOString(),
      ip_address: '10.0.1.1',
    });
  };

  const handleDelete = (evidenceId: string) => {
    if (confirm('Are you sure you want to delete this evidence?')) {
      deleteEvidence(evidenceId);
      addAuditLog({
        log_id: `al${Date.now()}`,
        user_id: user?.id || '',
        user_name: user?.name || '',
        action: 'DELETE',
        entity_type: 'Evidence',
        entity_id: evidenceId,
        timestamp: new Date().toISOString(),
        ip_address: '10.0.1.1',
      });
    }
  };

  const handleExportCSV = () => {
    const exportData = formatEvidenceForExport(evidence, devices, cases);
    exportToCSV(exportData, `evidence_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportJSON = () => {
    const exportData = formatEvidenceForExport(evidence, devices, cases);
    exportToJSON(exportData, `evidence_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleViewDetails = (ev: EnrichedEvidence) => {
    setSelectedEvidence(ev);
    setViewDialogOpen(true);
  };

  const getCustodyLogsForEvidence = (evidenceId: string) => {
    return custodyLogs
      .filter(log => log.evidence_id === evidenceId)
      .sort((a, b) => new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evidence Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage all evidence items</p>
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
              <Button><Plus className="w-4 h-4 mr-2" />Log Evidence</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Log New Evidence</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Device</Label>
                  <Select value={deviceId} onValueChange={setDeviceId} required>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select device" /></SelectTrigger>
                    <SelectContent>
                      {devices.map(d => (
                        <SelectItem key={d.device_id} value={d.device_id}>{d.brand} {d.model} ({d.serial_number})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Initial Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Evidence['current_status'])}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Sealed', 'In Transit', 'Under Analysis', 'In Storage', 'Returned'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Custodian</Label><Input name="custodian" defaultValue={user?.name} required className="mt-1" /></div>
                <div><Label>Storage Location</Label><Input name="storage_location" required className="mt-1" /></div>
                <div><Label>Locker Number</Label><Input name="locker_number" required className="mt-1" /></div>
                <Button type="submit" className="w-full" disabled={!deviceId}>Log Evidence</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by tag, custodian, serial, brand..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Sealed">Sealed</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Under Analysis">Under Analysis</SelectItem>
            <SelectItem value="In Storage">In Storage</SelectItem>
            <SelectItem value="Returned">Returned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by case" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cases</SelectItem>
            {cases.map(c => (
              <SelectItem key={c.case_id} value={c.case_id}>{c.case_id} - {c.case_title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-r-none"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-l-none"
          >
            <Shield className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="card-forensic overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Device</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Evidence Tag</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Case</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Custodian</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Location</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Seal #</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Created</th>
                <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.evidence_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{deviceTypeIcons[ev.device?.device_type || 'Other']}</span>
                      <div>
                        <p className="font-medium text-xs">{ev.device ? `${ev.device.brand} ${ev.device.model}` : 'Unknown'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{ev.device?.serial_number || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-semibold text-primary">{ev.evidence_tag}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono">{ev.caseInfo?.case_id || ev.device?.case_id || '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Select value={ev.current_status} onValueChange={(v) => handleStatusChange(ev.evidence_id, v as Evidence['current_status'])}>
                      <SelectTrigger className={`text-[10px] font-medium h-7 w-auto border-0 ${statusClassMap[ev.current_status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Sealed', 'In Transit', 'Under Analysis', 'In Storage', 'Returned'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4 text-xs">{ev.current_custodian}</td>
                  <td className="py-3 px-4 text-xs">{ev.storage_location}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px]">{ev.seal_number}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{ev.created_at}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(ev)} 
                        className="text-muted-foreground hover:text-primary transition-colors" 
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(ev.evidence_id)} 
                          className="text-muted-foreground hover:text-red-400 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No evidence found.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev) => (
            <div key={ev.evidence_id} className="card-forensic space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xl">{deviceTypeIcons[ev.device?.device_type || 'Other']}</span>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-primary">{ev.evidence_tag}</p>
                    <p className="text-xs text-muted-foreground">
                      {ev.device ? `${ev.device.brand} ${ev.device.model}` : 'Unknown Device'}
                    </p>
                  </div>
                </div>
                <Select value={ev.current_status} onValueChange={(v) => handleStatusChange(ev.evidence_id, v as Evidence['current_status'])}>
                  <SelectTrigger className={`text-[10px] font-medium h-7 w-auto border-0 ${statusClassMap[ev.current_status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Sealed', 'In Transit', 'Under Analysis', 'In Storage', 'Returned'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Custodian</p>
                  <p className="font-medium mt-0.5">{ev.current_custodian}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium mt-0.5">{ev.storage_location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Locker</p>
                  <p className="font-mono mt-0.5">{ev.locker_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seal Number</p>
                  <p className="font-mono mt-0.5">{ev.seal_number}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center text-xs text-muted-foreground">
                <span>Created: {ev.created_at}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewDetails(ev)} 
                    className="text-muted-foreground hover:text-primary transition-colors" 
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(ev.evidence_id)} 
                      className="text-muted-foreground hover:text-red-400 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-3 text-center text-muted-foreground text-sm py-8">No evidence found.</p>
          )}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evidence Details</DialogTitle>
          </DialogHeader>
          {selectedEvidence && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="device" className="flex-1">Device Info</TabsTrigger>
                <TabsTrigger value="custody" className="flex-1">Chain of Custody</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Evidence Tag</Label>
                    <p className="font-mono font-semibold text-primary">{selectedEvidence.evidence_tag}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className={statusClassMap[selectedEvidence.current_status]}>{selectedEvidence.current_status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Current Custodian</Label>
                    <p className="font-medium">{selectedEvidence.current_custodian}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Storage Location</Label>
                    <p className="font-medium">{selectedEvidence.storage_location}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Locker Number</Label>
                    <p className="font-mono">{selectedEvidence.locker_number}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Seal Number</Label>
                    <p className="font-mono">{selectedEvidence.seal_number}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Case ID</Label>
                    <p className="font-mono">{selectedEvidence.device?.case_id || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="font-medium">{selectedEvidence.created_at}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="device" className="space-y-4 mt-4">
                {selectedEvidence.device ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Device Type</Label>
                      <p className="font-medium flex items-center gap-2">
                        <span>{deviceTypeIcons[selectedEvidence.device.device_type]}</span>
                        {selectedEvidence.device.device_type}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Brand & Model</Label>
                      <p className="font-medium">{selectedEvidence.device.brand} {selectedEvidence.device.model}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Serial Number</Label>
                      <p className="font-mono">{selectedEvidence.device.serial_number}</p>
                    </div>
                    {selectedEvidence.device.imei && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">IMEI</Label>
                        <p className="font-mono">{selectedEvidence.device.imei}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Storage Capacity</Label>
                      <p className="font-medium">{selectedEvidence.device.storage_capacity}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Color</Label>
                      <p className="font-medium">{selectedEvidence.device.color}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-muted-foreground">Seizure Location</Label>
                      <p className="font-medium">{selectedEvidence.device.seizure_location}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Seizure Date</Label>
                      <p className="font-medium">{selectedEvidence.device.seizure_date}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Seizing Officer</Label>
                      <p className="font-medium">{selectedEvidence.device.seizing_officer}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-muted-foreground">Condition Notes</Label>
                      <p className="font-medium">{selectedEvidence.device.condition_notes}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No device information available</p>
                )}
              </TabsContent>

              <TabsContent value="custody" className="space-y-4 mt-4">
                {getCustodyLogsForEvidence(selectedEvidence.evidence_id).length > 0 ? (
                  <div className="space-y-3">
                    {getCustodyLogsForEvidence(selectedEvidence.evidence_id).map((log) => (
                      <div key={log.log_id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-primary">{log.evidence_id}</span>
                          <span className="text-xs text-muted-foreground">{new Date(log.transfer_date).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{log.transferred_from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{log.transferred_to}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{log.transfer_reason}</p>
                        {log.remarks && (
                          <p className="text-xs text-muted-foreground italic">"{log.remarks}"</p>
                        )}
                        <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded">{log.digital_signature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No custody logs found</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EvidencePage;

