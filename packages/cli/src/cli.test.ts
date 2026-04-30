import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Command } from 'commander';
import { afterEach, describe, expect, it } from 'vitest';
import {
  examplesCommand,
  formatCommand,
  lintCommand,
  scaffoldCommand,
  validateCommand,
} from './commands/index.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe('CLI commands', () => {
  it('runs lint with json output', async () => {
    const examplePath = path.join(process.cwd(), 'examples', 'mcp-server', 'AGENTS.md');
    const output = await runCommand(
      (program) => lintCommand(program),
      ['lint', examplePath, '--format', 'json']
    );

    const parsed = JSON.parse(output) as Array<{ path: string; errorCount: number }>;
    expect(parsed[0]?.path).toBe(examplePath);
    expect(typeof parsed[0]?.errorCount).toBe('number');
  });

  it('runs validate with json output', async () => {
    const examplePath = path.join(
      process.cwd(),
      'examples',
      'gallery',
      'mcp-server',
      'skills',
      'echo',
      'skill.md'
    );
    const output = await runCommand(
      (program) => validateCommand(program),
      ['validate', examplePath, '--format', 'json']
    );

    const parsed = JSON.parse(output) as Array<{ valid: boolean; type: string }>;
    expect(parsed[0]?.valid).toBe(true);
    expect(parsed[0]?.type).toBe('skill');
  });

  it('formats a markdown file in place', async () => {
    const dir = createTempDir();
    const filePath = path.join(dir, 'AGENTS.md');
    writeFileSync(filePath, '# Title  \n\n```\ncode\n```\n', 'utf-8');

    await runCommand((program) => formatCommand(program), ['format', filePath]);

    const formatted = readFileSync(filePath, 'utf-8');
    expect(formatted).toContain('```text');
    expect(formatted).not.toContain('# Title  ');
  });

  it('supports scaffold dry-run output', async () => {
    const dir = createTempDir();
    const output = await runCommand(
      (program) => scaffoldCommand(program),
      ['scaffold', dir, '--dry-run']
    );

    expect(output).toContain('AGENTS.md');
    expect(output).toContain('skills/example/skill.md');
  });

  it('lists examples', async () => {
    const output = await runCommand(
      (program) => examplesCommand(program),
      ['examples', 'mcp-server']
    );
    expect(output).toContain('mcp-server');
    expect(output).toContain('Skills:');
  });

  it('shows and copies examples', async () => {
    const examplesDir = path.join(process.cwd(), 'examples');
    const showOutput = await runCommand(
      (program) => examplesCommand(program),
      ['examples', '--show', 'mcp-server/AGENTS.md']
    );
    expect(showOutput).toContain('# Example MCP Server');

    const dir = createTempDir();
    const originalCwd = process.cwd();
    const originalExamples = process.env.AGENTS_MD_KIT_EXAMPLES;
    process.chdir(dir);
    process.env.AGENTS_MD_KIT_EXAMPLES = examplesDir;
    try {
      const copyOutput = await runCommand(
        (program) => examplesCommand(program),
        ['examples', '--copy', 'mcp-server']
      );
      expect(copyOutput).toContain('Copied');
      expect(readFileSync(path.join(dir, 'mcp-server', 'AGENTS.md'), 'utf-8')).toContain(
        '# Example MCP Server'
      );
    } finally {
      process.chdir(originalCwd);
      if (originalExamples !== undefined) {
        process.env.AGENTS_MD_KIT_EXAMPLES = originalExamples;
      } else {
        process.env.AGENTS_MD_KIT_EXAMPLES = undefined;
      }
    }
  });
});

async function runCommand(register: (program: Command) => void, argv: string[]): Promise<string> {
  const program = new Command();
  register(program);

  let output = '';
  const stdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string | Uint8Array) => {
    output += chunk.toString();
    return true;
  }) as typeof process.stdout.write;

  try {
    await program.parseAsync(argv, { from: 'user' });
  } finally {
    process.stdout.write = stdoutWrite;
  }

  return output.trim();
}

function createTempDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'agents-md-kit-cli-'));
  tempDirs.push(dir);
  return dir;
}
