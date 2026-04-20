/**
 * Lint command - lint AGENTS.md and SKILL.md files
 */

import { writeFile } from 'fs/promises';
import { Command } from 'commander';
import { filterLintResult, lintDirectory, lintFile, pathIsDirectory } from '../cli-utils.js';
import { reportLintResult as reportConsoleLint } from '../../reporter/console-reporter.js';
import { reportLintResult as reportHtmlLint } from '../../reporter/html-reporter.js';
import { reportLintResult as reportJsonLint } from '../../reporter/json-reporter.js';
import { reportLintResult as reportMarkdownLint } from '../../reporter/markdown-reporter.js';
import type { LintResult, OutputFormat, Severity } from '../../types/domain.js';
import { recordOperation } from '../../observability/metrics.js';
import * as logger from '../../observability/logger.js';

const FAIL_ON_ORDER: Record<'error' | 'warning' | 'info', number> = {
  error: 0,
  warning: 1,
  info: 2,
};

const RESULT_SEVERITY_ORDER: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  suggestion: 3,
};

export function lintCommand(program: Command): void {
  program
    .command('lint')
    .description('Lint AGENTS.md and SKILL.md files')
    .argument('<path>', 'File or directory to lint')
    .option('-f, --format <format>', 'Output format (console, json, html, markdown)', 'console')
    .option('-o, --output <file>', 'Write the report to a file instead of stdout')
    .option(
      '-s, --severity <level>',
      'Minimum severity to report (error, warning, info, suggestion)',
      'info',
    )
    .option('--fail-on <level>', 'Exit non-zero on findings at or above this severity', 'error')
    .action(
      async (
        targetPath: string,
        options: {
          format: OutputFormat;
          output?: string;
          severity: Severity;
          failOn: 'error' | 'warning' | 'info';
        },
      ) => {
        await recordOperation('lint', async () => {
          logger.info('lint', `Linting ${targetPath}`);

          const results = await collectLintResults(targetPath);
          const filteredResults = results.map((result) =>
            filterLintResult(result, options.severity),
          );
          const output = formatLintResults(filteredResults, options.format);

          if (options.output !== undefined) {
            await writeFile(options.output, output, 'utf-8');
          } else {
            process.stdout.write(`${output}\n`);
          }

          const shouldFail = filteredResults.some((result) =>
            result.findings.some(
              (finding) => RESULT_SEVERITY_ORDER[finding.severity] <= FAIL_ON_ORDER[options.failOn],
            ),
          );

          if (shouldFail) {
            const hasErrors = filteredResults.some((result) =>
              result.findings.some((finding) => finding.severity === 'error'),
            );
            process.exit(hasErrors ? 1 : 2);
          }

          logger.info('lint', `Completed linting ${targetPath}`, {
            errors: filteredResults.reduce((sum, r) => sum + r.errorCount, 0),
            warnings: filteredResults.reduce((sum, r) => sum + r.warningCount, 0),
          });
        });
      },
    );
}

async function collectLintResults(targetPath: string): Promise<LintResult[]> {
  if (await pathIsDirectory(targetPath)) {
    return lintDirectory(targetPath);
  }

  return [await lintFile(targetPath)];
}

function formatLintResults(results: LintResult[], format: OutputFormat): string {
  switch (format) {
    case 'json':
      return reportJsonLint(results);
    case 'html':
      return reportHtmlLint(results);
    case 'markdown':
      return reportMarkdownLint(results);
    case 'console':
    default:
      return results.map((result) => reportConsoleLint(result)).join('\n\n');
  }
}
