# @reaatech/agents-markdown-mcp-server

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-mcp-server.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

MCP (Model Context Protocol) server exposing agents-markdown tools for AI agent integration. Built on the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), this package provides five tools — `lint_agents_md`, `validate_agents_md`, `validate_skill_md`, `scaffold_agent`, and `get_examples` — over both Stdio and StreamableHTTP transports.

## Installation

```bash
npm install @reaatech/agents-markdown-mcp-server
# or
pnpm add @reaatech/agents-markdown-mcp-server
```

The MCP SDK (`@modelcontextprotocol/sdk`) is installed as a dependency.

## Feature Overview

- **Five MCP tools** — Lint, validate, scaffold, and browse example agent files through the MCP protocol
- **Dual transports** — Stdio (for local agent integration) and StreamableHTTP (for remote agent access)
- **Zod-validated inputs** — Every tool validates its arguments with Zod schemas before execution
- **Graceful shutdown** — Handles `SIGINT`/`SIGTERM` to close the MCP server cleanly
- **Error isolation** — Tool failures return structured `isError: true` responses without crashing the server

## Quick Start

### As a Standalone Server

```typescript
import { startMcpServer } from "@reaatech/agents-markdown-mcp-server";

// StreamableHTTP transport (for network-accessible agents)
await startMcpServer("streamable-http");

// Stdio transport (for local tool-calling agents)
await startMcpServer("stdio");
```

### Programmatic Server Creation

```typescript
import { createMcpServer } from "@reaatech/agents-markdown-mcp-server";

const server = createMcpServer();
// server is now configured with all 5 tools registered
// You can attach your own transport, handlers, etc.
```

## API Reference

### `createMcpServer()`

Creates an MCP `Server` instance with all five tools registered and request handlers wired up.

```typescript
function createMcpServer(): Server
```

Returns a configured `Server` from `@modelcontextprotocol/sdk`. The server has:
- `name: "agents-md-kit"`
- `version: VERSION` (from `@reaatech/agents-markdown`)
- `capabilities: { tools: {} }`
- ListTools handler returning all 5 tool definitions
- CallTool handler dispatching to the correct tool

### `startMcpServer(transportType?)`

Starts the MCP server with the specified transport. Listens for `SIGINT`/`SIGTERM` for graceful shutdown.

```typescript
async function startMcpServer(
  transportType?: "stdio" | "streamable-http"
): Promise<void>
```

| Transport | Default | Use Case |
|-----------|---------|----------|
| `streamable-http` | Yes | Remote agents, HTTP-accessible tools |
| `stdio` | No | Local tool-calling agents, Claude Desktop |

### MCP Tools

#### `lint_agents_md`

Lint an AGENTS.md or SKILL.md file. Accepts content inline or a file path.

```json
{
  "name": "lint_agents_md",
  "arguments": {
    "filePath": "./AGENTS.md",
    "severity": "warning",
    "format": "json"
  }
}
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `content` | `string` | Conditional | Raw markdown content (mutually exclusive with `filePath`) |
| `filePath` | `string` | Conditional | Path to file on disk |
| `severity` | `string` | No | Minimum severity to include (`error`, `warning`, `info`, `suggestion`) |

#### `validate_agents_md`

Validate an AGENTS.md file against the Zod schema.

```json
{
  "name": "validate_agents_md",
  "arguments": {
    "filePath": "./AGENTS.md",
    "strict": true
  }
}
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `content` | `string` | Conditional | Raw markdown content |
| `filePath` | `string` | Conditional | Path to file on disk |
| `strict` | `boolean` | No | Fail on warnings in addition to errors |

#### `validate_skill_md`

Validate a SKILL.md file against the Zod schema. Same input schema as `validate_agents_md`.

#### `scaffold_agent`

Generate AGENTS.md and SKILL.md files from templates.

```json
{
  "name": "scaffold_agent",
  "arguments": {
    "agentId": "my-mcp-server",
    "displayName": "My MCP Server",
    "agentType": "mcp",
    "outputDir": "./my-agent",
    "skills": [
      { "skillId": "echo", "displayName": "Echo", "skillType": "tool" }
    ]
  }
}
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `agentId` | `string` | Yes | Agent identifier |
| `displayName` | `string` | Yes | Human-readable name |
| `agentType` | `string` | Yes | `mcp`, `orchestrator`, `classifier`, `router`, or `evaluator` |
| `outputDir` | `string` | Yes | Output directory path |
| `description` | `string` | No | Agent description |
| `version` | `string` | No | Version string (default: `1.0.0`) |
| `overwrite` | `boolean` | No | Overwrite existing files |
| `skills` | `array` | No | List of skill config objects (`skillId`, `displayName`, `skillType`, `description?`) |

#### `get_examples`

List available example types or return the contents of a specific example file. Reads from the local `examples/` directory.

```json
{
  "name": "get_examples",
  "arguments": {
    "type": "mcp-server",
    "show": "mcp-server/AGENTS.md"
  }
}
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `string` | No | Filter to one example type |
| `show` | `string` | No | Return the contents of a specific example file (path traversal protected) |

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types and schemas
- [`@reaatech/agents-markdown-linter`](https://www.npmjs.com/package/@reaatech/agents-markdown-linter) — Linting rules engine
- [`@reaatech/agents-markdown-validator`](https://www.npmjs.com/package/@reaatech/agents-markdown-validator) — Schema validation engine
- [`@reaatech/agents-markdown-scaffold`](https://www.npmjs.com/package/@reaatech/agents-markdown-scaffold) — File generator
- [`@reaatech/agents-markdown-cli`](https://www.npmjs.com/package/@reaatech/agents-markdown-cli) — CLI tool

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
