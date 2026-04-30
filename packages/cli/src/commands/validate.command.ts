/**
 * Validate command - validate AGENTS.md and SKILL.md files against schema
 */

import { writeFile } from 'node:fs/promises';
import type { OutputFormat, ValidationResult } from '@reaatech/agents-markdown';
import {
  reportValidationResult as reportConsoleValidation,
  reportJsonValidationResult as reportJsonValidation,
  reportMarkdownValidationResult as reportMarkdownValidation,
} from '@reaatech/agents-markdown-reporter';
import type { Command } from 'commander';
import { pathIsDirectory, validateDirectory, validateFile } from '../cli-utils.js';

export function validateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate AGENTS.md and SKILL.md files against schema')
    .argument('<path>', 'File or directory to validate')
    .option('-f, --format <format>', 'Output format (console, json, markdown)', 'console')
    .option('-o, --output <file>', 'Write the report to a file instead of stdout')
    .option('--strict', 'Treat warnings as errors', false)
    .action(
      async (
        targetPath: string,
        options: {
          format: Exclude<OutputFormat, 'html'>;
          output?: string;
          strict: boolean;
        }
      ) => {
        const results = await collectValidationResults(targetPath, options.strict);
        const output = formatValidationResults(results, options.format);

        if (options.output !== undefined) {
          await writeFile(options.output, output, 'utf-8');
        } else {
          process.stdout.write(`${output}\n`);
        }

        if (results.some((result) => !result.valid)) {
          process.exit(1);
        }
      }
    );
}

async function collectValidationResults(
  targetPath: string,
  strict: boolean
): Promise<ValidationResult[]> {
  if (await pathIsDirectory(targetPath)) {
    return validateDirectory(targetPath, strict);
  }

  return [await validateFile(targetPath, strict)];
}

function formatValidationResults(
  results: ValidationResult[],
  format: Exclude<OutputFormat, 'html'>
): string {
  switch (format) {
    case 'json':
      return reportJsonValidation(results);
    case 'markdown':
      return reportMarkdownValidation(results);
    default:
      return results.map((result) => reportConsoleValidation(result)).join('\n\n');
  }
}
