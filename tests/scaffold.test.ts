import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateFiles, previewGeneration } from '../src/scaffold/file-generator.js';
import { compileTemplate, getAvailableTemplates, loadTemplate } from '../src/scaffold/template-engine.js';
import type { ScaffoldConfig } from '../src/types/domain.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe('scaffold utilities', () => {
  it('previews and skips existing files', () => {
    const dir = createTempDir();
    writeFileSync(path.join(dir, 'AGENTS.md'), 'existing', 'utf-8');
    const config = createConfig(dir);

    const preview = previewGeneration(config);
    expect(preview[0]?.exists).toBe(true);

    const result = generateFiles(config);
    expect(result.skipped).toContain(path.join(dir, 'AGENTS.md'));
  });

  it('lists available templates', () => {
    expect(getAvailableTemplates()).toContain('agents-md');
    expect(getAvailableTemplates()).toContain('skill-md');
  });

  it('generates AGENTS.md and skill files', () => {
    const dir = createTempDir();
    const config = createConfig(dir);
    const result = generateFiles(config);
    expect(result.created).toContain(path.join(dir, 'AGENTS.md'));
    expect(result.created).toContain(path.join(dir, 'skills', 'example', 'skill.md'));
    expect(existsSync(path.join(dir, 'AGENTS.md'))).toBe(true);
    expect(existsSync(path.join(dir, 'skills', 'example', 'skill.md'))).toBe(true);
  });

  it('skips existing skill files when overwrite is false', () => {
    const dir = createTempDir();
    const skillDir = path.join(dir, 'skills', 'example');
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(path.join(skillDir, 'skill.md'), 'existing', 'utf-8');
    const config = createConfig(dir);
    const result = generateFiles(config);
    expect(result.skipped).toContain(path.join(skillDir, 'skill.md'));
  });

  it('overwrites existing files when overwrite is true', () => {
    const dir = createTempDir();
    writeFileSync(path.join(dir, 'AGENTS.md'), 'old content', 'utf-8');
    const config: ScaffoldConfig = {
      ...createConfig(dir),
      overwrite: true,
    };
    const result = generateFiles(config);
    expect(result.created).toContain(path.join(dir, 'AGENTS.md'));
  });

  it('reports error when output dir creation fails', () => {
    const config: ScaffoldConfig = createConfig('/dev/null/impossible/path/that/cannot/be/created');
    config.outputDir = '/dev/null/impossible/path/that/cannot/be/created';
    const result = generateFiles(config);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('compiles template with boolean values', () => {
    const result = compileTemplate('Active: {{active}}', { active: true });
    expect(result).toBe('Active: true');
  });

  it('compiles template with number values', () => {
    const result = compileTemplate('Count: {{count}}', { count: 42 });
    expect(result).toBe('Count: 42');
  });

  it('compiles template with array values', () => {
    const result = compileTemplate('Items: {{items}}', { items: ['a', 'b', 'c'] });
    expect(result).toBe('Items: a\nb\nc');
  });

  it('throws when loading nonexistent template', () => {
    expect(() => loadTemplate('nonexistent-template-xyz')).toThrow('Template not found');
  });

  it('removes unmatched placeholders', () => {
    const result = compileTemplate('Hello {{name}}, {{unknown}}', { name: 'World' });
    expect(result).toBe('Hello World, ');
  });
});

function createConfig(outputDir: string): ScaffoldConfig {
  return {
    agentType: 'mcp',
    agentId: 'agent',
    displayName: 'Agent',
    version: '1.0.0',
    outputDir,
    overwrite: false,
    skills: [
      {
        skillId: 'example',
        displayName: 'Example',
        skillType: 'tool',
      },
    ],
  };
}

function createTempDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'agents-md-kit-scaffold-'));
  tempDirs.push(dir);
  return dir;
}
