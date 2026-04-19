import { describe, expect, it } from 'vitest';
import pino from 'pino';
import { MetricsManager, recordOperation } from '../src/observability/metrics.js';
import { info, log, LogLevel, setLogger } from '../src/observability/logger.js';

describe('observability runtime helpers', () => {
  it('records metrics without throwing', async () => {
    const manager = new MetricsManager();
    manager.recordOperation('lint', true, 10);
    manager.recordValidationErrors(1, 'agents');
    manager.recordValidationWarnings(2, 'agents');
    manager.recordLintErrors(1, 'skill');
    manager.recordLintWarnings(2, 'skill');
    manager.recordFileProcessed('agents');
    manager.recordScaffoldGeneration('mcp', 2);

    const value = await recordOperation('validate', async () => 'ok');
    expect(value).toBe('ok');

    await manager.shutdown();
  });

  it('logs through the configured logger', () => {
    const messages: string[] = [];
    const stream = {
      write(chunk: string): boolean {
        messages.push(chunk);
        return true;
      },
    };

    setLogger(
      pino(
        {
          enabled: true,
        },
        stream
      )
    );

    log({
      level: LogLevel.INFO,
      operation: 'lint',
      message: 'email me at person@example.com',
      request_id: 'req-1',
    });
    info('validate', 'done');

    expect(messages.join('')).toContain('[REDACTED]');
    expect(messages.join('')).toContain('req-1');
  });
});
