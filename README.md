# agents-md-kit

[![CI](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

> Linter, validator, and scaffolding tool for **AGENTS.md** and **SKILL.md** files — the "durable agent instruction artifacts" that define how AI agents behave, what skills they possess, and how they integrate into multi-agent systems.

This monorepo provides a complete toolkit for creating, validating, and maintaining agent instruction files that follow [community best practices](https://github.com/reaatech/agents-md-kit). Each package is independently versioned and published under the `@reaatech/agents-markdown-*` scope.

## Features

- **Schema Validation** — Zod-based validation for AGENTS.md and SKILL.md structure, with frontmatter, required sections, and content quality checks
- **Linting** — 18 built-in rules across style, content, and best-practice categories, with auto-fix for formatting issues
- **Scaffolding** — Template-based generation of complete agent directories with proper YAML frontmatter and required sections
- **Multi-format reporting** — Console, JSON, HTML, and Markdown output for CI/CD pipelines, build artifacts, and PR comments
- **MCP integration** — Five MCP tools exposed via Stdio and StreamableHTTP transports for AI agent integration
- **Observability** — Structured logging via Pino with OpenTelemetry tracing and metrics

## Installation

### Using the Packages

```bash
# Core types, schemas, and utilities
pnpm add @reaatech/agents-markdown
# Markdown AST parser with YAML frontmatter extraction
pnpm add @reaatech/agents-markdown-parser
# Schema validation engine
pnpm add @reaatech/agents-markdown-validator
# Linting rules engine with 18 built-in rules
pnpm add @reaatech/agents-markdown-linter
# Template-based file generator
pnpm add @reaatech/agents-markdown-scaffold
# Console, JSON, HTML, and Markdown reporters
pnpm add @reaatech/agents-markdown-reporter
# Structured logging and OTel metrics
pnpm add @reaatech/agents-markdown-observability
# CLI tool (global install recommended)
pnpm add -g @reaatech/agents-markdown-cli
# MCP server for AI agent integration
pnpm add @reaatech/agents-markdown-mcp-server
```

### Contributing

```bash
git clone https://github.com/reaatech/agents-md-kit.git
cd agents-md-kit
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## Quick Start

```typescript
import { parseMarkdown } from "@reaatech/agents-markdown-parser";
import { runLintRules } from "@reaatech/agents-markdown-linter";
import { validate } from "@reaatech/agents-markdown-validator";
import { generateFiles } from "@reaatech/agents-markdown-scaffold";
import { reportLintResult } from "@reaatech/agents-markdown-reporter";

// Parse an AGENTS.md file
const doc = await parseMarkdown(content, "./AGENTS.md");

// Lint it
const lintResult = runLintRules(doc);
console.log(reportLintResult(lintResult));

// Validate it
const validationResult = validate(doc, { strict: true });
if (!validationResult.valid) {
  console.error(validationResult.errors);
}

// Scaffold a new agent
const scaffoldResult = generateFiles({
  agentType: "mcp",
  agentId: "my-agent",
  displayName: "My Agent",
  outputDir: "./my-agent",
  skills: [{ skillId: "echo", displayName: "Echo", skillType: "tool" }],
});
```

See the [`examples/`](./examples/) directory for complete AGENTS.md and SKILL.md files for each agent type.

## Packages

| Package | Description |
|---------|-------------|
| [`@reaatech/agents-markdown`](./packages/agents-markdown) | Core domain types, Zod schemas, and shared utilities |
| [`@reaatech/agents-markdown-parser`](./packages/parser) | Markdown AST parser with YAML frontmatter extraction |
| [`@reaatech/agents-markdown-validator`](./packages/validator) | Schema validation engine for AGENTS.md and SKILL.md |
| [`@reaatech/agents-markdown-linter`](./packages/linter) | Style, content, and best-practice linting rules |
| [`@reaatech/agents-markdown-scaffold`](./packages/scaffold) | Template-based file generator |
| [`@reaatech/agents-markdown-reporter`](./packages/reporter) | Console, JSON, HTML, and Markdown output reporters |
| [`@reaatech/agents-markdown-observability`](./packages/observability) | Structured logging and OpenTelemetry metrics |
| [`@reaatech/agents-markdown-cli`](./packages/cli) | Command-line interface (`agents-md-kit`) |
| [`@reaatech/agents-markdown-mcp-server`](./packages/mcp-server) | MCP server exposing tools via Model Context Protocol |

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System design deep dive with data flow and component diagrams
- [`AGENTS.md`](./AGENTS.md) — Self-describing AGENTS.md for this project
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Development setup and contribution guidelines
- [`docs/SCHEMA_REFERENCE.md`](./docs/SCHEMA_REFERENCE.md) — Complete AGENTS.md and SKILL.md schema documentation
- [`docs/LINT_RULES.md`](./docs/LINT_RULES.md) — Lint rules reference with examples

## License

[MIT](LICENSE)
