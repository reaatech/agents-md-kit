/**
 * HTML reporter for lint results
 */

import { writeFile as writeFileAsync } from 'fs/promises';
import type { LintResult } from '../types/domain.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface HtmlReportOptions {
  title?: string;
}

export function generateHtmlReport(results: LintResult[], options: HtmlReportOptions = {}): string {
  const { title = 'agents-md-kit Report' } = options;
  const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
  const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);
  const totalInfo = results.reduce((sum, result) => sum + result.infoCount, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; color: #111827; background: #f9fafb; }
    .summary { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .card { background: white; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.75rem; min-width: 8rem; }
    .file { background: white; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem; }
    .finding { margin: 0.5rem 0; }
    .error { color: #b91c1c; }
    .warning { color: #b45309; }
    .info { color: #1d4ed8; }
    .suggestion { color: #7c3aed; }
    code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 0.25rem; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="summary">
    <div class="card"><strong>Errors</strong><div>${totalErrors}</div></div>
    <div class="card"><strong>Warnings</strong><div>${totalWarnings}</div></div>
    <div class="card"><strong>Info</strong><div>${totalInfo}</div></div>
  </div>
  ${results
    .map(
      (result) => `<section class="file">
    <h2>${escapeHtml(result.path)}</h2>
    <p>${result.errorCount} errors, ${result.warningCount} warnings, ${result.infoCount} info</p>
    ${
      result.findings.length === 0
        ? '<p>No issues found.</p>'
        : result.findings
            .map(
              (finding) => `<div class="finding ${finding.severity}">
      <strong>${finding.severity.toUpperCase()}</strong> <code>${escapeHtml(finding.rule)}</code>${
        finding.location ? ` line ${finding.location.line}` : ''
      }: ${escapeHtml(finding.message)}${finding.suggestion !== undefined ? `<div>${escapeHtml(finding.suggestion)}</div>` : ''}
    </div>`
            )
            .join('')
    }
  </section>`
    )
    .join('')}
</body>
</html>`;
}

export function reportLintResult(results: LintResult | LintResult[]): string {
  return generateHtmlReport(Array.isArray(results) ? results : [results]);
}

export function writeHtmlReport(
  results: LintResult[],
  outputPath: string,
  options: HtmlReportOptions = {}
): Promise<void> {
  return writeFileAsync(outputPath, generateHtmlReport(results, options), 'utf-8');
}
