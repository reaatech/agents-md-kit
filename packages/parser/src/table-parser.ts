/**
 * Table parser for extracting markdown tables
 */

import type { MarkdownTable } from '@reaatech/agents-markdown';

/**
 * Parse all tables from markdown content
 */
export function parseTables(content: string): MarkdownTable[] {
  const lines = content.split('\n');
  const tables: MarkdownTable[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    // Check if this line could be start of a table (contains |)
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableStart = i;

      // Find the header row
      const headerLine = line.trim();
      if (!headerLine.startsWith('|') || !headerLine.endsWith('|')) {
        i++;
        continue;
      }

      // Parse header
      const headers = parseTableRow(headerLine);

      // Check for separator row
      i++;
      if (i >= lines.length) {
        continue;
      }

      const separatorLine = lines[i]?.trim() ?? '';
      if (!isTableSeparator(separatorLine)) {
        continue;
      }

      // Parse data rows
      const rows: string[][] = [];
      i++;

      while (i < lines.length) {
        const dataLine = lines[i]?.trim() ?? '';
        if (!dataLine.startsWith('|') || !dataLine.endsWith('|')) {
          break;
        }

        // Check if this is another table separator (shouldn't be)
        if (isTableSeparator(dataLine)) {
          break;
        }

        const row = parseTableRow(dataLine);
        rows.push(row);
        i++;
      }

      // Create table object
      const table: MarkdownTable = {
        headers,
        rows,
        location: {
          line: tableStart + 1, // 1-indexed
          endLine: i, // 1-indexed
        },
      };

      tables.push(table);
    } else {
      i++;
    }
  }

  return tables;
}

/**
 * Parse a single table row into cells
 */
function parseTableRow(line: string): string[] {
  // Remove leading and trailing pipes
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.endsWith('|')) {
    trimmed = trimmed.slice(0, -1);
  }

  // Split by pipe and trim each cell
  return trimmed.split('|').map((cell) => cell.trim());
}

/**
 * Check if a line is a table separator (e.g., |---|---|)
 */
function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) {
    return false;
  }

  // Split by pipe and check each cell is dashes (with optional alignment markers)
  const cells = trimmed
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);

  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

/**
 * Extract a specific column from a table
 */
export function extractColumn(table: MarkdownTable, columnName: string): string[] {
  const columnIndex = table.headers.findIndex((h) => h.toLowerCase() === columnName.toLowerCase());

  if (columnIndex === -1) {
    return [];
  }

  return table.rows.map((row) => row[columnIndex] ?? '').filter((value) => value.length > 0);
}

/**
 * Convert table to array of objects (keyed by headers)
 */
export function tableToObjects(table: MarkdownTable): Record<string, string>[] {
  return table.rows.map((row) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < table.headers.length; i++) {
      const header = table.headers[i] ?? `column_${i}`;
      obj[header] = row[i] ?? '';
    }
    return obj;
  });
}

/**
 * Validate table structure
 */
export function validateTableStructure(table: MarkdownTable): Array<{
  valid: boolean;
  message: string;
}> {
  const issues: Array<{ valid: boolean; message: string }> = [];

  // Check headers exist
  if (table.headers.length === 0) {
    issues.push({
      valid: false,
      message: 'Table has no headers',
    });
    return issues;
  }

  // Check for duplicate headers
  const lowerHeaders = table.headers.map((h) => h.toLowerCase());
  const duplicates = lowerHeaders.filter((h, i) => h.length > 0 && lowerHeaders.indexOf(h) !== i);
  if (duplicates.length > 0) {
    issues.push({
      valid: false,
      message: `Duplicate headers: ${duplicates.join(', ')}`,
    });
  }

  // Check row consistency
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    if (row && row.length !== table.headers.length) {
      issues.push({
        valid: false,
        message: `Row ${i + 1} has ${row.length} columns, expected ${table.headers.length}`,
      });
    }
  }

  if (issues.length === 0) {
    issues.push({ valid: true, message: 'Valid table structure' });
  }

  return issues;
}

/**
 * Format a table back to markdown string
 */
export function formatTable(table: MarkdownTable): string {
  const lines: string[] = [];

  // Header row
  lines.push(`| ${table.headers.join(' | ')} |`);

  // Separator row
  const separators = table.headers.map(() => '---');
  lines.push(`| ${separators.join(' | ')} |`);

  // Data rows
  for (const row of table.rows) {
    const paddedRow = [...row];
    while (paddedRow.length < table.headers.length) {
      paddedRow.push('');
    }
    lines.push(`| ${paddedRow.join(' | ')} |`);
  }

  return lines.join('\n');
}
