#!/usr/bin/env node
/**
 * agents-md-kit — CLI entry point
 */

import { Command } from 'commander';
import {
  examplesCommand,
  formatCommand,
  lintCommand,
  scaffoldCommand,
  validateCommand,
} from './commands/index.js';
import { VERSION } from './index.js';

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('agents-md-kit')
    .description('Linter, validator, and scaffolding tool for AGENTS.md and SKILL.md files')
    .version(VERSION);

  lintCommand(program);
  validateCommand(program);
  scaffoldCommand(program);
  formatCommand(program);
  examplesCommand(program);

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Error: ${message}\n`);
  process.exit(3);
});
