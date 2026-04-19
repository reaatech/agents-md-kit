/**
 * Console reporter for lint and validation results
 */

import type { LintResult, ValidationResult, Finding } from '../types/domain.js';

const shouldColor = process.stdout.isTTY !== true && process.env.FORCE_COLOR === undefined;

function colorize(code: string, text: string): string {
  if (shouldColor) { return text; }
  return `${code}${text}${colors.reset}`;
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

/**
 * Format a finding for console output
 */
function formatFinding(finding: Finding): string {
  const severity = finding.severity.toUpperCase();
  let color = colors.gray;

  switch (finding.severity) {
    case 'error':
      color = colors.red;
      break;
    case 'warning':
      color = colors.yellow;
      break;
    case 'info':
      color = colors.blue;
      break;
    case 'suggestion':
      color = colors.magenta;
      break;
  }

  const location = finding.location
    ? `:${finding.location.line}${finding.location.column !== undefined ? ':' + finding.location.column : ''}`
    : '';

  let output = `${colorize(color, severity)}${location} - ${finding.message}`;

  if (finding.suggestion !== undefined) {
    output += `\n  ${colorize(colors.gray, `\u{1F4A1} ${finding.suggestion}`)}`;
  }

  return output;
}

/**
 * Report lint results to console
 */
export function reportLintResult(result: LintResult, options?: { verbose?: boolean }): string {
  const verbose = options?.verbose ?? true;
  const lines: string[] = [];

  // Header
  lines.push(`Linting: ${result.path}`);
  lines.push('');

  const errors = result.findings.filter((f) => f.severity === 'error');
  const warnings = result.findings.filter((f) => f.severity === 'warning');
  const info = result.findings.filter((f) => f.severity === 'info');
  const suggestions = result.findings.filter((f) => f.severity === 'suggestion');

  if (errors.length > 0) {
    lines.push(colorize(colors.red + colors.bold, `Errors (${errors.length}):`));
    for (const error of errors) {
      lines.push(`  ${formatFinding(error)}`);
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(colorize(colors.yellow + colors.bold, `Warnings (${warnings.length}):`));
    for (const warning of warnings) {
      lines.push(`  ${formatFinding(warning)}`);
    }
    lines.push('');
  }

  if (verbose && info.length > 0) {
    lines.push(colorize(colors.blue + colors.bold, `Info (${info.length}):`));
    for (const item of info) {
      lines.push(`  ${formatFinding(item)}`);
    }
    lines.push('');
  }

  if (verbose && suggestions.length > 0) {
    lines.push(colorize(colors.magenta + colors.bold, `Suggestions (${suggestions.length}):`));
    for (const suggestion of suggestions) {
      lines.push(`  ${formatFinding(suggestion)}`);
    }
    lines.push('');
  }

  const status = result.errorCount === 0 ? colorize(colors.green, '\u2713 Passed') : colorize(colors.red, '\u2717 Failed');
  lines.push(`${status} - ${result.errorCount} errors, ${result.warningCount} warnings, ${info.length} info`);

  if (result.fixableCount > 0) {
    lines.push(colorize(colors.gray, `\u{1F4A1} ${result.fixableCount} issues can be auto-fixed`));
  }

  return lines.join('\n');
}

/**
 * Report validation results to console
 */
export function reportValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  // Header
  const type = result.type === 'agents' ? 'AGENTS.md' : 'SKILL.md';
  lines.push(`Validating: ${result.path} (${type})`);
  lines.push('');

  const errors = result.errors;
  const warnings = result.warnings;
  const suggestions = result.suggestions;

  if (errors.length > 0) {
    lines.push(colorize(colors.red + colors.bold, `Validation Errors (${errors.length}):`));
    for (const error of errors) {
      lines.push(`  ${formatFinding(error)}`);
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(colorize(colors.yellow + colors.bold, `Warnings (${warnings.length}):`));
    for (const warning of warnings) {
      lines.push(`  ${formatFinding(warning)}`);
    }
    lines.push('');
  }

  if (suggestions.length > 0) {
    lines.push(colorize(colors.magenta + colors.bold, `Suggestions (${suggestions.length}):`));
    for (const suggestion of suggestions) {
      lines.push(`  ${formatFinding(suggestion)}`);
    }
    lines.push('');
  }

  const status = result.valid
    ? colorize(colors.green, '\u2713 Valid')
    : colorize(colors.red, '\u2717 Invalid');
  lines.push(`${status} - ${errors.length} errors, ${warnings.length} warnings`);

  return lines.join('\n');
}

/**
 * Report scaffold generation results
 */
export function reportScaffoldResult(
  created: string[],
  skipped: string[],
  errors: Array<{ path: string; error: string }>
): string {
  const lines: string[] = [];

  lines.push(colorize(colors.bold, 'Scaffold Results:'));
  lines.push('');

  if (created.length > 0) {
    lines.push(colorize(colors.green, `Created (${created.length}):`));
    for (const path of created) {
      lines.push(`  ${colorize(colors.green, '\u2713')} ${path}`);
    }
    lines.push('');
  }

  if (skipped.length > 0) {
    lines.push(colorize(colors.yellow, `Skipped (${skipped.length}):`));
    for (const path of skipped) {
      lines.push(`  ${colorize(colors.yellow, '\u2205')} ${path} (already exists)`);
    }
    lines.push('');
  }

  if (errors.length > 0) {
    lines.push(colorize(colors.red, `Errors (${errors.length}):`));
    for (const { path, error } of errors) {
      lines.push(`  ${colorize(colors.red, '\u2717')} ${path}`);
      lines.push(`    ${colorize(colors.gray, error)}`);
    }
    lines.push('');
  }

  const total = created.length + skipped.length + errors.length;
  lines.push(`Total: ${total} files - ${created.length} created, ${skipped.length} skipped, ${errors.length} errors`);

  return lines.join('\n');
}
