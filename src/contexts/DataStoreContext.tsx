import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  mockCases, mockDevices, mockEvidence, mockCustodyLogs,
  mockForensicAcquisitions, mockAuditLogs, mockUsers
} from '@/data/mockData';
import { Case, Device, Evidence, CustodyLog, ForensicAcquisition, AuditLog, User } from '@/types';

export interface Document {
  id: string;
  evidence_id: string;
  file_name: string;
  file_type: string;
  uploaded_by: string;
  upload_date: string;
  category: string;
  file_data?: string; // base64 data URL
  file_size?: number;
}

interface DataStoreContextType {
  cases: Case[];
  devices: Device[];
  evidence: Evidence[];
  custodyLogs: CustodyLog[];
  forensicAcquisitions: ForensicAcquisition[];
  auditLogs: AuditLog[];
  users: User[];
  documents: Document[];
  addCase: (c: Case) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  addDevice: (d: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  addEvidence: (e: Evidence) => void;
  updateEvidence: (id: string, updates: Partial<Evidence>) => void;
  deleteEvidence: (id: string) => void;
  addCustodyLog: (log: CustodyLog) => void;
  addForensicAcquisition: (fa: ForensicAcquisition) => void;
  addAuditLog: (log: AuditLog) => void;
  addUser: (u: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addDocument: (doc: Document) => void;
  deleteDocument: (id: string) => void;
}

const DataStoreContext = createContext<DataStoreContextType | null>(null);

function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersisted = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [state, setPersisted] as const;
}

export const DataStoreProvider = ({ children }: { children: ReactNode }) => {
  const [cases, setCases] = usePersistedState('dset_cases', mockCases);
  const [devices, setDevices] = usePersistedState('dset_devices', mockDevices);
  const [evidence, setEvidence] = usePersistedState('dset_evidence', mockEvidence);
  const [custodyLogs, setCustodyLogs] = usePersistedState('dset_custody', mockCustodyLogs);
  const [forensicAcquisitions, setForensicAcquisitions] = usePersistedState('dset_forensics', mockForensicAcquisitions);
  const [auditLogs, setAuditLogs] = usePersistedState('dset_audit', mockAuditLogs);
  const [users, setUsers] = usePersistedState('dset_users', mockUsers);
  const [documents, setDocuments] = usePersistedState<Document[]>('dset_documents', [
    { id: 'doc1', evidence_id: 'e1', file_name: 'seizure_warrant_CS2024_0047.pdf', file_type: 'PDF', uploaded_by: 'James Rivera', upload_date: '2024-06-16', category: 'Warrant' },
    { id: 'doc2', evidence_id: 'e1', file_name: 'device_photo_laptop_front.jpg', file_type: 'Image', uploaded_by: 'James Rivera', upload_date: '2024-06-16', category: 'Photo' },
    { id: 'doc3', evidence_id: 'e1', file_name: 'forensic_report_EVD0047001.pdf', file_type: 'PDF', uploaded_by: 'Dr. Aisha Patel', upload_date: '2024-06-25', category: 'Forensic Report' },
    { id: 'doc4', evidence_id: 'e3', file_name: 'chain_of_custody_form.pdf', file_type: 'PDF', uploaded_by: 'Marcus Johnson', upload_date: '2024-07-24', category: 'Form' },
  ]);

  const addCase = (c: Case) => setCases(prev => [c, ...prev]);
  const updateCase = (id: string, updates: Partial<Case>) =>
    setCases(prev => prev.map(c => c.case_id === id ? { ...c, ...updates } : c));
  const deleteCase = (id: string) => setCases(prev => prev.filter(c => c.case_id !== id));

  const addDevice = (d: Device) => setDevices(prev => [d, ...prev]);
  const updateDevice = (id: string, updates: Partial<Device>) =>
    setDevices(prev => prev.map(d => d.device_id === id ? { ...d, ...updates } : d));
  const deleteDevice = (id: string) => setDevices(prev => prev.filter(d => d.device_id !== id));

  const addEvidence = (e: Evidence) => setEvidence(prev => [e, ...prev]);
  const updateEvidence = (id: string, updates: Partial<Evidence>) =>
    setEvidence(prev => prev.map(e => e.evidence_id === id ? { ...e, ...updates } : e));
  const deleteEvidence = (id: string) => setEvidence(prev => prev.filter(e => e.evidence_id !== id));

  const addCustodyLog = (log: CustodyLog) => setCustodyLogs(prev => [log, ...prev]);
  const addForensicAcquisition = (fa: ForensicAcquisition) => setForensicAcquisitions(prev => [fa, ...prev]);
  const addAuditLog = (log: AuditLog) => setAuditLogs(prev => [log, ...prev]);

  const addUser = (u: User) => setUsers(prev => [u, ...prev]);
  const updateUser = (id: string, updates: Partial<User>) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const addDocument = (doc: Document) => setDocuments(prev => [doc, ...prev]);
  const deleteDocument = (id: string) => setDocuments(prev => prev.filter(d => d.id !== id));

  return (
    <DataStoreContext.Provider value={{
      cases, devices, evidence, custodyLogs, forensicAcquisitions,
      auditLogs, users, documents,
      addCase, updateCase, deleteCase,
      addDevice, updateDevice, deleteDevice,
      addEvidence, updateEvidence, deleteEvidence,
      addCustodyLog, addForensicAcquisition, addAuditLog,
      addUser, updateUser, deleteUser,
      addDocument, deleteDocument,
    }}>
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = () => {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used inside DataStoreProvider');
  return ctx;
};
