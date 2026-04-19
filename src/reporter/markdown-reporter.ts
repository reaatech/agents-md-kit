/**
 * Markdown reporter for PR comments and documentation
 */

import type { LintResult, ValidationResult } from '../types/domain.js';

export function reportLintAsMarkdown(result: LintResult): string {
  const lines: string[] = [];
  const status = result.errorCount === 0 ? '✅' : '❌';

  lines.push(`## ${status} Lint Report: \`${result.path}\``);
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push(`| Errors | ${result.errorCount} |`);
  lines.push(`| Warnings | ${result.warningCount} |`);
  lines.push(`| Info | ${result.infoCount} |`);
  lines.push(`| Fixable | ${result.fixableCount} |`);
  lines.push('');

  for (const finding of result.findings) {
    const location = finding.location ? ` (line ${finding.location.line})` : '';
    lines.push(`- **${finding.severity}** \`${finding.rule}\`${location}: ${finding.message}`);
    if (finding.suggestion !== undefined) {
      lines.push(`  Suggestion: ${finding.suggestion}`);
    }
  }

  return lines.join('\n');
}

export function reportValidationAsMarkdown(result: ValidationResult): string {
  const lines: string[] = [];
  const status = result.valid ? '✅' : '❌';

  lines.push(`## ${status} Validation Report: \`${result.path}\` (${result.type})`);
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push(`| Errors | ${result.errors.length} |`);
  lines.push(`| Warnings | ${result.warnings.length} |`);
  lines.push(`| Suggestions | ${result.suggestions.length} |`);
  lines.push('');

  for (const finding of [...result.errors, ...result.warnings, ...result.suggestions]) {
    const location = finding.location ? ` (line ${finding.location.line})` : '';
    lines.push(`- **${finding.severity}** \`${finding.rule}\`${location}: ${finding.message}`);
    if (finding.suggestion !== undefined) {
      lines.push(`  Suggestion: ${finding.suggestion}`);
    }
  }

  return lines.join('\n');
}

export function reportLintResult(results: LintResult | LintResult[]): string {
  const items = Array.isArray(results) ? results : [results];
  return items.map((result) => reportLintAsMarkdown(result)).join('\n\n');
}

export function reportValidationResult(results: ValidationResult | ValidationResult[]): string {
  const items = Array.isArray(results) ? results : [results];
  return items.map((result) => reportValidationAsMarkdown(result)).join('\n\n');
}
