import { useState } from 'react';
import { useDataStore } from '@/contexts/DataStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, Trash2, Edit2, FileJson, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Case } from '@/types';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';

const statusClassMap: Record<string, string> = {
  Open: 'status-analysis',
  Closed: 'status-sealed',
  Archived: 'status-returned',
};

const CasesPage = () => {
  const { cases, addCase, updateCase, deleteCase, addAuditLog } = useDataStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCase, setEditCase] = useState<Case | null>(null);

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.case_title.toLowerCase().includes(search.toLowerCase()) ||
      c.case_id.toLowerCase().includes(search.toLowerCase()) ||
      c.lead_investigator.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.case_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateCaseId = (): string => {
    const year = new Date().getFullYear();
    const nextNum = cases.length + 1;
    return `CASE-${String(nextNum).padStart(3, '0')}`;
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newCase: Case = {
      case_id: generateCaseId(),
      case_title: fd.get('title') as string,
      case_description: fd.get('description') as string,
      lead_investigator: fd.get('investigator') as string,
      department: fd.get('department') as string,
      case_status: 'Open',
      created_at: new Date().toISOString().split('T')[0],
      device_count: 0,
    };
    addCase(newCase);
    addAuditLog({
      log_id: `al${Date.now()}`,
      user_id: user?.id || '',
      user_name: user?.name || '',
      action: 'CREATE',
      entity_type: 'Case',
      entity_id: newCase.case_id,
      timestamp: new Date().toISOString(),
      ip_address: '10.0.1.1',
    });
    setDialogOpen(false);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCase) return;
    const fd = new FormData(e.currentTarget);
    updateCase(editCase.case_id, {
      case_title: fd.get('title') as string,
      case_description: fd.get('description') as string,
      lead_investigator: fd.get('investigator') as string,
      department: fd.get('department') as string,
      case_status: fd.get('status') as Case['case_status'],
    });
    addAuditLog({
      log_id: `al${Date.now()}`,
      user_id: user?.id || '',
      user_name: user?.name || '',
      action: 'UPDATE',
      entity_type: 'Case',
      entity_id: editCase.case_id,
      timestamp: new Date().toISOString(),
      ip_address: '10.0.1.1',
    });
    setEditCase(null);
  };

  const handleDelete = (caseId: string) => {
    if (confirm('Are you sure you want to delete this case?')) {
      deleteCase(caseId);
      addAuditLog({
        log_id: `al${Date.now()}`,
        user_id: user?.id || '',
        user_name: user?.name || '',
        action: 'DELETE',
        entity_type: 'Case',
        entity_id: caseId,
        timestamp: new Date().toISOString(),
        ip_address: '10.0.1.1',
      });
    }
  };

  const handleExportCSV = () => {
    exportToCSV(cases as unknown as object[], `cases_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportJSON = () => {
    exportToJSON(cases as unknown as object[], `cases_report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Case Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage investigation cases</p>
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
              <Button><Plus className="w-4 h-4 mr-2" />New Case</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Create New Case</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Case Title</Label><Input name="title" required className="mt-1" placeholder="Enter case title" /></div>
                <div><Label>Description</Label><Textarea name="description" required className="mt-1" placeholder="Enter case description" /></div>
                <div><Label>Lead Investigator</Label><Input name="investigator" defaultValue={user?.name} required className="mt-1" /></div>
                <div><Label>Department</Label><Input name="department" defaultValue={user?.department} required className="mt-1" /></div>
                <Button type="submit" className="w-full">Create Case</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search cases by ID, title, or investigator..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card-forensic overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Case ID', 'Title', 'Lead Investigator', 'Department', 'Status', 'Devices', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.case_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-primary">{c.case_id}</td>
                <td className="py-3 px-4 font-medium">{c.case_title}</td>
                <td className="py-3 px-4 text-xs">{c.lead_investigator}</td>
                <td className="py-3 px-4 text-xs text-muted-foreground">{c.department}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${statusClassMap[c.case_status]}`}>{c.case_status}</span>
                </td>
                <td className="py-3 px-4 text-xs">{c.device_count}</td>
                <td className="py-3 px-4 text-xs text-muted-foreground">{c.created_at}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => setEditCase(c)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(c.case_id)} className="text-muted-foreground hover:text-red-400 transition-colors" title="Delete">
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
          <p className="text-center text-muted-foreground text-sm py-8">No cases found.</p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCase} onOpenChange={(o) => !o && setEditCase(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Edit Case</DialogTitle></DialogHeader>
          {editCase && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div><Label>Case Title</Label><Input name="title" defaultValue={editCase.case_title} required className="mt-1" /></div>
              <div><Label>Description</Label><Textarea name="description" defaultValue={editCase.case_description} required className="mt-1" /></div>
              <div><Label>Lead Investigator</Label><Input name="investigator" defaultValue={editCase.lead_investigator} required className="mt-1" /></div>
              <div><Label>Department</Label><Input name="department" defaultValue={editCase.department} required className="mt-1" /></div>
              <div>
                <Label>Status</Label>
                <Select name="status" defaultValue={editCase.case_status}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasesPage;

