/**
 * MCP tool: validate_skill_md
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseMarkdown } from '@reaatech/agents-markdown-parser';
import { validate } from '@reaatech/agents-markdown-validator';
import { z } from 'zod';

const inputSchema = z
  .object({
    content: z.string().optional(),
    filePath: z.string().optional(),
    strict: z.boolean().optional(),
  })
  .refine((value) => value.content !== undefined || value.filePath !== undefined, {
    message: 'Either content or filePath must be provided',
  });

export type ValidateMarkdownInput = z.infer<typeof inputSchema>;

async function validateMarkdown(args: ValidateMarkdownInput) {
  const parsed = inputSchema.parse(args);
  const filePath = parsed.filePath ?? 'input.md';
  const content = parsed.content ?? (await readFile(filePath, 'utf-8'));
  const document = await parseMarkdown(content, filePath);
  const result = validate(document, {
    strict: parsed.strict ?? false,
    basePath: path.dirname(filePath),
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

export type ValidateSkillMdInput = ValidateMarkdownInput;
export type ValidateAgentsMdInput = ValidateMarkdownInput;

export const validateSkillMdTool = {
  name: 'validate_skill_md',
  description: 'Validate AGENTS.md or SKILL.md content against the schema',
  inputSchema: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'Markdown content to validate' },
      filePath: { type: 'string', description: 'Path to a markdown file to validate' },
      strict: { type: 'boolean', description: 'Treat warnings as errors' },
    },
  },
  async handler(args: ValidateSkillMdInput) {
    try {
      return await validateMarkdown(args);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation operation failed';
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  },
};

export const validateAgentsMdTool = {
  name: 'validate_agents_md',
  description: 'Validate AGENTS.md or SKILL.md content against the schema',
  inputSchema: validateSkillMdTool.inputSchema,
  async handler(args: ValidateAgentsMdInput) {
    try {
      return await validateMarkdown(args);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation operation failed';
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  },
};
