---
skill_id: "examples"
display_name: "Examples Gallery"
version: "1.0.0"
description: "Curated example gallery for AGENTS.md and SKILL.md files"
category: "tool"
---

# Examples Gallery

## Capability

Provides a curated collection of example AGENTS.md and SKILL.md files that demonstrate best practices, common patterns, and reference implementations for AI agent development.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `list_examples` | `z.object({ type: z.enum(['agents', 'skill', 'all']).optional(), category: z.string().optional() })` | `{ examples: { id: string, type: string, category: string, description: string, path: string }[] }` | 60 RPM |
| `get_example` | `z.object({ id: z.string() })` | `{ content: string, metadata: { type: string, category: string, tags: string[] } }` | 60 RPM |
| `search_examples` | `z.object({ query: z.string(), type: z.enum(['agents', 'skill']).optional() })` | `{ results: { id: string, type: string, description: string, relevance: number }[] }` | 60 RPM |
| `suggest_example` | `z.object({ agent_type: z.string(), use_case: z.string() })` | `{ examples: { id: string, description: string, relevance: number }[] }` | 60 RPM |

## Usage Examples

### Example 1: List all available examples

- **User intent:** Browse the examples gallery to find relevant templates
- **Tool call:**
  ```json
  {
    "name": "list_examples",
    "arguments": {
      "type": "agents"
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "examples": [
      {
        "id": "mcp-server-basic",
        "type": "agents",
        "category": "mcp-server",
        "description": "Basic MCP server with echo tool — minimal viable agent",
        "path": "examples/agents/mcp-server-basic.md"
      },
      {
        "id": "orchestrator-multi-agent",
        "type": "agents",
        "category": "orchestrator",
        "description": "Multi-agent orchestrator with confidence-gated routing",
        "path": "examples/agents/orchestrator-multi-agent.md"
      },
      {
        "id": "classifier-intent",
        "type": "agents",
        "category": "classifier",
        "description": "Intent classifier with fallback chains and ambiguity detection",
        "path": "examples/agents/classifier-intent.md"
      }
    ]
  }
  ```

### Example 2: Get a specific example

- **User intent:** Retrieve the full content of an example AGENTS.md
- **Tool call:**
  ```json
  {
    "name": "get_example",
    "arguments": {
      "id": "mcp-server-basic"
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "content": "# My MCP Server\n\n## What this is\n\nThis agent provides basic MCP tools for data processing...\n\n[Full content of the example file...]",
    "metadata": {
      "type": "agents",
      "category": "mcp-server",
      "tags": ["basic", "mcp", "starter", "echo"]
    }
  }
  ```

### Example 3: Search examples by keyword

- **User intent:** Find examples related to circuit breakers
- **Tool call:**
  ```json
  {
    "name": "search_examples",
    "arguments": {
      "query": "circuit breaker resilience"
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "results": [
      {
        "id": "orchestrator-multi-agent",
        "type": "agents",
        "description": "Multi-agent orchestrator with circuit breaker pattern",
        "relevance": 0.92
      },
      {
        "id": "skill-circuit-breaker",
        "type": "skill",
        "description": "Circuit breaker skill with leader election and persistence",
        "relevance": 0.88
      }
    ]
  }
  ```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Example not found | ID doesn't exist | Return error with list of available IDs |
| Search returned no results | Query too specific | Suggest broader search terms |
| Parse error | Corrupted example file | Skip file, log error, continue |
| Category not found | Invalid category filter | Return error with available categories |

### Recovery Strategies

- **Missing examples:** Suggest similar examples or use search
- **No search results:** Suggest broader terms or list all examples
- **Parse errors:** Log error, skip the file, continue with others
- **Invalid category:** Return list of available categories

## Security Considerations

### Content Validation

- All examples are pre-validated against schemas
- Examples are reviewed before inclusion in the gallery
- No user-generated content in the core gallery

### PII Handling

- All examples use placeholder data (user-123, example@example.com)
- No real API keys, tokens, or secrets in examples
- No real company names or proprietary information

### Audit Logging

- Log all example access with example ID and user context
- Track popular examples for gallery improvements
- Include request_id for tracing

## Gallery Structure

### Agent Types

| Category | Description | Examples |
|----------|-------------|----------|
| `mcp-server` | Basic MCP server implementations | echo, data-query, file-processor |
| `orchestrator` | Multi-agent orchestration | confidence-gated, load-balanced, hierarchical |
| `classifier` | Intent classification | text-classifier, multi-modal, fuzzy-match |
| `router` | LLM model routing | cost-optimized, latency-optimized, judgment-based |
| `evaluator` | Evaluation harnesses | classifier-evals, quality-scorer, regression-gates |

### Skill Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `tool` | MCP tool implementations | echo, query, transform |
| `orchestration` | Multi-agent coordination | routing, circuit-breaker, session-management |
| `evaluation` | Quality assessment | confusion-matrix, llm-judge, regression-gates |
| `routing` | Request routing | cost-based, latency-based, capability-based |
