/**
 * MCP tool: lint_agents_md
 */

import { readFile } from 'node:fs/promises';
import type { Severity } from '@reaatech/agents-markdown';
import { runLintRules } from '@reaatech/agents-markdown-linter';
import { parseMarkdown } from '@reaatech/agents-markdown-parser';
import { z } from 'zod';

const severityOrder: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  suggestion: 3,
};

const inputSchema = z
  .object({
    content: z.string().optional(),
    filePath: z.string().optional(),
    severity: z.enum(['error', 'warning', 'info', 'suggestion']).optional(),
  })
  .refine((value) => value.content !== undefined || value.filePath !== undefined, {
    message: 'Either content or filePath must be provided',
  });

export type LintAgentsMdInput = z.infer<typeof inputSchema>;

export const lintAgentsMdTool = {
  name: 'lint_agents_md',
  description: 'Lint AGENTS.md or SKILL.md files for style, content, and best-practice issues',
  inputSchema: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'Markdown content to lint' },
      filePath: { type: 'string', description: 'Path to a markdown file to lint' },
      severity: {
        type: 'string',
        enum: ['error', 'warning', 'info', 'suggestion'],
        description: 'Minimum severity to include in the result',
      },
    },
  },
  async handler(args: LintAgentsMdInput) {
    try {
      const parsed = inputSchema.parse(args);
      const filePath = parsed.filePath ?? 'input.md';
      const content = parsed.content ?? (await readFile(filePath, 'utf-8'));
      const document = await parseMarkdown(content, filePath);
      const result = runLintRules(document);

      const severity = parsed.severity;
      const findings =
        severity !== undefined
          ? result.findings.filter(
              (finding) => severityOrder[finding.severity] <= severityOrder[severity]
            )
          : result.findings;

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                ...result,
                findings,
                errorCount: findings.filter((finding) => finding.severity === 'error').length,
                warningCount: findings.filter((finding) => finding.severity === 'warning').length,
                infoCount: findings.filter((finding) => finding.severity === 'info').length,
                fixableCount: findings.filter((finding) => finding.autoFixable).length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lint operation failed';
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  },
};
