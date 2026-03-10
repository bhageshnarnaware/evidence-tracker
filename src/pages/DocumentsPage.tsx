import { useState, useRef } from 'react';
import { useDataStore } from '@/contexts/DataStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Upload, ExternalLink, Trash2, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Document } from '@/contexts/DataStoreContext';

const categoryColors: Record<string, string> = {
  Warrant: 'status-transit',
  Photo: 'status-analysis',
  'Forensic Report': 'status-sealed',
  Form: 'status-returned',
  Other: 'bg-secondary text-secondary-foreground',
};

const getIcon = (type: string) => {
  if (type === 'Image') return <Image className="w-4 h-4 text-muted-foreground" />;
  if (type === 'PDF') return <FileText className="w-4 h-4 text-muted-foreground" />;
  return <File className="w-4 h-4 text-muted-foreground" />;
};

const DocumentsPage = () => {
  const { documents, addDocument, deleteDocument, evidence, addAuditLog } = useDataStore();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evidenceId, setEvidenceId] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result as string;
      const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';
      const fileType = ['JPG','JPEG','PNG','GIF','WEBP'].includes(ext) ? 'Image' : ext === 'PDF' ? 'PDF' : 'Document';
      const doc: Document = {
        id: `doc${Date.now()}`,
        evidence_id: evidenceId,
        file_name: selectedFile.name,
        file_type: fileType,
        uploaded_by: user?.name || '',
        upload_date: new Date().toISOString().split('T')[0],
        category: category || 'Other',
        file_data: fileData,
        file_size: selectedFile.size,
      };
      addDocument(doc);
      addAuditLog({
        log_id: `al${Date.now()}`,
        user_id: user?.id || '',
        user_name: user?.name || '',
        action: 'UPLOAD',
        entity_type: 'Document',
        entity_id: doc.id,
        timestamp: new Date().toISOString(),
        ip_address: '10.0.1.1',
      });
      setUploading(false);
      setUploadOpen(false);
      setSelectedFile(null);
      setEvidenceId('');
      setCategory('');
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleOpen = (doc: Document) => {
    if (doc.file_data) {
      // Has actual data - open or preview
      if (doc.file_type === 'Image') {
        setPreviewDoc(doc);
      } else {
        const link = document.createElement('a');
        link.href = doc.file_data;
        link.download = doc.file_name;
        link.click();
      }
    } else {
      // Mock document - show info
      setPreviewDoc(doc);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Evidence documents, photos, and reports</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />Upload Document
        </Button>
      </div>

      <div className="card-forensic overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['File Name', 'Type', 'Category', 'Evidence', 'Uploaded By', 'Date', 'Size', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {getIcon(doc.file_type)}
                    <span className="text-xs font-medium truncate max-w-[180px]">{doc.file_name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">{doc.file_type}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${categoryColors[doc.category] || categoryColors.Other}`}>
                    {doc.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs font-mono text-primary">{doc.evidence_id || '-'}</td>
                <td className="py-3 px-4 text-xs">{doc.uploaded_by}</td>
                <td className="py-3 px-4 text-xs text-muted-foreground">{doc.upload_date}</td>
                <td className="py-3 px-4 text-xs text-muted-foreground">{formatSize(doc.file_size)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpen(doc)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={doc.file_data ? (doc.file_type === 'Image' ? 'Preview' : 'Download') : 'View Info'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {documents.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No documents uploaded yet.</p>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <Label>File</Label>
              <input
                ref={fileRef}
                type="file"
                onChange={handleFileSelect}
                className="mt-1 w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                required
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">{selectedFile.name} ({formatSize(selectedFile.size)})</p>
              )}
            </div>
            <div>
              <Label>Evidence ID (optional)</Label>
              <Select value={evidenceId} onValueChange={setEvidenceId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Link to evidence..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {evidence.map(ev => (
                    <SelectItem key={ev.evidence_id} value={ev.evidence_id}>{ev.evidence_tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {['Warrant', 'Photo', 'Forensic Report', 'Form', 'Other'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={!selectedFile || !category || uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader><DialogTitle>{previewDoc?.file_name}</DialogTitle></DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              {previewDoc.file_data && previewDoc.file_type === 'Image' ? (
                <img src={previewDoc.file_data} alt={previewDoc.file_name} className="w-full rounded-md object-contain max-h-96" />
              ) : (
                <div className="p-6 rounded-md bg-secondary/30 text-center space-y-2">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium">{previewDoc.file_name}</p>
                  {previewDoc.file_data && (
                    <Button size="sm" onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewDoc.file_data!;
                      link.download = previewDoc.file_name;
                      link.click();
                    }}>
                      Download File
                    </Button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-border pt-3">
                <div><span className="text-muted-foreground">Category:</span> {previewDoc.category}</div>
                <div><span className="text-muted-foreground">Uploaded by:</span> {previewDoc.uploaded_by}</div>
                <div><span className="text-muted-foreground">Date:</span> {previewDoc.upload_date}</div>
                <div><span className="text-muted-foreground">Evidence:</span> {previewDoc.evidence_id || 'N/A'}</div>
                {previewDoc.file_size && <div><span className="text-muted-foreground">Size:</span> {formatSize(previewDoc.file_size)}</div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
