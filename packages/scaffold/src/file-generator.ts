/**
 * File generation for scaffold operations
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ScaffoldConfig } from '@reaatech/agents-markdown';
import { compileTemplate, loadTemplate } from './template-engine.js';

/**
 * Result of a file generation operation
 */
export interface GenerateResult {
  /** Files that were created */
  created: string[];
  /** Files that were skipped (already existed) */
  skipped: string[];
  /** Files that encountered errors */
  errors: Array<{ path: string; error: string }>;
}

/**
 * Agent type descriptions for templates
 */
const agentTypeDescriptions: Record<string, string> = {
  mcp: 'provide MCP server capabilities',
  orchestrator: 'coordinate multiple agents and skills',
  classifier: 'classify intents and route requests',
  router: 'route requests to appropriate LLMs or services',
  evaluator: 'evaluate agent performance and quality',
};

/**
 * Skill type descriptions for templates
 */
const skillTypeDescriptions: Record<string, string> = {
  tool: 'execute specific tools and operations',
  orchestration: 'coordinate complex workflows',
  evaluation: 'assess quality and performance',
  routing: 'route requests based on criteria',
};

/**
 * Generate files from a scaffold configuration
 */
export function generateFiles(config: ScaffoldConfig): GenerateResult {
  const result: GenerateResult = {
    created: [],
    skipped: [],
    errors: [],
  };

  // Create output directory if it doesn't exist
  try {
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
  } catch (err) {
    result.errors.push({
      path: config.outputDir,
      error: (err as Error).message,
    });
    return result;
  }

  // Generate AGENTS.md
  const agentsMdPath = path.join(config.outputDir, 'AGENTS.md');
  try {
    if (fs.existsSync(agentsMdPath) && config.overwrite !== true) {
      result.skipped.push(agentsMdPath);
    } else {
      const template = loadTemplate('agents-md');
      const context = buildAgentsMdContext(config);
      const content = compileTemplate(template, context);
      fs.writeFileSync(agentsMdPath, content, 'utf-8');
      result.created.push(agentsMdPath);
    }
  } catch (err) {
    result.errors.push({
      path: agentsMdPath,
      error: (err as Error).message,
    });
  }

  // Generate skill files
  for (const skill of config.skills) {
    const skillDir = path.join(config.outputDir, 'skills', skill.skillId);
    const skillMdPath = path.join(skillDir, 'skill.md');

    try {
      if (!fs.existsSync(skillDir)) {
        fs.mkdirSync(skillDir, { recursive: true });
      }

      if (fs.existsSync(skillMdPath) && config.overwrite !== true) {
        result.skipped.push(skillMdPath);
      } else {
        const template = loadTemplate('skill-md');
        const context = buildSkillMdContext(config, skill);
        const content = compileTemplate(template, context);
        fs.writeFileSync(skillMdPath, content, 'utf-8');
        result.created.push(skillMdPath);
      }
    } catch (err) {
      result.errors.push({
        path: skillMdPath,
        error: (err as Error).message,
      });
    }
  }

  return result;
}

/**
 * Build template context for AGENTS.md
 */
function buildAgentsMdContext(config: ScaffoldConfig): Record<string, string | string[]> {
  const agentType = config.agentType;
  const firstSkill = config.skills[0];

  return {
    agentId: config.agentId,
    displayName: config.displayName,
    version: config.version ?? '1.0.0',
    description: config.description ?? `An ${agentType} agent built with agents-md-kit`,
    agentType,
    agentTypeDescription: agentTypeDescriptions[agentType] ?? 'provide agent capabilities',
    confidenceThreshold: '0.9',
    skillId: firstSkill?.skillId ?? 'example',
    skills: config.skills.map((s) => s.skillId),
  };
}

/**
 * Build template context for SKILL.md
 */
function buildSkillMdContext(
  config: ScaffoldConfig,
  skill: { skillId: string; displayName: string; skillType: string; description?: string }
): Record<string, string | string[]> {
  return {
    skillId: skill.skillId,
    displayName: skill.displayName,
    version: config.version ?? '1.0.0',
    description: skill.description ?? `A ${skill.skillType} skill for ${config.displayName}`,
    skillType: skill.skillType,
    skillTypeDescription: skillTypeDescriptions[skill.skillType] ?? 'provide skill capabilities',
  };
}

/**
 * Preview what files would be generated without creating them
 */
export function previewGeneration(config: ScaffoldConfig): { path: string; exists: boolean }[] {
  const files: { path: string; exists: boolean }[] = [];

  // AGENTS.md
  const agentsMdPath = path.join(config.outputDir, 'AGENTS.md');
  files.push({
    path: agentsMdPath,
    exists: fs.existsSync(agentsMdPath),
  });

  // Skill files
  for (const skill of config.skills) {
    const skillMdPath = path.join(config.outputDir, 'skills', skill.skillId, 'skill.md');
    files.push({
      path: skillMdPath,
      exists: fs.existsSync(skillMdPath),
    });
  }

  return files;
}
