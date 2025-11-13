/**
 * Utility functions for exporting data to JSON and CSV formats
 */

/**
 * Download data as JSON file
 */
export function downloadJSON(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: Array<Record<string, unknown>>): string {
  if (data.length === 0) return '';

  // Get all unique keys from all objects
  const keys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => keys.add(key));
  });

  const headers = Array.from(keys);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];

  // Create CSV data rows
  data.forEach((item) => {
    const values = headers.map((header) => {
      const value = item[header];
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Handle objects/arrays - stringify them
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Handle strings with commas, quotes, or newlines
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: Array<Record<string, unknown>>, filename: string): void {
  const csvString = arrayToCSV(data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

