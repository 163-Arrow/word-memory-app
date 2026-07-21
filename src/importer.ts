import type { ImportRow } from './types';

export type ParsedFile = { sheets: string[]; rows: string[][] };

function csvRows(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; const next = text[i + 1];
    if (c === '"' && quoted && next === '"') { field += c; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && next === '\n') i++; row.push(field); if (row.some(v => v.trim())) rows.push(row); row = []; field = ''; }
    else field += c;
  }
  row.push(field); if (row.some(v => v.trim())) rows.push(row); return rows;
}

export async function parseFile(file: File, sheet?: string): Promise<ParsedFile> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt')) return { sheets: ['文本'], rows: (await file.text()).split(/\r?\n/).map(line => line.split('\t')) };
  if (name.endsWith('.csv')) return { sheets: ['CSV'], rows: csvRows(await file.text()) };
  const { default: getSheets, readSheet } = await import('read-excel-file/browser');
  const workbook = await getSheets(file);
  const sheets = workbook.map(entry => entry.sheet);
  const selected = await readSheet(file, sheet ?? sheets[0]);
  return { sheets, rows: selected.map(row => row.map(cell => cell == null ? '' : String(cell))) };
}

export function mappedRows(rows: string[][], wordCol: number, meaningCol?: number, phoneticCol?: number, header = true): ImportRow[] {
  return rows.slice(header ? 1 : 0).map(row => ({ word: String(row[wordCol] ?? ''), meaning: meaningCol === undefined ? '' : String(row[meaningCol] ?? ''), phonetic: phoneticCol === undefined ? '' : String(row[phoneticCol] ?? '') }));
}
