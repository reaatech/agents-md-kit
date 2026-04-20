/**
 * Format command - auto-fix formatting issues in markdown files
 */

import { writeFile } from 'fs/promises';
import { Command } from 'commander';
import {
  applyFixesToFile,
  findMarkdownFiles,
  getFixableRules,
  lintFile,
  pathIsDirectory,
} from '../cli-utils.js';

export function formatCommand(program: Command): void {
  program
    .command('format')
    .description('Auto-fix formatting issues in AGENTS.md and SKILL.md files')
    .argument('<path>', 'File or directory to format')
    .option('--dry-run', 'Show what would change without writing files', false)
    .option('--rules <rules>', 'Comma-separated list of rules to apply (default: all fixable)')
    .action(async (targetPath: string, options: { dryRun: boolean; rules?: string }) => {
      const ruleIds =
        options.rules !== undefined
          ? options.rules
              .split(',')
              .map((rule) => rule.trim())
              .filter(Boolean)
          : getFixableRules();

      const files = await resolveTargetFiles(targetPath);
      let appliedCount = 0;

      for (const file of files) {
        const lintResult = await lintFile(file);
        const applicableRuleIds = lintResult.findings
          .filter((finding) => finding.autoFixable && ruleIds.includes(finding.rule))
          .map((finding) => finding.rule);

        if (applicableRuleIds.length === 0) {
          continue;
        }

        const { original, fixed } = await applyFixesToFile(file, applicableRuleIds);
        if (original === fixed) {
          continue;
        }

        appliedCount += applicableRuleIds.length;

        if (options.dryRun) {
          process.stdout.write(`WOULD_FIX ${file} ${applicableRuleIds.join(', ')}\n`);
          continue;
        }

        await writeFile(file, fixed, 'utf-8');
        process.stdout.write(`FIXED ${file} ${applicableRuleIds.join(', ')}\n`);
      }

      process.stdout.write(`${options.dryRun ? 'Would fix' : 'Fixed'} ${appliedCount} issue(s)\n`);
    });
}

async function resolveTargetFiles(targetPath: string): Promise<string[]> {
  if (await pathIsDirectory(targetPath)) {
    return findMarkdownFiles(targetPath);
  }

  return [targetPath];
}
