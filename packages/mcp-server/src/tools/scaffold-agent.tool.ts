/**
 * MCP tool: scaffold_agent
 */

import type { ScaffoldConfig } from '@reaatech/agents-markdown';
import { generateFiles } from '@reaatech/agents-markdown-scaffold';
import { z } from 'zod';

const inputSchema = z.object({
  agentId: z.string(),
  displayName: z.string(),
  agentType: z.enum(['mcp', 'orchestrator', 'classifier', 'router', 'evaluator']),
  description: z.string().optional(),
  version: z.string().optional(),
  outputDir: z.string(),
  overwrite: z.boolean().optional(),
  skills: z
    .array(
      z.object({
        skillId: z.string(),
        displayName: z.string(),
        skillType: z.enum(['tool', 'orchestration', 'evaluation', 'routing']),
        description: z.string().optional(),
      })
    )
    .optional(),
});

export type ScaffoldAgentInput = z.infer<typeof inputSchema>;

export const scaffoldAgentTool = {
  name: 'scaffold_agent',
  description: 'Generate AGENTS.md and SKILL.md files from templates',
  inputSchema: {
    type: 'object',
    properties: {
      agentId: { type: 'string' },
      displayName: { type: 'string' },
      agentType: {
        type: 'string',
        enum: ['mcp', 'orchestrator', 'classifier', 'router', 'evaluator'],
      },
      description: { type: 'string' },
      version: { type: 'string' },
      outputDir: { type: 'string' },
      overwrite: { type: 'boolean' },
      skills: { type: 'array' },
    },
    required: ['agentId', 'displayName', 'agentType', 'outputDir'],
  },
  async handler(args: ScaffoldAgentInput) {
    try {
      const parsed = inputSchema.parse(args);
      const config: ScaffoldConfig = {
        agentId: parsed.agentId,
        displayName: parsed.displayName,
        agentType: parsed.agentType,
        version: parsed.version ?? '1.0.0',
        outputDir: parsed.outputDir,
        overwrite: parsed.overwrite ?? false,
        skills: parsed.skills?.map((skill) => ({
          skillId: skill.skillId,
          displayName: skill.displayName,
          skillType: skill.skillType,
          ...(skill.description !== undefined ? { description: skill.description } : {}),
        })) ?? [
          {
            skillId: 'example',
            displayName: 'Example',
            skillType: 'tool',
            description: 'Generated example skill',
          },
        ],
        ...(parsed.description !== undefined ? { description: parsed.description } : {}),
      };

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(generateFiles(config), null, 2),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scaffold operation failed';
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  },
};
