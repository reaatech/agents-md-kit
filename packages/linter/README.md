# @reaatech/agents-markdown-linter

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-linter.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-linter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Style, content, and best-practice linting rules for AGENTS.md and SKILL.md files. Ships with 18 built-in rules across three categories, plus an extensible rule registry and auto-fix engine for format-level issues.

## Installation

```bash
npm install @reaatech/agents-markdown-linter
# or
pnpm add @reaatech/agents-markdown-linter
```

## Feature Overview

- **18 built-in rules** — Style (6), Content (7), Best Practice (5) covering formatting, structure, and quality
- **Extensible rule registry** — Register custom lint rules with `registerRule`
- **Auto-fix engine** — Fix trailing whitespace, missing code block languages, inconsistent table formats, and missing headings
- **Severity levels** — `error`, `warning`, `info`, `suggestion`
- **Per-rule isolation** — A failing rule does not abort the lint run
- **Finding output** — Standard `Finding[]` format consumable by reporters

## Quick Start

```typescript
import { parseMarkdown } from "@reaatech/agents-markdown-parser";
import { runLintRules, registerRule, runAutoFix } from "@reaatech/agents-markdown-linter";

const doc = await parseMarkdown(content, "./AGENTS.md");
const result = runLintRules(doc);

console.log(`Errors: ${result.errorCount}, Warnings: ${result.warningCount}`);

for (const finding of result.findings) {
  console.log(`${finding.severity}: ${finding.rule} — ${finding.message}`);
}

// Auto-fix formatting issues
const fixed = runAutoFix(content, ["trailing-whitespace", "no-code-language", "table-format"]);
```

## API Reference

### `runLintRules(document)`

Runs all registered rules against a document. Catches per-rule errors so one failing rule does not abort the run.

```typescript
function runLintRules(
  document: AgentsMdDocument | SkillMdDocument
): LintResult
```

### `registerRule(category, ruleId, rule, definition)`

Register a custom lint rule. Rules are side-effect modules — importing `@reaatech/agents-markdown-linter` automatically registers all built-in rules.

```typescript
function registerRule(
  category: "style" | "content" | "bestPractice",
  ruleId: string,
  rule: LintRule,
  definition: RuleDefinition
): void
```

### `getRegisteredRules()`

```typescript
function getRegisteredRules(): RuleDefinition[]
```

### `runAutoFix(content, ruleIds)`

Apply auto-fixes for the specified rules. Returns the fixed content string.

```typescript
function runAutoFix(content: string, ruleIds: string[]): string
```

### `getAutoFixableRules()`

Returns the list of rule IDs that support auto-fix.

```typescript
function getAutoFixableRules(): string[]
```

## Built-in Rules

### Style Rules

| Rule ID | Severity | Auto-fix | Description |
|---------|----------|----------|-------------|
| `heading-order` | warning | No | Heading levels must not be skipped (e.g., `##` then `####`) |
| `no-code-language` | warning | Yes | Code blocks should specify a language |
| `trailing-whitespace` | info | Yes | Lines must not have trailing whitespace |
| `line-too-long` | info | No | Lines must not exceed 120 characters |
| `table-format` | warning | Yes | Table rows must have consistent column counts |
| `list-format` | warning | No | List markers must be consistent within a list |

### Content Rules

| Rule ID | Severity | Auto-fix | Description |
|---------|----------|----------|-------------|
| `heading-missing` | error | Yes | Required section headings must be present |
| `empty-section` | warning | No | Sections must contain content |
| `placeholder-text` | warning | No | No `TODO`/`FIXME`/`TBD` placeholders |
| `duplicate-section` | error | No | Section titles must be unique |
| `broken-skill-ref` | error | No | Referenced skill files must exist |
| `duplicate-skill-id` | error | No | Skill IDs must be unique |
| `section-ordering` | warning | No | Sections should follow recommended order |
| `min-content-length` | warning | No | Sections should have minimum content (20 chars) |

### Best Practice Rules

| Rule ID | Severity | Auto-fix | Description |
|---------|----------|----------|-------------|
| `missing-pii-mention` | warning | No | Security section should mention PII handling |
| `missing-observability` | warning | No | Observability section should mention structured logging |
| `incomplete-examples` | warning | No | Usage examples should include both success and error cases |
| `missing-mcp-schema` | warning | No | MCP tools should have input schemas documented |
| `missing-confidence` | error | No | Agent config must include `confidence_threshold` |

### Custom Rule Example

```typescript
import { registerRule } from "@reaatech/agents-markdown-linter";

registerRule("style", "my-custom-rule",
  (doc) => {
    const findings = [];
    if (!doc.frontmatter.description) {
      findings.push({
        ruleId: "my-custom-rule",
        severity: "warning",
        message: "Description is recommended in frontmatter",
      });
    }
    return findings;
  },
  {
    id: "my-custom-rule",
    description: "Enforce description in frontmatter",
    severity: "warning",
    category: "style",
    autoFixable: false,
  }
);
```

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types and domain interfaces
- [`@reaatech/agents-markdown-parser`](https://www.npmjs.com/package/@reaatech/agents-markdown-parser) — Markdown AST parser
- [`@reaatech/agents-markdown-validator`](https://www.npmjs.com/package/@reaatech/agents-markdown-validator) — Schema validation engine

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
