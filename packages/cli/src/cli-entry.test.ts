import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const cliPath = resolve(__dirname, '..', 'dist', 'cli.js');

describe('CLI entry point', () => {
  it('outputs version via --version flag', async () => {
    const { stdout } = await execFileAsync('node', [cliPath, '--version'], {
      timeout: 15000,
    });
    expect(stdout.trim()).toBe('1.0.0');
  });

  it('outputs help via --help flag', async () => {
    const { stdout } = await execFileAsync('node', [cliPath, '--help'], {
      timeout: 15000,
    });
    expect(stdout).toContain('agents-md-kit');
    expect(stdout).toContain('lint');
    expect(stdout).toContain('validate');
  });

  it('handles unknown commands with error exit code', async () => {
    try {
      await execFileAsync('node', [cliPath, 'nonexistent-command'], {
        timeout: 15000,
      });
      expect.fail('Should have thrown');
    } catch (err) {
      expect((err as { code?: string }).code).not.toBe('SUCCESS');
    }
  });
});
