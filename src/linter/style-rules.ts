/**
 * Style linting rules for markdown files
 *
 * Note: registerRule is imported for side effects (rule registration)
 */

import { registerRule } from './rules-engine.js';
import type { LintRule } from './rules-engine.js';

/**
 * Rule: heading-order
 * Check that heading levels are not skipped (e.g., h1 -> h3 without h2)
 */
const headingOrderRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const lines = document.raw.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const match = line.match(/^(#{1,6})\s/);
    if (!match) {
      continue;
    }

    const currentLevel = (match[1] as string).length;

    // Check if we skipped any heading levels
    // Look at previous headings to find the last one
    for (let j = i - 1; j >= 0; j--) {
      const prevLine = lines[j] ?? '';
      const prevMatch = prevLine.match(/^(#{1,6})\s/);
      if (prevMatch !== null) {
        const prevLevel = (prevMatch[1] as string).length;
        if (currentLevel > prevLevel + 1 && prevLevel >= 1) {
          findings.push({
            ruleId: 'heading-order',
            severity: 'warning',
            message: `Heading level skipped: found h${currentLevel} after h${prevLevel}`,
            line: i + 1,
            suggestion: `Add h${prevLevel + 1} heading before this section`,
          });
        }
        break;
      }
    }
  }

  return findings;
};

registerRule('style', 'heading-order', headingOrderRule, {
  id: 'heading-order',
  description: 'Heading levels should not be skipped',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: no-code-language
 * Check that code blocks have a language identifier
 */
const noCodeLanguageRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const codeBlocks = document.codeBlocks ?? [];

  for (const block of codeBlocks) {
    if (block.language === undefined || block.language.trim() === '') {
      findings.push({
        ruleId: 'no-code-language',
        severity: 'warning',
        message: 'Code block missing language identifier',
        line: block.location?.line,
        suggestion: 'Add a language identifier (e.g., ```typescript)',
      });
    }
  }

  return findings;
};

registerRule('style', 'no-code-language', noCodeLanguageRule, {
  id: 'no-code-language',
  description: 'Code blocks should have a language identifier',
  severity: 'warning',
  autoFixable: true,
});

/**
 * Rule: trailing-whitespace
 * Check for trailing whitespace on lines
 */
const trailingWhitespaceRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const lines = document.raw.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (line !== line.trimEnd()) {
      findings.push({
        ruleId: 'trailing-whitespace',
        severity: 'info',
        message: 'Trailing whitespace detected',
        line: i + 1,
        suggestion: 'Remove trailing whitespace',
      });
    }
  }

  return findings;
};

registerRule('style', 'trailing-whitespace', trailingWhitespaceRule, {
  id: 'trailing-whitespace',
  description: 'Lines should not have trailing whitespace',
  severity: 'info',
  autoFixable: true,
});

/**
 * Rule: line-too-long
 * Check for lines exceeding maximum length
 */
const lineTooLongRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const lines = document.raw.split('\n');
  const maxLength = 120;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (line.length > maxLength) {
      findings.push({
        ruleId: 'line-too-long',
        severity: 'info',
        message: `Line exceeds ${maxLength} characters (${line.length} chars)`,
        line: i + 1,
      });
    }
  }

  return findings;
};

registerRule('style', 'line-too-long', lineTooLongRule, {
  id: 'line-too-long',
  description: `Lines should not exceed 120 characters`,
  severity: 'info',
  autoFixable: false,
});

/**
 * Rule: table-format
 * Check for consistent table formatting
 */
const tableFormatRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const tables = document.tables ?? [];

  for (const table of tables) {
    // Check if all rows have the same number of columns as headers
    const expectedCols = table.headers.length;
    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      if (row && row.length !== expectedCols) {
        findings.push({
          ruleId: 'table-format',
          severity: 'warning',
          message: `Table row ${i + 1} has ${row.length} columns, expected ${expectedCols}`,
          line: table.location?.line,
          suggestion: 'Ensure all table rows have the same number of columns as the header',
        });
      }
    }
  }

  return findings;
};

registerRule('style', 'table-format', tableFormatRule, {
  id: 'table-format',
  description: 'Table rows should have consistent column counts',
  severity: 'warning',
  autoFixable: true,
});

/**
 * Rule: list-format
 * Check for consistent list formatting (mixing - and * markers)
 */
const listFormatRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const lines = document.raw.split('\n');

  let firstMarker: string | null = null;
  let firstMarkerLine: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const match = line.match(/^(\s*)([-*+])\s/);
    if (!match) {
      continue;
    }

    const marker = match[2] as string;

    if (firstMarker === null) {
      firstMarker = marker;
      firstMarkerLine = i + 1;
    } else if (marker !== firstMarker) {
      findings.push({
        ruleId: 'list-format',
        severity: 'warning',
        message: `Inconsistent list marker '${marker}' (first list uses '${firstMarker}' at line ${firstMarkerLine})`,
        line: i + 1,
        suggestion: `Use '${firstMarker}' consistently for unordered list items`,
      });
    }
  }

  return findings;
};

registerRule('style', 'list-format', listFormatRule, {
  id: 'list-format',
  description: 'List markers should be consistent throughout the document',
  severity: 'warning',
  autoFixable: false,
});
