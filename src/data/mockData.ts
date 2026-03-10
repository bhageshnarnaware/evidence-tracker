import { Case, Device, Evidence, CustodyLog, ForensicAcquisition, AuditLog, User } from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'schen@cyber.gov', role: 'admin', department: 'Cybercrime Unit', created_at: '2024-01-15' },
  { id: 'u2', name: 'James Rivera', email: 'jrivera@cyber.gov', role: 'investigator', department: 'Digital Forensics', created_at: '2024-02-01' },
  { id: 'u3', name: 'Dr. Aisha Patel', email: 'apatel@cyber.gov', role: 'forensic_analyst', department: 'Digital Forensics', created_at: '2024-02-10' },
  { id: 'u4', name: 'Marcus Johnson', email: 'mjohnson@cyber.gov', role: 'evidence_custodian', department: 'Evidence Management', created_at: '2024-03-01' },
];

export const mockCases: Case[] = [
  { case_id: 'CS-2024-0047', case_title: 'Operation Dark Web Marketplace', case_description: 'Investigation into illegal marketplace operating on Tor network', lead_investigator: 'James Rivera', department: 'Cybercrime Unit', case_status: 'Open', created_at: '2024-06-15', device_count: 4 },
  { case_id: 'CS-2024-0052', case_title: 'Corporate Data Breach - TechCorp', case_description: 'Unauthorized access to corporate database with exfiltration of PII', lead_investigator: 'Sarah Chen', department: 'Digital Forensics', case_status: 'Open', created_at: '2024-07-22', device_count: 3 },
  { case_id: 'CS-2024-0038', case_title: 'Ransomware Attack - City Hospital', case_description: 'Ransomware deployment affecting hospital network infrastructure', lead_investigator: 'James Rivera', department: 'Cybercrime Unit', case_status: 'Closed', created_at: '2024-04-10', device_count: 6 },
  { case_id: 'CS-2024-0061', case_title: 'Identity Theft Ring', case_description: 'Organized identity theft operation using stolen credentials', lead_investigator: 'Sarah Chen', department: 'Cybercrime Unit', case_status: 'Open', created_at: '2024-09-05', device_count: 2 },
  { case_id: 'CS-2024-0029', case_title: 'Crypto Fraud Investigation', case_description: 'Ponzi scheme using cryptocurrency platforms', lead_investigator: 'James Rivera', department: 'Financial Crimes', case_status: 'Archived', created_at: '2024-03-01', device_count: 5 },
];

export const mockDevices: Device[] = [
  { device_id: 'd1', case_id: 'CS-2024-0047', device_type: 'Laptop', brand: 'Dell', model: 'XPS 15', serial_number: 'DL-9482-XPS', imei: undefined, storage_capacity: '512GB SSD', color: 'Silver', seizure_location: '742 Elm Street, Apt 3B', seizure_date: '2024-06-16', seizing_officer: 'James Rivera', condition_notes: 'Minor scratches on lid, powered off at seizure' },
  { device_id: 'd2', case_id: 'CS-2024-0047', device_type: 'Phone', brand: 'Samsung', model: 'Galaxy S23', serial_number: 'SM-S23-7821', imei: '354912087654321', storage_capacity: '256GB', color: 'Black', seizure_location: '742 Elm Street, Apt 3B', seizure_date: '2024-06-16', seizing_officer: 'James Rivera', condition_notes: 'Screen locked, no visible damage' },
  { device_id: 'd3', case_id: 'CS-2024-0052', device_type: 'HDD', brand: 'Western Digital', model: 'Elements 5TB', serial_number: 'WD-EL-39201', storage_capacity: '5TB', color: 'Black', seizure_location: 'TechCorp HQ, Server Room B', seizure_date: '2024-07-23', seizing_officer: 'Sarah Chen', condition_notes: 'External HDD, disconnected from server rack' },
  { device_id: 'd4', case_id: 'CS-2024-0047', device_type: 'USB', brand: 'Kingston', model: 'DataTraveler', serial_number: 'KT-DT-5520', storage_capacity: '64GB', color: 'Red', seizure_location: '742 Elm Street, Apt 3B', seizure_date: '2024-06-16', seizing_officer: 'James Rivera', condition_notes: 'Found in desk drawer' },
];

