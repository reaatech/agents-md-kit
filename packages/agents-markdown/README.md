# @reaatech/agents-markdown

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Core domain types, Zod validation schemas, and shared utilities for the `@reaatech/agents-markdown-*` ecosystem. This package is the single source of truth for all document shapes — `AgentsMdDocument`, `SkillMdDocument`, `Finding`, `LintResult`, `ValidationResult` — used throughout the toolkit.

## Installation

```bash
npm install @reaatech/agents-markdown
# or
pnpm add @reaatech/agents-markdown
```

## Feature Overview

- **Canonical domain types** — `AgentsMdDocument`, `SkillMdDocument`, `ValidationResult`, `LintResult`, `Finding`, `ScaffoldConfig`, and 10+ more interfaces
- **Zod validation schemas** — `AgentsMdSchema`, `SkillMdSchema`, `AgentsMdFrontmatterSchema`, `SkillMdFrontmatterSchema` derived from the AGENTS.md specification
- **Shared utilities** — `assertNever`, `delay`, `debounce`, `groupBy`, `randomId`, `sanitizePath`, `normalizeLineEndings`, `truncate`
- **Inferred types** — `AgentsMdFrontmatter`, `SkillMdFrontmatter`, `AgentsMdValidation`, `SkillMdValidation`, `McpTool`, `SkillReference`
- **Version constant** — `VERSION` string shared across the ecosystem

## Quick Start

```typescript
import type { AgentsMdDocument, ValidationResult } from "@reaatech/agents-markdown";
import { AgentsMdFrontmatterSchema, VERSION } from "@reaatech/agents-markdown";
import { assertNever, groupBy, randomId } from "@reaatech/agents-markdown";

// Validate frontmatter with Zod
const parsed = AgentsMdFrontmatterSchema.safeParse({
  agent_id: "my-agent",
  display_name: "My Agent",
  version: "1.0.0",
  description: "An example agent",
  type: "mcp",
});

if (!parsed.success) {
  console.error(parsed.error.issues);
}
```

## API Reference

### `AgentsMdDocument`

The parsed representation of an AGENTS.md file after running through the [@reaatech/agents-markdown-parser](https://www.npmjs.com/package/@reaatech/agents-markdown-parser).

```typescript
interface AgentsMdDocument {
  path: string;
  raw: string;
  frontmatter: ParsedFrontmatter;
  title: string;
  sections: Section[];
  tables: MarkdownTable[];
  codeBlocks: CodeBlock[];
  frontmatterRange?: { start: number; end: number };
}
```

### `SkillMdDocument`

Identical shape to `AgentsMdDocument`, representing a parsed SKILL.md file.

### `ValidationResult`

Returned by validators in [@reaatech/agents-markdown-validator](https://www.npmjs.com/package/@reaatech/agents-markdown-validator).

```typescript
interface ValidationResult {
  valid: boolean;
  type: "agents" | "skill";
  path: string;
  errors: Finding[];
  warnings: Finding[];
  suggestions: Finding[];
}
```

### `LintResult`

Returned by `runLintRules` in [@reaatech/agents-markdown-linter](https://www.npmjs.com/package/@reaatech/agents-markdown-linter).

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | File path being linted |
| `findings` | `Finding[]` | All findings across all rules |
| `errorCount` | `number` | Number of error-severity findings |
| `warningCount` | `number` | Number of warning-severity findings |
| `infoCount` | `number` | Number of info-severity findings |
| `fixableCount` | `number` | Number of auto-fixable findings |

### `Finding`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `rule` | `string` | Yes | Rule identifier |
| `severity` | `Severity` | Yes | `"error" \| "warning" \| "info" \| "suggestion"` |
| `message` | `string` | Yes | Human-readable description |
| `location` | `ErrorLocation` | No | Line/column in source |
| `suggestion` | `string` | No | Suggested fix text |
| `autoFixable` | `boolean` | No | Whether an auto-fix exists |
| `fix` | `unknown` | No | Fix payload for auto-fix engine |

### `ScaffoldConfig`

```typescript
interface ScaffoldConfig {
  agentType: AgentType;
  agentId: string;
  displayName: string;
  description?: string;
  version?: string;
  skills: ScaffoldSkillConfig[];
  outputDir: string;
  overwrite?: boolean;
}
```

### Schemas

All Zod schemas are exported as named consts. Inferred types are exported alongside them.

| Schema | Inferred Type | Validates |
|--------|---------------|-----------|
| `AgentsMdFrontmatterSchema` | `AgentsMdFrontmatter` | YAML frontmatter fields (`agent_id`, `display_name`, `version`, `description`) |
| `SkillMdFrontmatterSchema` | `SkillMdFrontmatter` | YAML frontmatter fields (`skill_id`, `display_name`, `version`, `description`) |
| `AgentsMdSchema` | `AgentsMdValidation` | Full AGENTS.md structure with required sections |
| `SkillMdSchema` | `SkillMdValidation` | Full SKILL.md structure with required sections |
| `McpToolSchema` | `McpTool` | MCP tool definition (`name`, `inputSchema`, `output`, `rateLimit`) |
| `SkillReferenceSchema` | `SkillReference` | Skill reference (`skillId`, `path`) |
| `SectionSchema` | `SchemaSection` | Section heading metadata |

### Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| `assertNever` | `(x: never) => never` | Exhaustive switch guard |
| `delay` | `(ms: number) => Promise<void>` | `setTimeout` wrapper |
| `randomId` | `() => string` | `crypto.randomUUID()` |
| `sanitizePath` | `(path: string) => string` | Backslash to forward slash |
| `normalizeLineEndings` | `(text: string) => string` | `\r\n` → `\n` |
| `truncate` | `(text: string, max: number) => string` | Truncate with `...` |
| `debounce` | `(fn: Function, ms: number) => Function` | Generic debounce |
| `groupBy` | `<T, K>(arr: T[], fn: (item: T) => K) => Record<K, T[]>` | Generic groupBy |

### Type Aliases

| Type | Values |
|------|--------|
| `Severity` | `"error" \| "warning" \| "info" \| "suggestion"` |
| `AgentType` | `"mcp" \| "orchestrator" \| "classifier" \| "router" \| "evaluator"` |
| `SkillType` | `"tool" \| "orchestration" \| "evaluation" \| "routing"` |
| `OutputFormat` | `"console" \| "json" \| "html" \| "markdown"` |

## Related Packages

- [`@reaatech/agents-markdown-parser`](https://www.npmjs.com/package/@reaatech/agents-markdown-parser) — Markdown AST parser with frontmatter extraction
- [`@reaatech/agents-markdown-validator`](https://www.npmjs.com/package/@reaatech/agents-markdown-validator) — Schema validation engine for AGENTS.md and SKILL.md
- [`@reaatech/agents-markdown-linter`](https://www.npmjs.com/package/@reaatech/agents-markdown-linter) — Style, content, and best-practice linting rules
- [`@reaatech/agents-markdown-scaffold`](https://www.npmjs.com/package/@reaatech/agents-markdown-scaffold) — Template-based file generator

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
