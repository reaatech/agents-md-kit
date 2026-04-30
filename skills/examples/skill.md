---
skill_id: "examples"
display_name: "Examples Gallery"
version: "1.0.0"
description: "Curated example gallery for AGENTS.md and SKILL.md files"
category: "tool"
---

# Examples Gallery

## Capability

Provides a curated collection of example AGENTS.md and SKILL.md files that demonstrate best practices, common patterns, and reference implementations for AI agent development across all agent types.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `get_examples` | `z.object({ type: z.string().optional(), show: z.string().optional() })` | `{ content: string }` or `Array<string>` | 60 RPM |

## Usage Examples

### Example 1: List available example types

- **User intent:** Browse the examples gallery to see available agent types
- **Tool call:**
  ```json
  {
    "name": "get_examples",
    "arguments": {}
  }
  ```
- **Expected response:**

  Content containing a JSON array of available types: `["classifier", "evaluator", "mcp-server", "orchestrator", "router"]`

### Example 2: Get a specific example file

- **User intent:** Retrieve the contents of a specific example file
- **Tool call:**
  ```json
  {
    "name": "get_examples",
    "arguments": {
      "show": "mcp-server/AGENTS.md"
    }
  }
  ```
- **Expected response:**

  The full markdown content of the requested example file. Path traversal is prevented — only files within `examples/` are accessible.

### Example 3: Use CLI to browse examples

```bash
# List available examples
agents-md-kit examples

# Show a specific example
agents-md-kit examples show mcp-server

# Copy an example to current directory
agents-md-kit examples copy mcp-server
```

## Gallery Structure

### Agent Types

The `examples/` directory contains one subdirectory per agent type, each with a full AGENTS.md and skills directory:

```
examples/
├── classifier/
│   ├── AGENTS.md
│   └── skills/
│       ├── intent-classification/skill.md
│       ├── ambiguity-detection/skill.md
│       └── confidence-scoring/skill.md
├── evaluator/
├── mcp-server/
├── orchestrator/
└── router/
```

| Category | Description | Skills Included |
|----------|-------------|-----------------|
| `mcp-server` | Basic MCP server implementation | echo, data-query, file-operation |
| `orchestrator` | Multi-agent orchestration | routing, circuit-breaker, session-management |
| `classifier` | Intent classification | intent-classification, ambiguity-detection, confidence-scoring |
| `router` | LLM model routing | cost-optimization, latency-optimization, judgment-routing |
| `evaluator` | Evaluation harnesses | confusion-matrix, llm-as-judge, regression-gates |

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Example not found | Requested file doesn't exist | Return error with path |
| Path traversal | Requested path escapes examples/ | Return error, blocked |
| Permission denied | Can't read examples directory | Return error |
| Invalid type filter | type doesn't match any example | Return empty list |

### Recovery Strategies

- **Missing examples:** Return available types as suggestions
- **Path traversal:** Block and log the attempt, return error
- **Invalid filters:** Return all types with a warning

## Security Considerations

### Content Validation

- All examples are pre-validated against schemas
- Examples are reviewed before inclusion
- No user-generated content in the core gallery

### PII Handling

- All examples use placeholder data (user-123, example@example.com)
- No real API keys, tokens, or secrets in examples
- No real company names or proprietary information

### Audit Logging

- Log all example access with requested path
- Track popular examples for gallery improvements
- Include request_id for tracing
