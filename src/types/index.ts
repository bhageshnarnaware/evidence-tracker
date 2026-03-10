export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'investigator' | 'forensic_analyst' | 'evidence_custodian';
  department: string;
  created_at: string;
}

export interface Case {
  case_id: string;
  case_title: string;
  case_description: string;
  lead_investigator: string;
  department: string;
  case_status: 'Open' | 'Closed' | 'Archived';
  created_at: string;
  device_count?: number;
}

export interface Device {
  device_id: string;
  case_id: string;
  device_type: 'Phone' | 'Laptop' | 'HDD' | 'USB' | 'Tablet' | 'Other';
  brand: string;
  model: string;
  serial_number: string;
  imei?: string;
  storage_capacity: string;
  color: string;
  seizure_location: string;
  seizure_date: string;
  seizing_officer: string;
  condition_notes: string;
}

export interface Evidence {
  evidence_id: string;
  device_id: string;
  evidence_tag: string;
  current_status: 'Sealed' | 'In Transit' | 'Under Analysis' | 'Returned' | 'In Storage';
  current_custodian: string;
  storage_location: string;
  locker_number: string;
  seal_number: string;
  created_at: string;
  device?: Device;
}

export interface CustodyLog {
  log_id: string;
  evidence_id: string;
  transferred_from: string;
  transferred_to: string;
  transfer_date: string;
  transfer_reason: string;
  digital_signature: string;
  remarks: string;
}

export interface ForensicAcquisition {
  acquisition_id: string;
  evidence_id: string;
  examiner_name: string;
  imaging_tool: string;
  acquisition_date: string;
  md5_hash: string;
  sha256_hash: string;
  notes: string;
}

export interface AuditLog {
  log_id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  ip_address: string;
}
