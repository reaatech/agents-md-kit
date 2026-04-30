import type { AgentsMdDocument, MarkdownTable, SkillMdDocument } from '@reaatech/agents-markdown';
import { describe, expect, it } from 'vitest';
import { getAutoFixableRules, runAutoFix } from './auto-fix.js';
import { runLintRules } from './rules-engine.js';

import './content-rules.js';

function makeAgentDoc(overrides: Partial<AgentsMdDocument> = {}): AgentsMdDocument {
  return {
    path: 'AGENTS.md',
    raw: '# Agent\n\n## What this is\n\nTest.\n',
    frontmatter: {
      id: 'a',
      display_name: 'A',
      version: '1.0.0',
      description: 'Test agent description here',
      raw: '',
    },
    title: 'Agent',
    sections: [],
    tables: [],
    codeBlocks: [],
    ...overrides,
  };
}

function makeSkillDoc(overrides: Partial<SkillMdDocument> = {}): SkillMdDocument {
  return {
    path: 'skills/echo/skill.md',
    raw: '# Skill\n\n## Capability\n\nTest.\n',
    frontmatter: {
      id: 's',
      display_name: 'S',
      version: '1.0.0',
      description: 'A test skill description',
      raw: '',
    },
    title: 'Skill',
    sections: [],
    tables: [],
    codeBlocks: [],
    ...overrides,
  };
}

describe('auto-fix', () => {
  it('fixes trailing whitespace', () => {
    const result = runAutoFix('# Title  \n\nText  \n', ['trailing-whitespace']);
    expect(result).toBe('# Title\n\nText\n');
  });

  it('handles heading-order (skipped levels)', () => {
    const content = '# H1\n\n### H3\n\n## H2\n';
    const result = runAutoFix(content, ['heading-order']);
    expect(result).toContain('# H1');
    expect(result).toContain('### H3');
  });

  it('adds language to code blocks without one', () => {
    const content = '# Title\n\n```\nconst x = 1;\n```\n';
    const result = runAutoFix(content, ['no-code-language']);
    expect(result).toContain('```text');
    expect(result.indexOf('```text')).toBeLessThan(
      result.indexOf('```', result.indexOf('```text') + 10)
    );
  });

  it('preserves code blocks that already have a language', () => {
    const content = '# Title\n\n```ts\nconst x = 1;\n```\n';
    const result = runAutoFix(content, ['no-code-language']);
    expect(result).toContain('```ts');
  });

  it('formats tables with consistent column padding', () => {
    const content = '# Title\n\n| A | B |\n|---|---|\n| x | yy |\n';
    const result = runAutoFix(content, ['table-format']);
    expect(result).toContain('| x');
    expect(result).toContain('| yy');
  });

  it('adds missing sections for agent document', () => {
    const content = '---\nagent_id: "test"\n---\n\n# Test\n';
    const result = runAutoFix(content, ['heading-missing']);
    expect(result).toContain('## What this is');
    expect(result).toContain('## Architecture Overview');
    expect(result).toContain('## Security Considerations');
  });

  it('adds missing sections for skill document', () => {
    const content = '---\nskill_id: "test"\n---\n\n# Test\n';
    const result = runAutoFix(content, ['heading-missing']);
    expect(result).toContain('## Capability');
    expect(result).toContain('## MCP Tools');
    expect(result).toContain('## Security Considerations');
  });

  it('does not add sections when none are missing', () => {
    const content =
      '---\nagent_id: "test"\n---\n\n# Test\n\n## What this is\n\nx.\n\n## Architecture Overview\n\nx.\n\n## Skill System\n\nx.\n\n## MCP Integration\n\nx.\n\n## Security Considerations\n\nx.\n\n## Observability\n\nx.\n\n## Checklist: Production Readiness\n\nx.\n';
    const result = runAutoFix(content, ['heading-missing']);
    expect(result).toBe(content);
  });

  it('returns content unchanged for unknown rule', () => {
    const content = '# Title\n';
    const result = runAutoFix(content, ['unknown-rule']);
    expect(result).toBe(content);
  });

  it('returns list of auto-fixable rules', () => {
    const rules = getAutoFixableRules();
    expect(rules).toContain('trailing-whitespace');
    expect(rules).toContain('no-code-language');
    expect(rules).toContain('table-format');
    expect(rules).toContain('heading-missing');
    expect(rules).toHaveLength(4);
  });

  it('applies multiple fixes in sequence', () => {
    const content = '# Title  \n\n```\ncode\n```\n';
    const result = runAutoFix(content, ['trailing-whitespace', 'no-code-language']);
    expect(result).toContain('# Title\n');
    expect(result).toContain('```text');
  });
});

