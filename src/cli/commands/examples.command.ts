/**
 * Examples command - list and show example AGENTS.md and SKILL.md files
 */

import { copyFile, mkdir, readFile, readdir } from 'fs/promises';
import path from 'path';
import { Command } from 'commander';

function getExamplesDir(): string {
  const envPath = process.env.AGENTS_MD_KIT_EXAMPLES;
  if (envPath !== undefined && envPath.length > 0) {
    return envPath;
  }
  return path.join(process.cwd(), 'examples/gallery');
}

export function examplesCommand(program: Command): void {
  program
    .command('examples')
    .description('List, show, or copy example AGENTS.md and SKILL.md files')
    .argument(
      '[type]',
      'Filter by agent type (mcp-server, orchestrator, classifier, router, evaluator)',
    )
    .option('--show <path>', 'Show a specific example file, for example mcp-server/AGENTS.md')
    .option('--copy <type>', 'Copy an example directory into the current working directory')
    .action(async (type?: string, options?: { show?: string; copy?: string }) => {
      const examplesDir = getExamplesDir();

      if (options?.show !== undefined) {
        const examplePath = path.resolve(examplesDir, options.show);
        if (!examplePath.startsWith(examplesDir + path.sep) && examplePath !== examplesDir) {
          throw new Error('Invalid path: path traversal detected');
        }
        process.stdout.write(await readFile(examplePath, 'utf-8'));
        return;
      }

      if (options?.copy !== undefined) {
        const sourceDir = path.resolve(examplesDir, options.copy);
        if (!sourceDir.startsWith(examplesDir + path.sep) && sourceDir !== examplesDir) {
          throw new Error('Invalid path: path traversal detected');
        }
        const destinationDir = path.join(process.cwd(), path.basename(options.copy));
        await copyDirectory(sourceDir, destinationDir);
        process.stdout.write(`Copied ${sourceDir} to ${destinationDir}\n`);
        return;
      }

      const availableTypes = await listAgentTypes(examplesDir);
      if (type !== undefined) {
        if (!availableTypes.includes(type)) {
          throw new Error(`Unknown example type: ${type}`);
        }

        process.stdout.write(`${await describeAgentType(type, examplesDir)}\n`);
        return;
      }

      const descriptions = await Promise.all(
        availableTypes.map((agentType) => describeAgentType(agentType, examplesDir)),
      );
      process.stdout.write(`${descriptions.join('\n\n')}\n`);
    });
}

async function listAgentTypes(examplesDir: string): Promise<string[]> {
  const entries = await readdir(examplesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
}

async function describeAgentType(type: string, examplesDir: string): Promise<string> {
  const typeDir = path.join(examplesDir, type);
  const skillsDir = path.join(typeDir, 'skills');
  const skillsEntries = await readdir(skillsDir, { withFileTypes: true }).catch(() => []);
  const skills = skillsEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const agentsMdPath = path.join(typeDir, 'AGENTS.md');
  const content = await readFile(agentsMdPath, 'utf-8');
  const description =
    content
      .match(/## What this is\s+([\s\S]*?)(?:\n## |\n$)/)?.[1]
      ?.trim()
      .split('\n')[0] ?? 'Example agent implementation';

  return [
    `${type}`,
    `Description: ${description}`,
    `Skills: ${skills.join(', ')}`,
    `Files: AGENTS.md${skills.map((skill) => `, skills/${skill}/skill.md`).join('')}`,
  ].join('\n');
}

async function copyDirectory(sourceDir: string, destinationDir: string): Promise<void> {
  await mkdir(destinationDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
      continue;
    }

    await copyFile(sourcePath, destinationPath);
  }
}
