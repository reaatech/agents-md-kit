import { describe, expect, it } from 'vitest';
import { buildDashboardSummary, renderDashboardMarkdown } from './dashboard.js';
import { type LogEntry, LogLevel } from './logger.js';

describe('observability dashboard', () => {
  it('summarizes operation history', () => {
    const entries: LogEntry[] = [
      {
        timestamp: '2026-04-16T00:00:00Z',
        level: LogLevel.INFO,
        service: 'agents-md-kit',
        operation: 'lint',
        message: 'ok',
        duration_ms: 10,
        success: true,
      },
      {
        timestamp: '2026-04-16T00:00:01Z',
        level: LogLevel.ERROR,
        service: 'agents-md-kit',
        operation: 'validate',
        message: 'failed',
        duration_ms: 20,
        success: false,
      },
    ];

    const summary = buildDashboardSummary(entries);
    expect(summary.totalOperations).toBe(2);
    expect(summary.failures).toBe(1);
    expect(summary.operationsByName.lint).toBe(1);
    expect(renderDashboardMarkdown(summary)).toContain('Observability Dashboard');
  });
});
