---
skill_id: "scaffolding"
display_name: "Scaffolding"
version: "1.0.0"
description: "Template-based file generation for new agents and skills"
category: "tool"
---

# Scaffolding

## Capability

Generates AGENTS.md and SKILL.md files from templates, creating a complete directory structure with placeholder content and instructions for AI agents.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `scaffold_agent` | `z.object({ type: z.enum(['mcp-server', 'orchestrator', 'classifier', 'router', 'evaluator']), agent_id: z.string(), display_name: z.string(), output_dir: z.string(), skills: z.array(z.string()).optional() })` | `{ created: string[], skipped: string[], warnings: string[] }` | 30 RPM |
| `scaffold_skill` | `z.object({ skill_id: z.string(), display_name: z.string(), category: z.enum(['tool', 'orchestration', 'evaluation', 'routing']), output_dir: z.string() })` | `{ created: string[], warnings: string[] }` | 30 RPM |
| `preview_scaffold` | `z.object({ type: z.enum(['mcp-server', 'orchestrator', 'classifier', 'router', 'evaluator']), agent_id: z.string(), skills: z.array(z.string()).optional() })` | `{ files: { path: string, content: string }[] }` | 60 RPM |
| `list_templates` | `z.object({})` | `{ templates: { type: string, description: string, skills: string[] }[] }` | 60 RPM |

## Usage Examples

### Example 1: Scaffold a new MCP server agent

- **User intent:** Create a new MCP server agent with standard skills
- **Tool call:**
  ```json
  {
    "name": "scaffold_agent",
    "arguments": {
      "type": "mcp-server",
      "agent_id": "my-data-agent",
      "display_name": "My Data Agent",
      "output_dir": "./agents/my-data-agent",
      "skills": ["data-query", "data-validation"]
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "created": [
      "./agents/my-data-agent/AGENTS.md",
      "./agents/my-data-agent/skills/data-query/skill.md",
      "./agents/my-data-agent/skills/data-validation/skill.md"
    ],
    "skipped": [],
    "warnings": [
      "Remember to update the MCP endpoint in AGENTS.md before deployment"
    ]
  }
  ```

### Example 2: Preview scaffold before generating

- **User intent:** See what files would be created without actually creating them
- **Tool call:**
  ```json
  {
    "name": "preview_scaffold",
    "arguments": {
      "type": "orchestrator",
      "agent_id": "my-orchestrator",
      "skills": ["routing", "circuit-breaker"]
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "files": [
      {
        "path": "AGENTS.md",
        "content": "# My Orchestrator\n\n## What this is\n\nThis document defines the agent interaction model..."
      },
      {
        "path": "skills/routing/skill.md",
        "content": "# Routing\n\n## Capability\n\nRoutes user intents to appropriate agents..."
      },
      {
        "path": "skills/circuit-breaker/skill.md",
        "content": "# Circuit Breaker\n\n## Capability\n\nImplements resilience patterns for agent failures..."
      }
    ]
  }
  ```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Directory exists | Output directory already has files | Skip existing files, report warnings |
| Invalid agent_id | Contains invalid characters | Return error with valid format suggestion |
| Permission denied | No write access to directory | Return error suggesting permission fix |
| Invalid template | Template type not found | Return error with available template list |

### Recovery Strategies

- **Existing files:** Skip files that already exist, report in warnings
- **Invalid IDs:** Suggest using lowercase alphanumeric with hyphens only
- **Permission issues:** Suggest running with appropriate permissions
- **Template errors:** Fall back to default template with warning

## Security Considerations

### PII Handling

- Never include real user data in generated examples
- Use placeholder values like `user-123`, `example@example.com`
- Don't include actual API keys or secrets in templates

### Permissions

- Write access required for output directory
- Create parent directories if they don't exist
- Never overwrite existing files without explicit consent

### Audit Logging

- Log all scaffold operations with agent_id and output path
- Include request_id for tracing
- Track files created and skipped