export const mockEvidence: Evidence[] = [
  { evidence_id: 'e1', device_id: 'd1', evidence_tag: 'EVD-2024-0047-001', current_status: 'Under Analysis', current_custodian: 'Dr. Aisha Patel', storage_location: 'Lab A', locker_number: 'L-12', seal_number: 'SEAL-8821', created_at: '2024-06-17' },
  { evidence_id: 'e2', device_id: 'd2', evidence_tag: 'EVD-2024-0047-002', current_status: 'Sealed', current_custodian: 'Marcus Johnson', storage_location: 'Vault B', locker_number: 'L-34', seal_number: 'SEAL-8822', created_at: '2024-06-17' },
  { evidence_id: 'e3', device_id: 'd3', evidence_tag: 'EVD-2024-0052-001', current_status: 'In Transit', current_custodian: 'James Rivera', storage_location: 'In Transit', locker_number: '-', seal_number: 'SEAL-9001', created_at: '2024-07-24' },
  { evidence_id: 'e4', device_id: 'd4', evidence_tag: 'EVD-2024-0047-003', current_status: 'In Storage', current_custodian: 'Marcus Johnson', storage_location: 'Vault A', locker_number: 'L-07', seal_number: 'SEAL-8823', created_at: '2024-06-17' },
];

export const mockCustodyLogs: CustodyLog[] = [
  { log_id: 'cl1', evidence_id: 'e1', transferred_from: 'James Rivera', transferred_to: 'Marcus Johnson', transfer_date: '2024-06-17T10:30:00', transfer_reason: 'Initial evidence intake', digital_signature: 'SIG-JR-0617', remarks: 'Evidence sealed and logged' },
  { log_id: 'cl2', evidence_id: 'e1', transferred_from: 'Marcus Johnson', transferred_to: 'Dr. Aisha Patel', transfer_date: '2024-06-20T14:15:00', transfer_reason: 'Forensic examination', digital_signature: 'SIG-MJ-0620', remarks: 'Seal intact, transferred to Lab A' },
  { log_id: 'cl3', evidence_id: 'e2', transferred_from: 'James Rivera', transferred_to: 'Marcus Johnson', transfer_date: '2024-06-17T10:45:00', transfer_reason: 'Initial evidence intake', digital_signature: 'SIG-JR-0617B', remarks: 'Device powered off, sealed in anti-static bag' },
  { log_id: 'cl4', evidence_id: 'e3', transferred_from: 'Sarah Chen', transferred_to: 'James Rivera', transfer_date: '2024-07-24T09:00:00', transfer_reason: 'Transfer to forensics lab', digital_signature: 'SIG-SC-0724', remarks: 'HDD sealed, in transit to main lab' },
];

export const mockForensicAcquisitions: ForensicAcquisition[] = [
  { acquisition_id: 'fa1', evidence_id: 'e1', examiner_name: 'Dr. Aisha Patel', imaging_tool: 'FTK Imager 4.7', acquisition_date: '2024-06-21', md5_hash: 'a3f2b8c9d1e4f5a6b7c8d9e0f1a2b3c4', sha256_hash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', notes: 'Full disk image acquired, no errors during acquisition' },
];

export const mockAuditLogs: AuditLog[] = [
  { log_id: 'al1', user_id: 'u2', user_name: 'James Rivera', action: 'CREATE', entity_type: 'Case', entity_id: 'CS-2024-0047', timestamp: '2024-06-15T08:30:00', ip_address: '10.0.1.45' },
  { log_id: 'al2', user_id: 'u2', user_name: 'James Rivera', action: 'CREATE', entity_type: 'Device', entity_id: 'd1', timestamp: '2024-06-16T14:20:00', ip_address: '10.0.1.45' },
  { log_id: 'al3', user_id: 'u4', user_name: 'Marcus Johnson', action: 'TRANSFER', entity_type: 'Evidence', entity_id: 'e1', timestamp: '2024-06-17T10:30:00', ip_address: '10.0.1.80' },
  { log_id: 'al4', user_id: 'u3', user_name: 'Dr. Aisha Patel', action: 'ACQUISITION', entity_type: 'Evidence', entity_id: 'e1', timestamp: '2024-06-21T09:15:00', ip_address: '10.0.1.62' },
  { log_id: 'al5', user_id: 'u1', user_name: 'Sarah Chen', action: 'UPDATE', entity_type: 'Case', entity_id: 'CS-2024-0052', timestamp: '2024-07-22T16:45:00', ip_address: '10.0.1.10' },
  { log_id: 'al6', user_id: 'u1', user_name: 'Sarah Chen', action: 'CREATE', entity_type: 'Device', entity_id: 'd3', timestamp: '2024-07-23T11:00:00', ip_address: '10.0.1.10' },
];

export const dashboardStats = {
  totalCases: 5,
  openInvestigations: 3,
  devicesSeized: 12,
  evidenceTransfers: 28,
  evidenceInStorage: 18,
  closedCases: 1,
};
