/**
 * Performance tests for agents-md-kit
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runLintRules } from '@reaatech/agents-markdown-linter';
import { validate } from '@reaatech/agents-markdown-validator';
import { bench, describe, expect, it } from 'vitest';
import { parseMarkdown } from './markdown-parser.js';

describe('Performance Tests', () => {
  // Generate a large markdown file for testing
  function generateLargeMarkdown(sizeKB: number): string {
    let content =
      '---\nagent_id: perf-test\ndisplay_name: Performance Test\nversion: 1.0.0\n---\n\n# Performance Test Agent\n\n## What this is\n\nA test agent for performance benchmarking.\n\n';

    const sectionTemplate = `
## Section {n}

This is section {n} with some content to make the file larger.
It includes multiple paragraphs and various markdown elements.

### Subsection {n}.1

- List item 1
- List item 2
- List item 3

\`\`\`typescript
function example{n}() {{
  return "This is example {n}";
}}
\`\`\`

| Column A | Column B | Column C |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |
`;

    let currentSize = content.length;
    const targetSize = sizeKB * 1024;
    let n = 1;

    while (currentSize < targetSize) {
      const section = sectionTemplate.replace(/{n}/g, n.toString());
      content += section;
      currentSize = content.length;
      n++;
    }

    return content;
  }

  describe('Large file handling', () => {
    it('should parse a 100KB+ markdown file', async () => {
      const content = generateLargeMarkdown(100);
      const start = performance.now();

      const document = await parseMarkdown(content, 'large-test.md');

      const duration = performance.now() - start;

      expect(document).toBeDefined();
      expect(document.path).toBe('large-test.md');
      // Should complete in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should lint a 100KB+ markdown file', async () => {
      const content = generateLargeMarkdown(100);
      const document = await parseMarkdown(content, 'large-test.md');
      const start = performance.now();

      const result = runLintRules(document);

      const duration = performance.now() - start;

      expect(result).toBeDefined();
      // Should complete in under 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should validate a 100KB+ markdown file', async () => {
      const content = generateLargeMarkdown(100);
      const document = await parseMarkdown(content, 'large-test.md');
      const start = performance.now();

      const result = validate(document, { strict: false });

      const duration = performance.now() - start;

      expect(result).toBeDefined();
      // Should complete in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Batch processing performance', () => {
    it('should process 10+ files efficiently', async () => {
      const examplesDir = join(process.cwd(), 'examples', 'gallery');
      const skills = [
        'mcp-server/skills/echo/skill.md',
        'mcp-server/skills/data-query/skill.md',
        'mcp-server/skills/file-operation/skill.md',
        'orchestrator/skills/routing/skill.md',
        'orchestrator/skills/circuit-breaker/skill.md',
        'orchestrator/skills/session-management/skill.md',
        'classifier/skills/intent-classification/skill.md',
        'classifier/skills/confidence-scoring/skill.md',
        'classifier/skills/ambiguity-detection/skill.md',
        'router/skills/cost-optimization/skill.md',
        'router/skills/latency-optimization/skill.md',
        'router/skills/judgment-routing/skill.md',
        'evaluator/skills/confusion-matrix/skill.md',
        'evaluator/skills/llm-as-judge/skill.md',
        'evaluator/skills/regression-gates/skill.md',
      ];

      const start = performance.now();
      const results = [];

      for (const skillPath of skills) {
        const content = readFileSync(join(examplesDir, skillPath), 'utf-8');
        const document = await parseMarkdown(content, skillPath);
        const result = runLintRules(document);
        results.push(result);
      }

      const duration = performance.now() - start;

      expect(results.length).toBe(skills.length);
      // Should process all files in under 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });

  if (process.env.VITEST_BENCH === '1') {
    bench('parse small markdown', async () => {
      const content = '# Test\n\n## What this is\n\nSimple test content.';
      await parseMarkdown(content, 'test.md');
    });

    bench('parse medium markdown (10KB)', async () => {
      const content = generateLargeMarkdown(10);
      await parseMarkdown(content, 'medium-test.md');
    });

    bench('lint small markdown', async () => {
      const content = '# Test\n\n## What this is\n\nSimple test content.';
      const document = await parseMarkdown(content, 'test.md');
      runLintRules(document);
    });

    bench('validate small markdown', async () => {
      const content = '# Test\n\n## What this is\n\nSimple test content.';
      const document = await parseMarkdown(content, 'test.md');
      validate(document, { strict: false });
    });
  }
});
