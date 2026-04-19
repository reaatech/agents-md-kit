/**
 * MCP Server implementation for agents-md-kit
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { VERSION } from '../index.js';
import {
  getExamplesTool,
  lintAgentsMdTool,
  scaffoldAgentTool,
  validateAgentsMdTool,
  validateSkillMdTool,
} from './tools/index.js';

const tools = [
  lintAgentsMdTool,
  validateAgentsMdTool,
  validateSkillMdTool,
  scaffoldAgentTool,
  getExamplesTool,
] as const;

export function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'agents-md-kit',
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((candidate) => candidate.name === request.params.name);
    if (!tool) {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: `Unknown tool: ${request.params.name}` }) }],
        isError: true,
      };
    }

    try {
      return await tool.handler((request.params.arguments ?? {}) as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal tool error';
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  });

  return server;
}

export async function startMcpServer(transportType: 'stdio' | 'streamable-http' = 'streamable-http'): Promise<void> {
  const server = createMcpServer();

  async function shutdown() {
    await server.close();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  if (transportType === 'streamable-http') {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (server as any).connect(transport);
    process.stderr.write('agents-md-kit MCP server started with StreamableHTTP transport\n');
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('agents-md-kit MCP server started with Stdio transport\n');
  }
}
