# @reaatech/agents-markdown-reporter

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-reporter.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-reporter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Multi-format output reporters for lint and validation results. Supports console (ANSI-colorized), JSON (machine-readable), HTML (interactive dashboard), and Markdown (GitHub-flavored) formats.

## Installation

```bash
npm install @reaatech/agents-markdown-reporter
# or
pnpm add @reaatech/agents-markdown-reporter
```

## Feature Overview

- **Console output** — ANSI-colorized terminal output with severity icons, line references, and suggestions
- **JSON output** — Machine-readable `LintJsonOutput` / `ValidationJsonOutput` with schema version and timestamps
- **HTML reports** — Self-contained interactive dashboard with inline CSS, suitable for CI artifacts
- **Markdown reports** — GitHub-flavored tables and bullet lists for PR comments
- **Disambiguated exports** — Each format has uniquely named functions to avoid collisions

## Quick Start

```typescript
import {
  reportLintResult,
  reportHtmlLintResult,
  reportJsonLintResult,
  reportMarkdownLintResult,
  generateHtmlReport,
  writeHtmlReport,
} from "@reaatech/agents-markdown-reporter";
import {
  reportValidationResult,
  reportJsonValidationResult,
  reportMarkdownValidationResult,
} from "@reaatech/agents-markdown-reporter";

// Console output (colorized, for CLI users)
console.log(reportLintResult(lintResult));

// JSON output (for CI/CD pipelines)
process.stdout.write(reportJsonLintResult(lintResults));

// HTML report to file (for build artifacts)
await writeHtmlReport(results, "./lint-report.html", { title: "Lint Results" });

// Markdown report (for GitHub PR comments)
const md = reportMarkdownLintResult(lintResult);
```

## API Reference

### Console Reporter

| Function | Description |
|----------|-------------|
| `reportLintResult(result, options?)` | Colorized lint output with severity counts |
| `reportValidationResult(result)` | Colorized validation output |
| `reportScaffoldResult(created, skipped, errors)` | Scaffold operation summary |

### JSON Reporter

```typescript
interface LintJsonOutput {
  schemaVersion: string;
  path: string;
  valid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  fixableCount: number;
  findings: Finding[];
  timestamp: string;
}

interface ValidationJsonOutput {
  schemaVersion: string;
  path: string;
  type: "agents" | "skill";
  valid: boolean;
  errorCount: number;
  warningCount: number;
  suggestionCount: number;
  errors: Finding[];
  warnings: Finding[];
  suggestions: Finding[];
  timestamp: string;
}
```

| Function | Description |
|----------|-------------|
| `reportJsonLintResult(results)` | Serialize lint results to JSON string |
| `reportJsonValidationResult(results)` | Serialize validation results to JSON string |
| `lintToJson(result)` | Convert to `LintJsonOutput` object |
| `validationToJson(result)` | Convert to `ValidationJsonOutput` object |

### HTML Reporter

| Function | Description |
|----------|-------------|
| `reportHtmlLintResult(results)` | Generate full HTML document |
| `generateHtmlReport(results, options?)` | Generate HTML with optional title |
| `writeHtmlReport(results, outputPath, options?)` | Write HTML to file |

### Markdown Reporter

| Function | Description |
|----------|-------------|
| `reportMarkdownLintResult(results)` | Generate markdown for one or more lint results |
| `reportMarkdownValidationResult(results)` | Generate markdown for one or more validation results |
| `reportLintAsMarkdown(result)` | Single-result markdown table + bullet list |
| `reportValidationAsMarkdown(result)` | Single-result markdown table + bullet list |

### Format Reference

| Format | Primary Export | Use Case |
|--------|---------------|----------|
| Console | `reportLintResult` | CLI output |
| JSON | `reportJsonLintResult` | CI/CD pipelines, programmatic consumers |
| HTML | `reportHtmlLintResult` / `writeHtmlReport` | Build artifacts, interactive review |
| Markdown | `reportMarkdownLintResult` | GitHub PR comments, changelog entries |

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types (`LintResult`, `ValidationResult`, `Finding`)
- [`@reaatech/agents-markdown-linter`](https://www.npmjs.com/package/@reaatech/agents-markdown-linter) — Linting rules engine
- [`@reaatech/agents-markdown-validator`](https://www.npmjs.com/package/@reaatech/agents-markdown-validator) — Schema validation engine

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
