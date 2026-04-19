import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../src/parser/markdown-parser.js';
import { extractSections, findSection, hasSection } from '../src/parser/section-extractor.js';

describe('Markdown Parser', () => {
  it('should parse markdown with frontmatter', async () => {
    const content = `---
agent_id: test-agent
display_name: Test Agent
version: 1.0.0
description: A test agent
---

# Test Agent

## What this is

This is a test agent.

## Architecture Overview

Some architecture details.
`;

    const result = await parseMarkdown(content, 'test.md');

    expect(result.frontmatter).toBeDefined();
    // The frontmatter is normalized to use 'id' field
    expect(result.frontmatter?.id).toBe('test-agent');
    expect(result.title).toBe('Test Agent');
    expect(result.sections.length).toBeGreaterThan(0);
  });

  it('should extract sections correctly', () => {
    // extractSections extracts h2 sections as top-level
    const content = `## Section One

Content for section one.

### Subsection One.A

Content for subsection.

## Section Two

Content for section two.
`;

    const sections = extractSections(content);

    // Both h2 sections should be at top level
    expect(sections.length).toBe(2);
    expect(sections[0]?.title).toBe('Section One');
    expect(sections[0]?.subsections.length).toBe(1);
    expect(sections[0]?.subsections[0]?.title).toBe('Subsection One.A');
    expect(sections[1]?.title).toBe('Section Two');
  });

  it('should find sections by title', () => {
    const sections = extractSections(`## What this is\n\nContent.\n\n## Architecture Overview\n\nDetails.`);

    expect(hasSection(sections, 'What this is')).toBe(true);
    expect(hasSection(sections, 'what this is')).toBe(true); // case insensitive
    expect(hasSection(sections, 'Non-existent')).toBe(false);

    const found = findSection(sections, 'Architecture Overview');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Architecture Overview');
  });
});
