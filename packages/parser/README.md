# @reaatech/agents-markdown-parser

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-parser.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-parser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Markdown AST parser with YAML frontmatter extraction for [AGENTS.md](https://github.com/reaatech/agents-md-kit) and SKILL.md files. Built on [remark](https://remark.js.org/) and [unified](https://unifiedjs.com/) for reliable AST extraction, plus section hierarchy analysis, table parsing, and code block extraction.

## Installation

```bash
npm install @reaatech/agents-markdown-parser
# or
pnpm add @reaatech/agents-markdown-parser
```

## Feature Overview

- **Main parser** — `parseMarkdown` produces a typed `AgentsMdDocument` or `SkillMdDocument` from raw markdown
- **YAML frontmatter** — Extract, validate, create, and update frontmatter with `yaml` parsing
- **Section hierarchy** — Build a nested section tree from headings, with find/has/flatten utilities
- **Table extraction** — Parse all markdown tables, extract columns, convert to objects, validate structure
- **Code blocks** — Extract fenced code blocks, detect languages, flag potential secrets
- **Batch processing** — `parseMarkdownFiles` for multi-file operations

## Quick Start

```typescript
import { parseMarkdown, extractSections, parseTables } from "@reaatech/agents-markdown-parser";

const content = `---
agent_id: my-agent
display_name: My Agent
version: 1.0.0
description: A test agent
type: mcp
---

# My Agent

## What this is

A test agent for demonstration.

## Architecture Overview

\`\`\`text
┌────────┐    ┌──────────┐
│ Input  │───▶│ Processor │───▶ Output
└────────┘    └──────────┘
\`\`\`

| Component | Purpose |
|-----------|---------|
| Parser    | Parsing  |
`;

const doc = await parseMarkdown(content, "/path/to/AGENTS.md");
console.log(doc.frontmatter.id);        // "my-agent"
console.log(doc.title);                  // "My Agent"
console.log(doc.sections.length);        // 2

const sections = extractSections(content);
const tables = parseTables(content);
```

## API Reference

### `parseMarkdown(content, path)`

The main entry point. Parses raw markdown into a fully structured document.

```typescript
async function parseMarkdown(
  content: string,
  path: string
): Promise<AgentsMdDocument | SkillMdDocument>
```

### `parseMarkdownFiles(files)`

```typescript
async function parseMarkdownFiles(
  files: string[]
): Promise<Array<AgentsMdDocument | SkillMdDocument>>
```

### Document Navigation

| Function | Signature | Description |
|----------|-----------|-------------|
| `getSectionTitles` | `(doc) => string[]` | All section titles in the document |
| `findSection` | `(doc, title) => Section \| undefined` | Find a section by title (case-insensitive) |
| `getHeadings` | `(doc) => Array<{title, level, line}>` | All headings with metadata |

### Frontmatter (`extractFrontmatter`)

```typescript
function extractFrontmatter(content: string): {
  frontmatter: ParsedFrontmatter;
  frontmatterRange: { start: number; end: number };
  contentWithoutFrontmatter: string;
}
```

| Function | Description |
|----------|-------------|
| `extractFrontmatter(content)` | Extract and parse YAML frontmatter |
| `validateFrontmatterStructure(frontmatter)` | Check required fields exist |
| `createFrontmatter(values, isSkill?)` | Generate a frontmatter string |
| `updateFrontmatter(content, updates)` | Merge updates into existing frontmatter |

### Section Extraction (`extractSections`)

```typescript
function extractSections(content: string, lineOffset?: number): Section[]

interface Section {
  title: string;
  level: number;
  content: string;
  location: ErrorLocation;
  subsections: Section[];
}
```

| Function | Description |
|----------|-------------|
| `extractSections(content, lineOffset?)` | Build section hierarchy from headings |
| `findSection(sections, title)` | Recursive case-insensitive find |
| `findSectionByPath(sections, path)` | Find by array path (e.g. `["A", "B"]`) |
| `findSectionByTitle(sections, title)` | Alias for `findSection` exported for disambiguation |
| `flattenSectionTitles(sections)` | All titles in a flat array |
| `hasSection(sections, title)` | Boolean existence check |
| `getSectionsAtLevel(sections, level)` | Filter by heading level |

### Table Parsing (`parseTables`)

```typescript
function parseTables(content: string): MarkdownTable[]

interface MarkdownTable {
  headers: string[];
  rows: string[][];
  location: ErrorLocation;
}
```

| Function | Description |
|----------|-------------|
| `parseTables(content)` | Extract all markdown tables |
| `extractColumn(table, columnName)` | Extract a column by header name |
| `tableToObjects(table)` | Convert to `Record<string, string>[]` |
| `validateTableStructure(table)` | Check headers, duplicates, row consistency |
| `formatTable(table)` | Format back to markdown string |

### Code Block Extraction

| Function | Description |
|----------|-------------|
| `extractCodeBlocks(content)` | Extract fenced code blocks |
| `hasLanguage(codeBlock)` | Check if language is specified |
| `getCodeBlocksByLanguage(blocks, language)` | Filter by language |
| `mightContainSecret(codeBlock)` | Regex-based secret detection |
| `formatCodeBlock(codeBlock)` | Format back to markdown |
| `validateCodeBlockLanguages(blocks)` | Check which blocks have languages |
| `getUniqueLanguages(blocks)` | Sorted unique language identifiers |

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types and schemas
- [`@reaatech/agents-markdown-validator`](https://www.npmjs.com/package/@reaatech/agents-markdown-validator) — Schema validation engine
- [`@reaatech/agents-markdown-linter`](https://www.npmjs.com/package/@reaatech/agents-markdown-linter) — Linting rules engine

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
