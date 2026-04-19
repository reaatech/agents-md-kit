/**
 * MCP tool: get_examples
 */

import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(currentDir, '../../../examples/gallery');

const inputSchema = z.object({
  type: z.string().optional(),
  show: z.string().optional(),
});

export type GetExamplesInput = z.infer<typeof inputSchema>;

export const getExamplesTool = {
  name: 'get_examples',
  description: 'List available example agents or return the contents of a specific example file',
  inputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string', description: 'Filter to one example type' },
      show: { type: 'string', description: 'Return the contents of a specific example file' },
    },
  },
  async handler(args: GetExamplesInput) {
    const parsed = inputSchema.parse(args);

    if (parsed.show !== undefined) {
      const resolvedPath = path.resolve(examplesDir, parsed.show);
      if (!resolvedPath.startsWith(examplesDir + path.sep) && resolvedPath !== examplesDir) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: 'Invalid path: path traversal detected' }) }],
          isError: true,
        };
      }
      try {
        return {
          content: [
            {
              type: 'text' as const,
              text: await readFile(resolvedPath, 'utf-8'),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to read example file';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }

    const entries = await readdir(examplesDir, { withFileTypes: true });
    const types = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const filteredTypes = parsed.type !== undefined
      ? types.filter((type) => type === parsed.type)
      : types;

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(filteredTypes, null, 2),
        },
      ],
    };
  },
};
