# @reaatech/agents-markdown-validator

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-validator.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-validator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Zod schema validation engine for AGENTS.md and SKILL.md files. Validates frontmatter structure, required sections, section ordering, skill references, MCP tools tables, and content quality against the AGENTS.md specification.

## Installation

```bash
npm install @reaatech/agents-markdown-validator
# or
pnpm add @reaatech/agents-markdown-validator
```

## Feature Overview

- **Frontmatter validation** — Zod schemas enforce required YAML fields, types, and optional config
- **Required sections** — Checks all mandated sections are present for both AGENTS.md (8 sections) and SKILL.md (5 sections)
- **Recommended sections** — Warns on missing recommended sections for AGENTS.md
- **Section ordering** — Validates that sections follow the recommended order
- **Skill references** — Ensures referenced `skills/*.md` files exist and skill IDs are unique
- **MCP tools table** — Validates table structure, required columns, and tool naming conventions
- **Content quality** — Flags placeholder text (`TODO`, `FIXME`), empty sections, missing PII mentions, missing logging mentions
- **User-friendly errors** — Formatted findings with context, suggestions, and grouped summaries

## Quick Start

```typescript
import { parseMarkdown } from "@reaatech/agents-markdown-parser";
import { validate, validateAgentsMd, validateSkillMd } from "@reaatech/agents-markdown-validator";

const doc = await parseMarkdown(content, "./AGENTS.md");

// Generic validate (auto-detects AGENTS.md vs SKILL.md)
const result = validate(doc, { strict: true });

if (!result.valid) {
  for (const error of result.errors) {
    console.error(`${error.rule}: ${error.message}`);
  }
}

// Type-specific validators
const agentResult = validateAgentsMd(doc, { basePath: "./", existingSkills: ["echo"] });
const skillResult = validateSkillMd(doc, { basePath: "./" });
```

## API Reference

### `validate(document, options?)`

Auto-dispatches to the correct validator based on document type.

```typescript
function validate(
  document: AgentsMdDocument | SkillMdDocument,
  options?: ValidationOptions
): ValidationResult

interface ValidationOptions {
  strict?: boolean;         // Fail on warnings
  basePath?: string;        // Base path for skill resolution
  existingSkills?: string[]; // Known skill IDs for reference checking
}
```

### `validateMultiple(documents, options?)`

Batch validate. Returns one `ValidationResult` per document.

### AGENTS.md Validation (`validateAgentsMd`)

Validates 10 checks:

| Check | Severity | Description |
|-------|----------|-------------|
| Frontmatter existence + Zod parse | error | Must have valid YAML frontmatter |
| Confidence threshold | error | `confidence_threshold` must be present |
| Title | error | Must have a `#` heading |
| Required sections | error | All 7+ sections must exist |
| Recommended sections | warning | 5 recommended sections should exist |
| Heading order | warning | Headings must not skip levels |
| Skill references | error | Referenced skills must exist and be unique |
| PII handling | warning | Security section should mention PII |
| Logging | warning | Observability section should mention structured logging |
| Placeholders / empty | warning | No `TODO`/`FIXME` or empty sections |

### SKILL.md Validation (`validateSkillMd`)

Validates 8 checks:

| Check | Severity | Description |
|-------|----------|-------------|
| Frontmatter | error | Must have valid YAML frontmatter |
| Title | error | Must have a `#` heading |
| Required sections | error | All 5 sections must exist |
| MCP tools table | error | Must have proper table with `Tool`, `Input Schema`, `Output` columns |
| MCP tool names | warning | Tool names should follow naming conventions |
| Usage examples | warning | Should include both success and error cases |
| Security permissions | warning | Should mention permission requirements |
| Placeholders / empty | warning | No placeholder text or empty sections |

### Helpers

```typescript
function createFinding(
  rule: string, severity: Severity, message: string,
  location?: ErrorLocation, suggestion?: string,
  autoFixable?: boolean, fix?: unknown
): Finding

function createError(rule: string, message: string, location?: ErrorLocation): Finding
function createWarning(rule: string, message: string, location?: ErrorLocation): Finding
function createInfo(rule: string, message: string, location?: ErrorLocation): Finding
function createSuggestion(rule: string, message: string, location?: ErrorLocation): Finding
function createFixableFinding(rule: string, message: string, fix: unknown, location?: ErrorLocation): Finding
```

### Error Formatting

| Function | Description |
|----------|-------------|
| `formatFinding(finding)` | Human-readable finding with severity, rule, message, location, suggestion |
| `formatValidationSummary(result)` | One-line summary: valid/invalid with counts |
| `formatFindingsGrouped(findings)` | Grouped by severity with emoji headers |
| `formatWithContext(finding, content, contextLines?)` | Finding + surrounding source lines |
| `createErrorReport(results, options?)` | Full ASCII-boxed report with summary |
| `getAutoFixableFindings(results)` | Filter to fixable findings with fix data |

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types and schemas
- [`@reaatech/agents-markdown-parser`](https://www.npmjs.com/package/@reaatech/agents-markdown-parser) — Markdown AST parser
- [`@reaatech/agents-markdown-linter`](https://www.npmjs.com/package/@reaatech/agents-markdown-linter) — Linting rules engine

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
