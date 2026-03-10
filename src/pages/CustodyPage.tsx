import { useDataStore } from '@/contexts/DataStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, CheckCircle2, Clock, Plus } from 'lucide-react';
import { CustodyLog } from '@/types';

const CustodyPage = () => {
  const { custodyLogs, evidence, addCustodyLog, addAuditLog } = useDataStore();
  const { user } = useAuth();
  const [selectedEvidence, setSelectedEvidence] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [evidenceId, setEvidenceId] = useState('');

  const filtered = selectedEvidence === 'all'
    ? custodyLogs
    : custodyLogs.filter((l) => l.evidence_id === selectedEvidence);

  const sorted = [...filtered].sort((a, b) => new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime());

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const log: CustodyLog = {
      log_id: `cl${Date.now()}`,
      evidence_id: evidenceId,
      transferred_from: fd.get('from') as string,
      transferred_to: fd.get('to') as string,
      transfer_date: new Date().toISOString(),
      transfer_reason: fd.get('reason') as string,
      digital_signature: `SIG-${user?.name?.split(' ').map(n => n[0]).join('')}-${Date.now().toString().slice(-4)}`,
      remarks: fd.get('remarks') as string,
    };
    addCustodyLog(log);
    addAuditLog({
      log_id: `al${Date.now()}`,
      user_id: user?.id || '',
      user_name: user?.name || '',
      action: 'TRANSFER',
      entity_type: 'Evidence',
      entity_id: evidenceId,
      timestamp: new Date().toISOString(),
      ip_address: '10.0.1.1',
    });
    setDialogOpen(false);
    setEvidenceId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chain of Custody</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete custody timeline for all evidence items</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Log Transfer</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Log Custody Transfer</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Evidence</Label>
                <Select value={evidenceId} onValueChange={setEvidenceId} required>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select evidence" /></SelectTrigger>
                  <SelectContent>
                    {evidence.map(ev => (
                      <SelectItem key={ev.evidence_id} value={ev.evidence_id}>{ev.evidence_tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Transferred From</Label><Input name="from" defaultValue={user?.name} required className="mt-1" /></div>
              <div><Label>Transferred To</Label><Input name="to" required className="mt-1" /></div>
              <div><Label>Reason</Label><Input name="reason" required className="mt-1" /></div>
              <div><Label>Remarks</Label><Textarea name="remarks" className="mt-1" /></div>
              <Button type="submit" className="w-full" disabled={!evidenceId}>Log Transfer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={selectedEvidence} onValueChange={setSelectedEvidence}>
        <SelectTrigger className="w-80"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Evidence Items</SelectItem>
          {evidence.map((ev) => (
            <SelectItem key={ev.evidence_id} value={ev.evidence_id}>{ev.evidence_tag}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="card-forensic">
        <div className="relative pl-12 space-y-0">
          <div className="custody-timeline-line" />
          {sorted.map((log) => {
            const ev = evidence.find((e) => e.evidence_id === log.evidence_id);
            return (
              <div key={log.log_id} className="relative pb-8 last:pb-0">
                <div className="absolute left-[-24px] top-1 w-5 h-5 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 ml-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-primary">{ev?.evidence_tag || log.evidence_id}</span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(log.transfer_date).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{log.transferred_from}</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{log.transferred_to}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.transfer_reason}</p>
                  {log.remarks && (
                    <p className="text-xs text-muted-foreground mt-1 italic">"{log.remarks}"</p>
                  )}
                  <div className="mt-2">
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {log.digital_signature}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No custody logs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustodyPage;