describe('content rules', () => {
  it('detects duplicate sections', () => {
    const doc = makeAgentDoc({
      raw: '# Agent\n\n## What this is\n\nA.\n\n## What this is\n\nB.\n',
      sections: [
        {
          title: 'What this is',
          level: 2,
          content: 'A.',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
        {
          title: 'What this is',
          level: 2,
          content: 'B.',
          location: { line: 7, endLine: 7 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'duplicate-section')).toBe(true);
  });

  it('detects missing required sections for agents', () => {
    const doc = makeAgentDoc({
      sections: [
        {
          title: 'What this is',
          level: 2,
          content: 'Test.',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'heading-missing')).toBe(true);
  });

  it('detects missing required sections for skills', () => {
    const doc = makeSkillDoc({
      sections: [
        {
          title: 'Capability',
          level: 2,
          content: 'Test.',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'heading-missing')).toBe(true);
  });

  it('detects empty sections', () => {
    const doc = makeAgentDoc({
      sections: [
        {
          title: 'Empty',
          level: 2,
          content: '',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'empty-section')).toBe(true);
  });

  it('detects placeholder text', () => {
    const doc = makeAgentDoc({
      raw: '# Agent\n\n## Section\n\nTODO: implement this\n',
      sections: [
        {
          title: 'Section',
          level: 2,
          content: 'TODO: implement this',
          location: { line: 3, endLine: 4 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'placeholder-text')).toBe(true);
  });

  it('skips broken-skill-ref for skill documents', () => {
    const doc = makeSkillDoc({
      sections: [
        {
          title: 'Skill System',
          level: 2,
          content: 'skills/test/skill.md',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
      ],
      tables: [],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'broken-skill-ref')).toBe(false);
  });

  it('detects broken skill references in tables', () => {
    const table: MarkdownTable = {
      headers: ['Skill ID', 'File'],
      rows: [['test', 'skills/!!!/skill.md']],
      location: { line: 10, endLine: 12 },
    };
    const doc = makeAgentDoc({
      raw: '# Agent\n\n## Skill System\n\nSee table.\n',
      sections: [
        {
          title: 'Skill System',
          level: 2,
          content: 'See table.',
          location: { line: 3, endLine: 5 },
          subsections: [],
        },
      ],
      tables: [table],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'broken-skill-ref')).toBe(true);
  });

  it('detects duplicate skill IDs in tables', () => {
    const table: MarkdownTable = {
      headers: ['Skill ID', 'File'],
      rows: [
        ['echo', 'skills/echo/skill.md'],
        ['echo', 'skills/echo2/skill.md'],
      ],
      location: { line: 10, endLine: 12 },
    };
    const doc = makeAgentDoc({
      raw: '# Agent\n',
      sections: [],
      tables: [table],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'duplicate-skill-id')).toBe(true);
  });

  it('skips duplicate-skill-id for skill documents', () => {
    const doc = makeSkillDoc({
      tables: [],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'duplicate-skill-id')).toBe(false);
  });

  it('detects section ordering issues', () => {
    const doc = makeAgentDoc({
      sections: [
        {
          title: 'Observability',
          level: 2,
          content: 'Logs.',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
        {
          title: 'Architecture Overview',
          level: 2,
          content: 'Design.',
          location: { line: 5, endLine: 5 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'section-ordering')).toBe(true);
  });

  it('skips section-ordering for skill documents', () => {
    const doc = makeSkillDoc({
      sections: [
        {
          title: 'Observability',
          level: 2,
          content: 'Logs.',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
        {
          title: 'Architecture Overview',
          level: 2,
          content: 'Design.',
          location: { line: 5, endLine: 5 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'section-ordering')).toBe(false);
  });

  it('no ordering warning when sections are in correct order', () => {
    const doc = makeAgentDoc({
      sections: [
        {
          title: 'What this is',
          level: 2,
          content: 'Desc.',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
        {
          title: 'Architecture Overview',
          level: 2,
          content: 'Design.',
          location: { line: 5, endLine: 5 },
          subsections: [],
        },
        {
          title: 'Skill System',
          level: 2,
          content: 'Skills.',
          location: { line: 7, endLine: 7 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'section-ordering')).toBe(false);
  });

  it('detects min-content-length in short sections', () => {
    const doc = makeAgentDoc({
      sections: [
        {
          title: 'Short',
          level: 2,
          content: 'x',
          location: { line: 3, endLine: 3 },
          subsections: [],
        },
      ],
    });
    const result = runLintRules(doc);
    expect(result.findings.some((f) => f.rule === 'min-content-length')).toBe(true);
  });
});
