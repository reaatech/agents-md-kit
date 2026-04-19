import { mkdtempSync, readFileSync } from 'fs';
import { rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  reportLintResult as reportConsoleLint,
  reportScaffoldResult,
  reportValidationResult as reportConsoleValidation,
} from '../src/reporter/console-reporter.js';
import {
  generateHtmlReport,
  writeHtmlReport,
} from '../src/reporter/html-reporter.js';
import {
  lintToJson,
  reportLintResult as reportJsonLint,
  reportValidationResult as reportJsonValidation,
  validationToJson,
} from '../src/reporter/json-reporter.js';
import {
  reportLintAsMarkdown,
  reportLintResult as reportMarkdownLint,
  reportValidationAsMarkdown,
  reportValidationResult as reportMarkdownValidation,
} from '../src/reporter/markdown-reporter.js';
import type { LintResult, ValidationResult } from '../src/types/domain.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe('reporters', () => {
  it('formats lint results for all reporters', () => {
    const lintResult: LintResult = {
      path: 'AGENTS.md',
      findings: [
        {
          rule: 'heading-order',
          severity: 'warning',
          message: 'Heading level skipped',
          location: { line: 3, column: 1 },
          suggestion: 'Add an h2 heading',
          autoFixable: true,
        },
      ],
      errorCount: 0,
      warningCount: 1,
      infoCount: 0,
      fixableCount: 1,
    };

    expect(reportConsoleLint(lintResult)).toContain('Heading level skipped');
    expect(lintToJson(lintResult).warningCount).toBe(1);
    expect(reportJsonLint(lintResult)).toContain('"path": "AGENTS.md"');
    expect(reportLintAsMarkdown(lintResult)).toContain('Lint Report');
    expect(reportMarkdownLint(lintResult)).toContain('heading-order');
    expect(generateHtmlReport([lintResult])).toContain('AGENTS.md');
  });

  it('formats validation and scaffold results', () => {
    const validationResult: ValidationResult = {
      valid: false,
      type: 'agents',
      path: 'AGENTS.md',
      errors: [
        {
          rule: 'heading-missing',
          severity: 'error',
          message: 'Missing section',
          location: { line: 5 },
          autoFixable: false,
        },
      ],
      warnings: [],
      suggestions: [],
    };

    expect(reportConsoleValidation(validationResult)).toContain('Validation Errors');
    expect(validationToJson(validationResult).errorCount).toBe(1);
    expect(reportJsonValidation(validationResult)).toContain('"valid": false');
    expect(reportValidationAsMarkdown(validationResult)).toContain('Validation Report');
    expect(reportMarkdownValidation(validationResult)).toContain('heading-missing');
    expect(reportScaffoldResult(['a'], ['b'], [{ path: 'c', error: 'boom' }])).toContain('Scaffold Results');
  });

  it('writes an html report to disk', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'agents-md-kit-reporter-'));
    tempDirs.push(dir);
    const outputPath = path.join(dir, 'report.html');

    await writeHtmlReport(
      [
        {
          path: 'AGENTS.md',
          findings: [],
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          fixableCount: 0,
        },
      ],
      outputPath
    );

    expect(readFileSync(outputPath, 'utf-8')).toContain('agents-md-kit Report');
  });

  it('renders validation suggestions section', () => {
    const validationResult: ValidationResult = {
      valid: true,
      type: 'agents',
      path: 'AGENTS.md',
      errors: [],
      warnings: [],
      suggestions: [
        {
          rule: 'style-suggestion',
          severity: 'suggestion',
          message: 'Consider rewording',
          location: { line: 10 },
          autoFixable: false,
        },
      ],
    };

    const output = reportConsoleValidation(validationResult);
    expect(output).toContain('Suggestions');
    expect(output).toContain('Consider rewording');
  });

  it('hides info and suggestions when verbose is false', () => {
    const lintResult: LintResult = {
      path: 'AGENTS.md',
      findings: [
        {
          rule: 'info-rule',
          severity: 'info',
          message: 'Info message',
          autoFixable: false,
        },
        {
          rule: 'suggestion-rule',
          severity: 'suggestion',
          message: 'Suggestion message',
          autoFixable: false,
        },
      ],
      errorCount: 0,
      warningCount: 0,
      infoCount: 1,
      fixableCount: 0,
    };

    const output = reportConsoleLint(lintResult, { verbose: false });
    expect(output).not.toContain('Info message');
    expect(output).not.toContain('Suggestion message');
  });

  it('shows info and suggestions when verbose is true', () => {
    const lintResult: LintResult = {
      path: 'AGENTS.md',
      findings: [
        {
          rule: 'info-rule',
          severity: 'info',
          message: 'Info message',
          autoFixable: false,
        },
        {
          rule: 'suggestion-rule',
          severity: 'suggestion',
          message: 'Suggestion message',
          autoFixable: false,
        },
      ],
      errorCount: 0,
      warningCount: 0,
      infoCount: 1,
      fixableCount: 0,
    };

    const output = reportConsoleLint(lintResult, { verbose: true });
    expect(output).toContain('Info message');
    expect(output).toContain('Suggestion message');
  });
});
