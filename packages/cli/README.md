# @reaatech/agents-markdown-cli

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-cli.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Command-line interface for linting, validating, scaffolding, and formatting AGENTS.md and SKILL.md files. Built on [Commander](https://github.com/tj/commander.js) with colorized output, JSON/HTML/Markdown reporting, and CI-friendly exit codes.

## Installation

```bash
npm install -g @reaatech/agents-markdown-cli
# or
pnpm add -g @reaatech/agents-markdown-cli
```

## Feature Overview

- **Five subcommands** — `lint`, `validate`, `scaffold`, `format`, `examples`
- **Multi-format output** — Console, JSON, HTML, and Markdown reporters
- **CI/CD ready** — Structured exit codes (`0` = pass, `1` = errors, `2` = warnings, `3` = execution error)
- **Directory traversal** — Lint or validate entire agent directories recursively
- **Auto-fix** — Format command with `--fix` and `--dry-run` modes
- **Example gallery** — List, show, and copy example agent and skill files
- **Observability** — All operations emit structured logs and OTel metrics

## Quick Start

```bash
# Lint a single file
agents-md-kit lint ./AGENTS.md

# Lint a directory, output JSON
agents-md-kit lint ./agents/ --format json --output lint-results.json

# Validate in strict mode
agents-md-kit validate ./AGENTS.md --strict

# Scaffold a new MCP server agent
agents-md-kit scaffold \
  --agent-id my-mcp-server \
  --display-name "My MCP Server" \
  --agent-type mcp \
  --output-dir ./my-agent/

# Auto-fix formatting (dry-run first)
agents-md-kit format ./agents/ --fix --dry-run
agents-md-kit format ./agents/ --fix

# List available examples
agents-md-kit examples
agents-md-kit examples show mcp-server
```

## API Reference

### Library Usage

The CLI also exports utility functions for programmatic use:

```typescript
import {
  lintFile,
  lintDirectory,
  validateFile,
  validateDirectory,
  parseFile,
  scaffoldAgent,
  applyFixesToFile,
  findMarkdownFiles,
  filterLintResult,
  pathIsDirectory,
} from "@reaatech/agents-markdown-cli";
```

#### File Operations

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseFile` | `(filePath: string) => Promise<Document>` | Parse a file into a document |
| `lintFile` | `(filePath: string) => Promise<LintResult>` | Lint a single file |
| `lintDirectory` | `(dirPath: string) => Promise<LintResult[]>` | Lint all markdown files in a directory |
| `validateFile` | `(filePath: string, strict?: boolean) => Promise<ValidationResult>` | Validate a single file |
| `validateDirectory` | `(dirPath: string, strict?: boolean) => Promise<ValidationResult[]>` | Validate all markdown files in a directory |
| `scaffoldAgent` | `(config: ScaffoldConfig, dryRun?: boolean) => GenerateResult` | Generate agent files |
| `applyFixesToFile` | `(filePath: string, ruleIds: string[]) => Promise<{original, fixed}>` | Apply auto-fixes to a file |
| `findMarkdownFiles` | `(dirPath: string) => Promise<string[]>` | Recursive markdown file discovery |
| `filterLintResult` | `(result: LintResult, minSeverity: Severity) => LintResult` | Filter findings by severity threshold |
| `pathIsDirectory` | `(path: string) => Promise<boolean>` | Check if a path is a directory |

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed (no errors, no warnings above threshold) |
| `1` | Validation errors found |
| `2` | Lint warnings found (with `--fail-on warning`) |
| `3` | Execution error (file not found, parse error, internal failure) |

### CLI Options

#### `lint`

| Option | Type | Description |
|--------|------|-------------|
| `--format` | `console \| json \| html \| markdown` | Output format (default: `console`) |
| `--output` | `string` | Write output to file |
| `--fail-on` | `error \| warning \| info` | Minimum severity to fail on (default: `error`) |

#### `validate`

| Option | Type | Description |
|--------|------|-------------|
| `--strict` | `boolean` | Fail on warnings in addition to errors |
| `--format` | `console \| json \| markdown` | Output format |
| `--output` | `string` | Write output to file |

#### `scaffold`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--agent-id` | `string` | Yes | Agent identifier |
| `--display-name` | `string` | Yes | Human-readable name |
| `--agent-type` | `mcp \| orchestrator \| classifier \| router \| evaluator` | Yes | Agent type |
| `--description` | `string` | No | Agent description |
| `--version` | `string` | No | Version string (default: `1.0.0`) |
| `--output-dir` | `string` | Yes | Output directory |
| `--overwrite` | `boolean` | No | Overwrite existing files |
| `--skills` | `string` | No | Comma-separated skill IDs |

#### `format`

| Option | Type | Description |
|--------|------|-------------|
| `--fix` | `boolean` | Apply fixes (default: off, dry-run only) |
| `--dry-run` | `boolean` | Preview fixes without writing |
| `--rules` | `string` | Comma-separated rule IDs to fix (default: all fixable) |

## CI/CD Integration

```yaml
# .github/workflows/agents-md-lint.yml
- name: Lint agent files
  run: |
    pnpm add -g @reaatech/agents-markdown-cli
    agents-md-kit lint ./agents/ --format json --output lint-results.json

- name: Validate schema
  run: agents-md-kit validate ./agents/ --strict
```

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types and schemas
- [`@reaatech/agents-markdown-linter`](https://www.npmjs.com/package/@reaatech/agents-markdown-linter) — Linting rules engine
- [`@reaatech/agents-markdown-validator`](https://www.npmjs.com/package/@reaatech/agents-markdown-validator) — Schema validation engine
- [`@reaatech/agents-markdown-scaffold`](https://www.npmjs.com/package/@reaatech/agents-markdown-scaffold) — File generator
- [`@reaatech/agents-markdown-mcp-server`](https://www.npmjs.com/package/@reaatech/agents-markdown-mcp-server) — MCP server

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
