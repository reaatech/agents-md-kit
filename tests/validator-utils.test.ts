import { describe, expect, it } from 'vitest';
import {
  createErrorReport,
  formatFinding,
  formatFindingsGrouped,
  formatValidationSummary,
  formatWithContext,
  getAutoFixableFindings,
} from '../src/validator/error-formatter.js';
import { createError, createFixableFinding } from '../src/validator/schema-validator.js';
import {
  AgentsMdFrontmatterSchema,
  SkillMdFrontmatterSchema,
} from '../src/types/schemas.js';
import type { ValidationResult } from '../src/types/domain.js';

describe('validator helpers', () => {
  it('formats findings and reports', () => {
    const finding = createFixableFinding(
      'rule',
      'warning',
      'Something happened',
      { line: 2, column: 4 },
      'Fix it',
      { type: 'replace', line: 2, content: 'replacement' }
    );
    const result: ValidationResult = {
      valid: false,
      type: 'agents',
      path: 'AGENTS.md',
      errors: [createError('error', 'Bad thing', { line: 1 })],
      warnings: [finding],
      suggestions: [],
    };

    expect(formatFinding(finding)).toContain('Something happened');
    expect(formatValidationSummary(result)).toContain('invalid');
    expect(formatFindingsGrouped([finding])).toContain('Warnings');
    expect(formatWithContext(finding, 'line1\nline2\nline3')).toContain('Context');
    expect(createErrorReport([result], { includeContext: true, content: 'a\nb\nc' })).toContain('SUMMARY');
    expect(getAutoFixableFindings([result])).toHaveLength(1);
  });

  it('validates zod schemas', () => {
    expect(() =>
      AgentsMdFrontmatterSchema.parse({
        agent_id: 'agent',
        display_name: 'Agent',
        version: '1.0.0',
        description: 'A valid description',
      })
    ).not.toThrow();

    expect(() =>
      SkillMdFrontmatterSchema.parse({
        skill_id: 'skill',
        display_name: 'Skill',
        version: '1.0.0',
        description: 'A valid description',
        category: 'tool',
      })
    ).not.toThrow();
  });
});
