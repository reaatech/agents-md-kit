/**
 * Error message formatting for validation results
 */

import type { Finding, Severity, ValidationResult } from '@reaatech/agents-markdown';

/**
 * Format a single finding as a human-readable string
 */
export function formatFinding(finding: Finding): string {
  const parts: string[] = [];

  // Severity and rule
  const severityIcon = getSeverityIcon(finding.severity);
  parts.push(`${severityIcon} [${finding.rule}]`);

  // Message
  parts.push(finding.message);

  // Location
  if (finding.location) {
    const loc = finding.location;
    if (loc.line !== undefined) {
      const location =
        loc.column !== undefined ? `line ${loc.line}:${loc.column}` : `line ${loc.line}`;
      parts.push(`(${location})`);
    }
  }

  // Suggestion
  if (finding.suggestion !== undefined) {
    parts.push(`\n  → ${finding.suggestion}`);
  }

  // Auto-fix indicator
  if (finding.autoFixable) {
    parts.push(' [auto-fixable]');
  }

  return parts.join(' ');
}

/**
 * Get icon for severity level
 */
function getSeverityIcon(severity: Severity): string {
  switch (severity) {
    case 'error':
      return '✖';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    case 'suggestion':
      return '💡';
    default:
      return '•';
  }
}

/**
 * Format validation result as a summary string
 */
export function formatValidationSummary(result: ValidationResult): string {
  const parts: string[] = [];

  // File path
  parts.push(result.path);

  // Status
  if (result.valid) {
    parts.push('✓ valid');
  } else {
    parts.push('✗ invalid');
  }

  // Counts
  const counts = [
    result.errors.length > 0 ? `${result.errors.length} error(s)` : null,
    result.warnings.length > 0 ? `${result.warnings.length} warning(s)` : null,
    result.suggestions.length > 0 ? `${result.suggestions.length} suggestion(s)` : null,
  ].filter(Boolean);

  if (counts.length > 0) {
    parts.push(`(${counts.join(', ')})`);
  }

  return parts.join(' ');
}

/**
 * Format all findings grouped by severity
 */
export function formatFindingsGrouped(findings: Finding[]): string {
  const lines: string[] = [];

  // Group by severity
  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warning');
  const info = findings.filter((f) => f.severity === 'info');
  const suggestions = findings.filter((f) => f.severity === 'suggestion');

  if (errors.length > 0) {
    lines.push('\n❌ Errors:');
    for (const error of errors) {
      lines.push(`  ${formatFinding(error)}`);
    }
  }

  if (warnings.length > 0) {
    lines.push('\n⚠️  Warnings:');
    for (const warning of warnings) {
      lines.push(`  ${formatFinding(warning)}`);
    }
  }

  if (info.length > 0) {
    lines.push('\nℹ️  Info:');
    for (const item of info) {
      lines.push(`  ${formatFinding(item)}`);
    }
  }

  if (suggestions.length > 0) {
    lines.push('\n💡 Suggestions:');
    for (const item of suggestions) {
      lines.push(`  ${formatFinding(item)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format validation result with context snippet
 */
export function formatWithContext(finding: Finding, content: string, contextLines = 2): string {
  const lines: string[] = [];

  lines.push(formatFinding(finding));

  // Add context snippet
  if (finding.location?.line !== undefined && content.length > 0) {
    const allLines = content.split('\n');
    const lineNum = finding.location.line;
    const start = Math.max(0, lineNum - contextLines - 1);
    const end = Math.min(allLines.length, lineNum + contextLines);

    lines.push('\n  Context:');
    for (let i = start; i < end; i++) {
      const line = allLines[i] ?? '';
      const prefix = i + 1 === lineNum ? '  > ' : '    ';
      const lineNumStr = String(i + 1).padStart(4);
      lines.push(`  ${lineNumStr} ${prefix}${line}`);
    }
  }

  return lines.join('\n');
}

/**
 * Create a detailed error report
 */
export function createErrorReport(
  results: ValidationResult[],
  options: { includeContext?: boolean; content?: string } = {}
): string {
  const { includeContext = false, content = '' } = options;
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('VALIDATION REPORT');
  lines.push('='.repeat(60));

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalSuggestions = 0;

  for (const result of results) {
    lines.push(`\n${formatValidationSummary(result)}`);
    lines.push('-'.repeat(40));

    const allFindings = [...result.errors, ...result.warnings, ...result.suggestions];

    if (allFindings.length === 0) {
      lines.push('  No issues found ✓');
    } else {
      for (const finding of allFindings) {
        if (includeContext && content) {
          lines.push(formatWithContext(finding, content));
        } else {
          lines.push(formatFinding(finding));
        }
      }
    }

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    totalSuggestions += result.suggestions.length;
  }

  lines.push(`\n${'='.repeat(60)}`);
  lines.push('SUMMARY');
  lines.push('='.repeat(60));
  lines.push(`Files checked: ${results.length}`);
  lines.push(`Errors: ${totalErrors}`);
  lines.push(`Warnings: ${totalWarnings}`);
  lines.push(`Suggestions: ${totalSuggestions}`);

  if (totalErrors === 0 && totalWarnings === 0) {
    lines.push('\n✅ All checks passed!');
  } else if (totalErrors === 0) {
    lines.push(`\n⚠️  ${totalWarnings} warning(s) found`);
  } else {
    lines.push(`\n❌ ${totalErrors} error(s) found`);
  }

  return lines.join('\n');
}

/**
 * Get auto-fixable findings from results
 */
export function getAutoFixableFindings(results: ValidationResult[]): Finding[] {
  return results
    .flatMap((r) => [...r.errors, ...r.warnings, ...r.suggestions])
    .filter((f) => f.autoFixable && f.fix !== undefined);
}
