import { useState } from 'react';
import { useDataStore } from '@/contexts/DataStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { FlaskConical, Hash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ForensicAcquisition } from '@/types';

const ForensicsPage = () => {
  const { forensicAcquisitions, evidence, addForensicAcquisition, addAuditLog } = useDataStore();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [evidenceId, setEvidenceId] = useState('');

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fa: ForensicAcquisition = {
      acquisition_id: `fa${Date.now()}`,
      evidence_id: evidenceId,
      examiner_name: fd.get('examiner') as string,
      imaging_tool: fd.get('tool') as string,
      acquisition_date: fd.get('date') as string,
      md5_hash: fd.get('md5') as string,
      sha256_hash: fd.get('sha256') as string,
      notes: fd.get('notes') as string,
    };
    addForensicAcquisition(fa);
    addAuditLog({
      log_id: `al${Date.now()}`,
      user_id: user?.id || '',
      user_name: user?.name || '',
      action: 'ACQUISITION',
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
          <h1 className="text-2xl font-bold">Forensic Acquisitions</h1>
          <p className="text-sm text-muted-foreground mt-1">Imaging records and hash verification</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Acquisition</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Record Forensic Acquisition</DialogTitle></DialogHeader>
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
              <div><Label>Examiner Name</Label><Input name="examiner" defaultValue={user?.name} required className="mt-1" /></div>
              <div><Label>Imaging Tool</Label><Input name="tool" placeholder="e.g. FTK Imager 4.7" required className="mt-1" /></div>
              <div><Label>Acquisition Date</Label><Input name="date" type="date" required className="mt-1" defaultValue={new Date().toISOString().split('T')[0]} /></div>
              <div><Label>MD5 Hash</Label><Input name="md5" placeholder="32-char hex" required className="mt-1 font-mono" /></div>
              <div><Label>SHA-256 Hash</Label><Input name="sha256" placeholder="64-char hex" required className="mt-1 font-mono" /></div>
              <div><Label>Notes</Label><Textarea name="notes" className="mt-1" /></div>
              <Button type="submit" className="w-full" disabled={!evidenceId}>Record Acquisition</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {forensicAcquisitions.map((fa) => {
        const ev = evidence.find((e) => e.evidence_id === fa.evidence_id);
        return (
          <div key={fa.acquisition_id} className="card-forensic space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{fa.examiner_name}</p>
                  <p className="text-xs text-muted-foreground">Evidence: {ev?.evidence_tag || fa.evidence_id}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{fa.acquisition_date}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><p className="text-muted-foreground">Imaging Tool</p><p className="font-medium mt-0.5">{fa.imaging_tool}</p></div>
              <div><p className="text-muted-foreground">Acquisition Date</p><p className="font-medium mt-0.5">{fa.acquisition_date}</p></div>
            </div>
            <div className="space-y-2 bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hash Values</span>
              </div>
              <div className="space-y-1.5">
                <div><span className="text-[10px] text-muted-foreground">MD5:</span><p className="font-mono text-xs break-all">{fa.md5_hash}</p></div>
                <div><span className="text-[10px] text-muted-foreground">SHA-256:</span><p className="font-mono text-xs break-all">{fa.sha256_hash}</p></div>
              </div>
            </div>
            {fa.notes && <p className="text-xs text-muted-foreground border-t border-border pt-3">{fa.notes}</p>}
          </div>
        );
      })}

      {forensicAcquisitions.length === 0 && (
        <div className="card-forensic text-center py-12">
          <FlaskConical className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No forensic acquisitions recorded yet</p>
        </div>
      )}
    </div>
  );
};

export default ForensicsPage;
