# @reaatech/agents-markdown-scaffold

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-scaffold.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-scaffold)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Template-based file generator for creating AGENTS.md and SKILL.md files. Uses [Handlebars](https://handlebarsjs.com/) templates with `{{ variable }}` substitution to scaffold complete agent directories with proper frontmatter, required sections, and skill definitions.

## Installation

```bash
npm install @reaatech/agents-markdown-scaffold
# or
pnpm add @reaatech/agents-markdown-scaffold
```

## Feature Overview

- **Agent scaffolding** — Generate a complete agent directory with AGENTS.md and one skill per listed skill ID
- **Dry-run preview** — Check what files would be created without writing to disk
- **Template engine** — Variable substitution with `{{ key }}` placeholders and Handlebars `.hbs` templates
- **Conflict handling** — Detect existing files and skip or overwrite based on configuration
- **Built-in templates** — Ships with `agents-md.hbs` and `skill-md.hbs` templates
- **All agent types** — Supports `mcp`, `orchestrator`, `classifier`, `router`, and `evaluator` agent types

## Quick Start

```typescript
import { generateFiles, previewGeneration } from "@reaatech/agents-markdown-scaffold";

const config = {
  agentType: "mcp",
  agentId: "my-mcp-server",
  displayName: "My MCP Server",
  description: "An example MCP server agent",
  version: "1.0.0",
  outputDir: "./my-agent",
  overwrite: false,
  skills: [
    { skillId: "echo", displayName: "Echo", skillType: "tool", description: "Echoes input back" },
    { skillId: "data-query", displayName: "Data Query", skillType: "tool" },
  ],
};

const result = generateFiles(config);
console.log(`Created: ${result.created.join(", ")}`);
console.log(`Skipped: ${result.skipped.join(", ")}`);
if (result.errors.length) {
  console.error(result.errors);
}

// Dry-run to preview what would be created
const preview = previewGeneration(config);
for (const entry of preview) {
  console.log(`${entry.exists ? "exists" : "new"}: ${entry.path}`);
}
```

## API Reference

### `generateFiles(config)`

Creates an AGENTS.md file and one SKILL.md file per listed skill. Returns a result listing created, skipped, and errored paths.

```typescript
function generateFiles(config: ScaffoldConfig): GenerateResult

interface GenerateResult {
  created: string[];
  skipped: string[];
  errors: string[];
}

interface ScaffoldConfig {
  agentType: "mcp" | "orchestrator" | "classifier" | "router" | "evaluator";
  agentId: string;
  displayName: string;
  description?: string;
  version?: string;
  skills: ScaffoldSkillConfig[];
  outputDir: string;
  overwrite?: boolean;
}

interface ScaffoldSkillConfig {
  skillId: string;
  displayName: string;
  skillType: "tool" | "orchestration" | "evaluation" | "routing";
  description?: string;
}
```

### `previewGeneration(config)`

Dry-run preview. Returns array of `{ path, exists }` objects showing what would be created.

```typescript
function previewGeneration(
  config: ScaffoldConfig
): Array<{ path: string; exists: boolean }>
```

### `compileTemplate(template, context)`

Variable substitution engine. Replaces `{{ key }}` placeholders with context values. Unmatched placeholders are removed.

```typescript
function compileTemplate(
  template: string,
  context: TemplateContext
): string

interface TemplateContext {
  [key: string]: string | string[] | boolean | number;
}
```

### `loadTemplate(templateName)`

Load a `.hbs` template file from the `templates/` directory.

```typescript
function loadTemplate(templateName: string): string
```

### `getAvailableTemplates()`

List available template names (`.hbs` files minus extension).

```typescript
function getAvailableTemplates(): string[]
```

## Generated File Structure

Running `generateFiles` with the Quick Start config above produces:

```
my-agent/
├── AGENTS.md
└── skills/
    ├── echo/
    │   └── skill.md
    └── data-query/
        └── skill.md
```

Each file is populated from the template with proper YAML frontmatter, all required sections, and content based on the provided configuration.

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types and `ScaffoldConfig` interface
- [`@reaatech/agents-markdown-validator`](https://www.npmjs.com/package/@reaatech/agents-markdown-validator) — Schema validation for generated files
- [`@reaatech/agents-markdown-linter`](https://www.npmjs.com/package/@reaatech/agents-markdown-linter) — Linting rules for generated files

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
