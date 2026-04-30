import { describe, expect, it } from 'vitest';
import {
  extractCodeBlocks,
  formatCodeBlock,
  getUniqueLanguages,
  mightContainSecret,
  validateCodeBlockLanguages,
} from './code-block-extractor.js';
import {
  createFrontmatter,
  extractFrontmatter,
  updateFrontmatter,
  validateFrontmatterStructure,
} from './frontmatter-parser.js';
import { findSection, getHeadings, getSectionTitles, parseMarkdown } from './markdown-parser.js';
import {
  findSectionByPath,
  flattenSectionTitles,
  getSectionsAtLevel,
} from './section-extractor.js';
import {
  extractColumn,
  formatTable,
  parseTables,
  tableToObjects,
  validateTableStructure,
} from './table-parser.js';

describe('parser utilities', () => {
  it('handles frontmatter creation and updates', () => {
    const created = createFrontmatter({
      id: 'agent',
      display_name: 'Agent',
      version: '1.0.0',
      description: 'Example description',
      type: 'mcp',
    });
    expect(created).toContain('agent_id: "agent"');

    const updated = updateFrontmatter(`${created}\n# Agent\n`, {
      description: 'Updated description',
    });
    const extracted = extractFrontmatter(updated);
    expect(extracted.frontmatter?.description).toBe('Updated description');
    expect(extractFrontmatter('no frontmatter').frontmatter).toBeNull();
    expect(extractFrontmatter('---\nnot: [yaml\n').frontmatter).toBeNull();
  });

  it('extracts and formats code blocks', () => {
    const blocks = extractCodeBlocks('```ts\nconst token = "sk-12345678901234567890";\n```');
    expect(blocks).toHaveLength(1);
    expect(mightContainSecret(blocks[0]!)).toBe(true);
    expect(formatCodeBlock(blocks[0]!)).toContain('```ts');
    expect(getUniqueLanguages(blocks)).toEqual(['ts']);
    expect(validateCodeBlockLanguages(blocks)[0]?.hasLanguage).toBe(true);
  });

  it('parses tables and section helpers', () => {
    const markdown = [
      '## Parent',
      '',
      '### Child',
      '',
      '| Tool | Output |',
      '|------|--------|',
      '| echo | text |',
    ].join('\n');

    const tables = parseTables(markdown);
    expect(extractColumn(tables[0]!, 'Tool')).toEqual(['echo']);
    expect(tableToObjects(tables[0]!)).toEqual([{ Tool: 'echo', Output: 'text' }]);
    expect(validateTableStructure(tables[0]!)[0]?.valid).toBe(true);
    expect(formatTable(tables[0]!)).toContain('| Tool | Output |');

    const sections = getSectionsAtLevel(
      [
        {
          title: 'Parent',
          level: 2,
          content: 'content',
          location: { line: 1, endLine: 6 },
          subsections: [
            {
              title: 'Child',
              level: 3,
              content: 'content',
              location: { line: 3, endLine: 6 },
              subsections: [],
            },
          ],
        },
      ],
      3
    );
    expect(sections[0]?.title).toBe('Child');
    expect(flattenSectionTitles(sections)).toContain('Child');
    expect(
      findSectionByPath(
        [
          {
            title: 'Parent',
            level: 2,
            content: 'content',
            location: { line: 1, endLine: 6 },
            subsections: [
              {
                title: 'Child',
                level: 3,
                content: 'content',
                location: { line: 3, endLine: 6 },
                subsections: [],
              },
            ],
          },
        ],
        ['Parent', 'Child']
      )?.title
    ).toBe('Child');
  });

  it('covers markdown parser helpers', async () => {
    const document = await parseMarkdown(
      '# Title\n\n## Capability\n\nDoes work.\n\n## MCP Tools\n\n| Tool | Input Schema | Output |\n|---|---|---|\n| run | a | b |',
      'notes/skills/example.md'
    );
    expect(getSectionTitles(document)).toContain('Title');
    expect(findSection(document, 'MCP Tools')).toBeUndefined();
    expect(getHeadings(document)[0]?.title).toBe('Title');
  });
});

