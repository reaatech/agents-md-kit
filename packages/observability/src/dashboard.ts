/**
 * Lightweight dashboard helpers for observability summaries
 */

import type { LogEntry } from './logger.js';

export interface DashboardSummary {
  totalOperations: number;
  failures: number;
  averageDurationMs: number;
  operationsByName: Record<string, number>;
  errorsByOperation: Record<string, number>;
}

export function buildDashboardSummary(entries: LogEntry[]): DashboardSummary {
  const operationsByName: Record<string, number> = {};
  const errorsByOperation: Record<string, number> = {};

  let failures = 0;
  let durationTotal = 0;
  let durationCount = 0;

  for (const entry of entries) {
    operationsByName[entry.operation] = (operationsByName[entry.operation] ?? 0) + 1;

    if (entry.success === false || entry.level === 'error') {
      failures += 1;
      errorsByOperation[entry.operation] = (errorsByOperation[entry.operation] ?? 0) + 1;
    }

    if (typeof entry.duration_ms === 'number') {
      durationTotal += entry.duration_ms;
      durationCount += 1;
    }
  }

  return {
    totalOperations: entries.length,
    failures,
    averageDurationMs: durationCount === 0 ? 0 : durationTotal / durationCount,
    operationsByName,
    errorsByOperation,
  };
}

export function renderDashboardMarkdown(summary: DashboardSummary): string {
  const lines = [
    '# Observability Dashboard',
    '',
    `Total operations: ${summary.totalOperations}`,
    `Failures: ${summary.failures}`,
    `Average duration (ms): ${summary.averageDurationMs.toFixed(2)}`,
    '',
    '## Operations',
  ];

  for (const [operation, count] of Object.entries(summary.operationsByName)) {
    lines.push(`- ${operation}: ${count}`);
  }

  if (Object.keys(summary.errorsByOperation).length > 0) {
    lines.push('', '## Errors');
    for (const [operation, count] of Object.entries(summary.errorsByOperation)) {
      lines.push(`- ${operation}: ${count}`);
    }
  }

  return lines.join('\n');
}
