type CsvCell = string | number | null | undefined;

const escapeCell = (cell: CsvCell): string => {
  const s = cell == null ? '' : String(cell);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(rows: CsvCell[][]): string {
  return rows.map(row => row.map(escapeCell).join(',')).join('\n');
}

export function downloadCsv(filename: string, rows: CsvCell[][]): void {
  // Excel needs the UTF-8 BOM to recognize Spanish accents on direct open.
  const blob = new Blob(['\uFEFF', toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