describe('frontmatter validation', () => {
  it('returns invalid for null frontmatter', () => {
    const issues = validateFrontmatterStructure(null);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.valid).toBe(false);
    expect(issues[0]?.message).toContain('No frontmatter found');
  });

  it('reports missing id field', () => {
    const issues = validateFrontmatterStructure({
      id: '',
      display_name: 'Test',
      version: '1.0.0',
      description: 'A valid description',
      raw: '',
    });
    expect(issues.some((i) => i.field === 'id' && !i.valid)).toBe(true);
  });

  it('reports missing display_name field', () => {
    const issues = validateFrontmatterStructure({
      id: 'test',
      display_name: '',
      version: '1.0.0',
      description: 'A valid description',
      raw: '',
    });
    expect(issues.some((i) => i.field === 'display_name' && !i.valid)).toBe(true);
  });

  it('reports invalid semver version', () => {
    const issues = validateFrontmatterStructure({
      id: 'test',
      display_name: 'Test',
      version: 'abc',
      description: 'A valid description',
      raw: '',
    });
    expect(issues.some((i) => i.field === 'version' && !i.valid)).toBe(true);
    expect(issues.find((i) => i.field === 'version')?.message).toContain('semantic version');
  });

  it('reports short description', () => {
    const issues = validateFrontmatterStructure({
      id: 'test',
      display_name: 'Test',
      version: '1.0.0',
      description: 'short',
      raw: '',
    });
    expect(issues.some((i) => i.field === 'description' && !i.valid)).toBe(true);
    expect(issues.find((i) => i.field === 'description')?.message).toContain('10 characters');
  });

  it('returns all valid for correct frontmatter', () => {
    const issues = validateFrontmatterStructure({
      id: 'test',
      display_name: 'Test',
      version: '1.0.0',
      description: 'A valid description',
      raw: '',
    });
    expect(issues.every((i) => i.valid)).toBe(true);
  });

  it('creates empty frontmatter string for empty values', () => {
    const result = createFrontmatter({});
    expect(result).toBe('');
  });

  it('creates frontmatter with only id', () => {
    const result = createFrontmatter({
      id: 'test',
      display_name: '',
      version: '',
      description: '',
      raw: '',
    });
    expect(result).toContain('agent_id: "test"');
    expect(result).not.toContain('display_name');
  });

  it('creates frontmatter with category field', () => {
    const result = createFrontmatter({
      id: 'test',
      display_name: 'Test',
      version: '1.0.0',
      description: 'A description',
      category: 'tool',
      raw: '',
    });
    expect(result).toContain('category: "tool"');
  });

  it('returns original content when updated frontmatter is empty', () => {
    const content = '---\nfoo: bar\n---\n\n# Title\n';
    const result = updateFrontmatter(content, {
      id: '',
      display_name: '',
      version: '',
      description: '',
    });
    expect(result).toBe(content);
  });

  it('extracts frontmatter with type and category fields', () => {
    const content = '---\nagent_id: "test"\ntype: "mcp"\ncategory: "tool"\n---\n\n# Title\n';
    const result = extractFrontmatter(content);
    expect(result.frontmatter?.type).toBe('mcp');
    expect(result.frontmatter?.category).toBe('tool');
  });
});

describe('table parsing edge cases', () => {
  it('returns empty array for content with no tables', () => {
    const tables = parseTables('no tables here\njust text\n');
    expect(tables).toHaveLength(0);
  });

  it('returns empty column for nonexistent column name', () => {
    const table = {
      headers: ['A', 'B'],
      rows: [['1', '2']],
      location: { line: 1, endLine: 3 },
    };
    expect(extractColumn(table, 'C')).toEqual([]);
  });

  it('validates table with empty headers', () => {
    const table = {
      headers: [] as string[],
      rows: [] as string[][],
      location: { line: 1, endLine: 1 },
    };
    const issues = validateTableStructure(table);
    expect(issues.some((i) => !i.valid && i.message.includes('no headers'))).toBe(true);
  });

  it('validates table with duplicate headers', () => {
    const table = {
      headers: ['A', 'a'],
      rows: [['1', '2']],
      location: { line: 1, endLine: 3 },
    };
    const issues = validateTableStructure(table);
    expect(issues.some((i) => !i.valid && i.message.includes('Duplicate'))).toBe(true);
  });

  it('validates table with row column mismatch', () => {
    const table = {
      headers: ['A', 'B'],
      rows: [['1', '2', '3']],
      location: { line: 1, endLine: 3 },
    };
    const issues = validateTableStructure(table);
    expect(issues.some((i) => !i.valid && i.message.includes('columns'))).toBe(true);
  });

  it('formats table with rows shorter than headers', () => {
    const table = {
      headers: ['A', 'B', 'C'],
      rows: [['1']],
      location: { line: 1, endLine: 3 },
    };
    const result = formatTable(table);
    expect(result).toContain('| 1 |  |  |');
  });

  it('handles tableToObjects with rows shorter than headers', () => {
    const table = {
      headers: ['A', 'B'],
      rows: [['1']],
      location: { line: 1, endLine: 3 },
    };
    const objects = tableToObjects(table);
    expect(objects[0]?.A).toBe('1');
    expect(objects[0]?.B).toBe('');
  });
});
