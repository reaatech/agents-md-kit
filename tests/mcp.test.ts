import { existsSync } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { createMcpServer } from '../src/mcp-server/mcp-server.js';
import {
  getExamplesTool,
  lintAgentsMdTool,
  scaffoldAgentTool,
  validateAgentsMdTool,
  validateSkillMdTool,
} from '../src/mcp-server/tools/index.js';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

async function createTempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'agents-md-kit-mcp-'));
  tempDirs.push(dir);
  return dir;
}

describe('MCP tools', () => {
  it('lists the expected MCP tools', async () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
    expect(lintAgentsMdTool.name).toBe('lint_agents_md');
    expect(validateAgentsMdTool.name).toBe('validate_agents_md');
    expect(validateSkillMdTool.name).toBe('validate_skill_md');
    expect(scaffoldAgentTool.name).toBe('scaffold_agent');
    expect(getExamplesTool.name).toBe('get_examples');
  });

  it('validates invalid agents content via alias tool', async () => {
    const response = await validateAgentsMdTool.handler({
      content: '# Invalid agent',
      strict: true,
    });
    const payload = JSON.parse(response.content[0]?.text ?? '{}') as { valid: boolean };
    expect(payload.valid).toBe(false);
  });

  it('lints markdown content', async () => {
    const response = await lintAgentsMdTool.handler({
      content: '# Example\n\n## What this is\n\nContent.',
    });
    const payload = JSON.parse(response.content[0]?.text ?? '{}') as { path: string };
    expect(payload.path).toBe('input.md');
  });

  it('validates invalid skill content', async () => {
    const response = await validateSkillMdTool.handler({
      content: '# Invalid skill',
      strict: true,
    });
    const payload = JSON.parse(response.content[0]?.text ?? '{}') as { valid: boolean };
    expect(payload.valid).toBe(false);
  });

  it('scaffolds agent files', async () => {
    const outputDir = await createTempDir();
    const response = await scaffoldAgentTool.handler({
      agentId: 'test-agent',
      displayName: 'Test Agent',
      agentType: 'mcp',
      outputDir,
    });

    expect(JSON.parse(response.content[0]?.text ?? '{}')).toBeDefined();
    expect(existsSync(path.join(outputDir, 'AGENTS.md'))).toBe(true);
  });

  it('returns available examples', async () => {
    const response = await getExamplesTool.handler({});
    const payload = JSON.parse(response.content[0]?.text ?? '[]') as string[];
    expect(payload).toContain('mcp-server');
  });

  it('returns filtered examples by type', async () => {
    const response = await getExamplesTool.handler({ type: 'mcp-server' });
    const payload = JSON.parse(response.content[0]?.text ?? '[]') as string[];
    expect(payload).toContain('mcp-server');
    expect(payload).toHaveLength(1);
  });

  it('returns example file contents with show parameter', async () => {
    const response = await getExamplesTool.handler({ show: 'mcp-server/AGENTS.md' });
    expect(response.content[0]?.text).toContain('Example MCP Server');
  });

  it('lints with severity filter', async () => {
    const response = await lintAgentsMdTool.handler({
      content: '# Example\n\n## Section\n\nTODO: fix\n',
      severity: 'warning',
    });
    const payload = JSON.parse(response.content[0]?.text ?? '{}') as { findings: Array<{ severity: string }> };
    for (const f of payload.findings) {
      expect(['error', 'warning']).toContain(f.severity);
    }
  });

  it('scaffolds with custom skills', async () => {
    const outputDir = await createTempDir();
    const response = await scaffoldAgentTool.handler({
      agentId: 'test-agent',
      displayName: 'Test Agent',
      agentType: 'orchestrator',
      outputDir,
      skills: [
        { skillId: 'routing', displayName: 'Routing', skillType: 'routing' },
      ],
    });
    const payload = JSON.parse(response.content[0]?.text ?? '{}') as { created: string[] };
    expect(payload.created.length).toBeGreaterThan(0);
    expect(existsSync(path.join(outputDir, 'skills', 'routing', 'skill.md'))).toBe(true);
  });
});

describe('MCP server', () => {
  describe('createMcpServer', () => {
    it('should create a server with tools capability', () => {
      const server = createMcpServer();
      expect(server).toBeDefined();
    });
  });
});
