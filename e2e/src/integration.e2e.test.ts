/**
 * Integration tests for agents-md-kit
 */

import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ScaffoldConfig } from '@reaatech/agents-markdown';
import { runLintRules } from '@reaatech/agents-markdown-linter';
import { parseMarkdown } from '@reaatech/agents-markdown-parser';
import { generateFiles } from '@reaatech/agents-markdown-scaffold';
import { validate } from '@reaatech/agents-markdown-validator';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..', '..');
const testDir = join(rootDir, 'tests', 'fixtures', 'integration');

describe('Integration Tests', () => {
  beforeAll(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('End-to-end linting flow', () => {
    it('should lint a valid AGENTS.md file', async () => {
      const content = readFileSync(join(rootDir, 'examples', 'mcp-server', 'AGENTS.md'), 'utf-8');
      const document = await parseMarkdown(content, 'AGENTS.md');
      const result = runLintRules(document);

      expect(result).toBeDefined();
      expect(result.path).toBe('AGENTS.md');
      expect(typeof result.errorCount).toBe('number');
    });

    it('should lint a valid SKILL.md file', async () => {
      const content = readFileSync(
        join(rootDir, 'examples', 'mcp-server', 'skills', 'echo', 'skill.md'),
        'utf-8'
      );
      const document = await parseMarkdown(content, 'skill.md');
      const result = runLintRules(document);

      expect(result).toBeDefined();
      expect(result.path).toBe('skill.md');
    });
  });

  describe('End-to-end validation flow', () => {
    it('should validate a valid AGENTS.md file', async () => {
      const content = readFileSync(join(rootDir, 'examples', 'mcp-server', 'AGENTS.md'), 'utf-8');
      const document = await parseMarkdown(content, 'AGENTS.md');
      const result = validate(document, { strict: false });

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.type).toBe('agents');
    });

    it('should validate a valid SKILL.md file', async () => {
      const content = readFileSync(
        join(rootDir, 'examples', 'mcp-server', 'skills', 'echo', 'skill.md'),
        'utf-8'
      );
      const document = await parseMarkdown(content, 'skill.md');
      const result = validate(document, { strict: false });

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.type).toBe('skill');
    });

    it('should fail validation for invalid content', async () => {
      const content = '# Invalid\n\nJust a heading, no content.';
      const document = await parseMarkdown(content, 'invalid.md');
      const result = validate(document, { strict: true });

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Scaffold generation and validation', () => {
    it('should generate and validate new agent files', async () => {
      const config: ScaffoldConfig = {
        agentType: 'mcp',
        agentId: 'test-agent',
        displayName: 'Test Agent',
        version: '1.0.0',
        outputDir: testDir,
        overwrite: true,
        skills: [
          {
            skillId: 'test-skill',
            displayName: 'Test Skill',
            skillType: 'tool',
            description: 'A test skill',
          },
        ],
      };

      const result = generateFiles(config);

      expect(result.created.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);

      // Validate generated AGENTS.md
      const agentsMdPath = join(testDir, 'AGENTS.md');
      const agentsContent = readFileSync(agentsMdPath, 'utf-8');
      const agentsDoc = await parseMarkdown(agentsContent, agentsMdPath);
      const agentsValidation = validate(agentsDoc, { strict: false });

      expect(agentsValidation.valid).toBe(true);

      // Validate generated SKILL.md
      const skillMdPath = join(testDir, 'skills', 'test-skill', 'skill.md');
      const skillContent = readFileSync(skillMdPath, 'utf-8');
      const skillDoc = await parseMarkdown(skillContent, skillMdPath);
      const skillValidation = validate(skillDoc, { strict: false });

      expect(skillValidation.valid).toBe(true);
    });
  });

  describe('Batch processing', () => {
    it('should process multiple files', async () => {
      const examplesDir = join(rootDir, 'examples');
      const agentTypes = ['mcp-server', 'orchestrator', 'classifier', 'router', 'evaluator'];

      for (const type of agentTypes) {
        const agentsPath = join(examplesDir, type, 'AGENTS.md');
        const content = readFileSync(agentsPath, 'utf-8');
        const document = await parseMarkdown(content, agentsPath);
        const result = runLintRules(document);

        expect(result).toBeDefined();
        expect(result.path).toContain(type);
      }
    });
  });
});
