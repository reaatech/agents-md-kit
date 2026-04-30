/**
 * Scaffold command - generate new agent/skill files from templates
 */

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { ScaffoldConfig } from '@reaatech/agents-markdown';
import { reportScaffoldResult } from '@reaatech/agents-markdown-reporter';
import type { Command } from 'commander';
import { scaffoldAgent } from '../cli-utils.js';

export function scaffoldCommand(program: Command): void {
  program
    .command('scaffold')
    .description('Generate new agent and skill files from templates')
    .argument('<output>', 'Output directory for generated files')
    .option('--agent-id <id>', 'Agent identifier', 'my-agent')
    .option('--display-name <name>', 'Agent display name', 'My Agent')
    .option(
      '--agent-type <type>',
      'Agent type (mcp, orchestrator, classifier, router, evaluator)',
      'mcp'
    )
    .option('--description <desc>', 'Agent description')
    .option('--version <version>', 'Agent version', '1.0.0')
    .option('--skills <skills>', 'Comma-separated list of skill IDs', 'example')
    .option('--dry-run', 'Preview files without writing them', false)
    .option('--overwrite', 'Overwrite existing files', false)
    .action(
      async (
        output: string,
        options: {
          agentId: string;
          displayName: string;
          agentType: string;
          description?: string;
          version: string;
          skills: string;
          dryRun: boolean;
          overwrite: boolean;
        }
      ) => {
        const outputDir = path.resolve(output);
        if (!options.dryRun && !options.overwrite && (await hasVisibleFiles(outputDir))) {
          throw new Error(
            `Output directory is not empty: ${outputDir}. Use --overwrite to replace files.`
          );
        }

        const config = buildScaffoldConfig(outputDir, options);
        const result = scaffoldAgent(config, options.dryRun);

        if (options.dryRun) {
          const preview = result as Array<{ path: string; exists: boolean }>;
          const lines = preview.map((file) => `${file.exists ? 'EXISTS' : 'NEW'} ${file.path}`);
          process.stdout.write(`${lines.join('\n')}\n`);
          return;
        }

        const generated = result as {
          created: string[];
          skipped: string[];
          errors: Array<{ path: string; error: string }>;
        };
        process.stdout.write(
          `${reportScaffoldResult(generated.created, generated.skipped, generated.errors)}\n`
        );

        if (generated.errors.length > 0) {
          process.exit(1);
        }
      }
    );
}

function buildScaffoldConfig(
  outputDir: string,
  options: {
    agentId: string;
    displayName: string;
    agentType: string;
    description?: string;
    version: string;
    skills: string;
    overwrite: boolean;
  }
): ScaffoldConfig {
  const skills = options.skills
    .split(',')
    .map((skillId) => skillId.trim())
    .filter(Boolean)
    .map((skillId) => ({
      skillId,
      displayName: skillId
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      skillType: 'tool' as const,
      description: `A ${skillId} skill for ${options.displayName}`,
    }));

  return {
    agentType: options.agentType as import('@reaatech/agents-markdown').AgentType,
    agentId: options.agentId,
    displayName: options.displayName,
    version: options.version,
    outputDir,
    overwrite: options.overwrite,
    skills,
    ...(options.description !== undefined ? { description: options.description } : {}),
  };
}

async function hasVisibleFiles(targetDir: string): Promise<boolean> {
  try {
    const entries = await readdir(targetDir);
    return entries.some((entry) => !entry.startsWith('.'));
  } catch {
    return false;
  }
}
