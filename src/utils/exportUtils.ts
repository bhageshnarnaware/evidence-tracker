/**
 * Export utilities for evidence reports
 * Supports CSV and JSON export formats
 */

/**
 * Convert evidence data to CSV format
 */
export const exportToCSV = (data: object[], filename: string): void => {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = (row as Record<string, unknown>)[header];
        // Handle values that need quoting (strings containing commas, quotes, or newlines)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Convert evidence data to JSON format
 */
export const exportToJSON = (data: object[], filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Helper function to trigger file download
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format evidence data for export
 * Enriches evidence with device and case information
 */
export interface ExportEvidence {
  evidence_id: string;
  evidence_tag: string;
  case_id: string;
  case_title: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  serial_number: string;
  current_status: string;
  current_custodian: string;
  storage_location: string;
  locker_number: string;
  seal_number: string;
  seizure_date: string;
  seizure_location: string;
  seizing_officer: string;
  created_at: string;
}

export const formatEvidenceForExport = (
  evidence: Array<{
    evidence_id: string;
    device_id: string;
    evidence_tag: string;
    current_status: string;
    current_custodian: string;
    storage_location: string;
    locker_number: string;
    seal_number: string;
    created_at: string;
  }>,
  devices: Array<{
    device_id: string;
    case_id: string;
    device_type: string;
    brand: string;
    model: string;
    serial_number: string;
    seizure_location: string;
    seizure_date: string;
    seizing_officer: string;
  }>,
  cases: Array<{
    case_id: string;
    case_title: string;
  }>
): ExportEvidence[] => {
  return evidence.map(ev => {
    const device = devices.find(d => d.device_id === ev.device_id);
    const caseInfo = device ? cases.find(c => c.case_id === device.case_id) : undefined;
    
    return {
      evidence_id: ev.evidence_id,
      evidence_tag: ev.evidence_tag,
      case_id: device?.case_id || '',
      case_title: caseInfo?.case_title || '',
      device_type: device?.device_type || '',
      device_brand: device?.brand || '',
      device_model: device?.model || '',
      serial_number: device?.serial_number || '',
      current_status: ev.current_status,
      current_custodian: ev.current_custodian,
      storage_location: ev.storage_location,
      locker_number: ev.locker_number,
      seal_number: ev.seal_number,
      seizure_date: device?.seizure_date || '',
      seizure_location: device?.seizure_location || '',
      seizing_officer: device?.seizing_officer || '',
      created_at: ev.created_at,
    };
  });
};

