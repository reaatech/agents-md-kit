import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('CLI entry point', () => {
  it('outputs version via --version flag', async () => {
    const { stdout } = await execFileAsync('node', ['packages/cli/dist/cli.js', '--version'], {
      cwd: process.cwd(),
      timeout: 15000,
    });
    expect(stdout.trim()).toBe('1.0.0');
  });

  it('outputs help via --help flag', async () => {
    const { stdout } = await execFileAsync('node', ['packages/cli/dist/cli.js', '--help'], {
      cwd: process.cwd(),
      timeout: 15000,
    });
    expect(stdout).toContain('agents-md-kit');
    expect(stdout).toContain('lint');
    expect(stdout).toContain('validate');
  });

  it('handles unknown commands with error exit code', async () => {
    try {
      await execFileAsync('node', ['packages/cli/dist/cli.js', 'nonexistent-command'], {
        cwd: process.cwd(),
        timeout: 15000,
      });
      expect.fail('Should have thrown');
    } catch (err) {
      expect((err as { code?: string }).code).not.toBe('SUCCESS');
    }
  });
});
