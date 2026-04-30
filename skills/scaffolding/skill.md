---
skill_id: "scaffolding"
display_name: "Scaffolding"
version: "1.0.0"
description: "Template-based file generation for new agents and skills"
category: "tool"
---

# Scaffolding

## Capability

Generates AGENTS.md and SKILL.md files from Handlebars templates, creating a complete directory structure with proper frontmatter, required sections, and skill definitions for all agent types.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `scaffold_agent` | `z.object({ agentId: z.string(), displayName: z.string(), agentType: z.enum(['mcp','orchestrator','classifier','router','evaluator']), outputDir: z.string(), description: z.string().optional(), version: z.string().optional(), overwrite: z.boolean().optional(), skills: z.array(z.object({ skillId: z.string(), displayName: z.string(), skillType: z.enum(['tool','orchestration','evaluation','routing']), description: z.string().optional() })).optional() })` | `{ created: string[], skipped: string[], errors: string[] }` | 30 RPM |

## Usage Examples

### Example 1: Scaffold a new MCP server agent

- **User intent:** Create a new MCP server agent with standard skills
- **Tool call:**
  ```json
  {
    "name": "scaffold_agent",
    "arguments": {
      "agentId": "my-data-agent",
      "displayName": "My Data Agent",
      "agentType": "mcp",
      "outputDir": "./agents/my-data-agent",
      "description": "A data processing MCP server agent",
      "skills": [
        { "skillId": "data-query", "displayName": "Data Query", "skillType": "tool" },
        { "skillId": "data-validation", "displayName": "Data Validation", "skillType": "tool" }
      ]
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
    "errors": []
  }
  ```

### Example 2: Scaffold an orchestrator with dry-run

- **User intent:** Preview what would be generated without writing files
- **Use the CLI:**
  ```bash
  agents-md-kit scaffold \
    --agent-id my-orchestrator \
    --display-name "My Orchestrator" \
    --agent-type orchestrator \
    --output-dir ./agents/my-orchestrator \
    --skills routing,circuit-breaker \
    --dry-run
  ```
- **Expected output:**

  Lists files that would be created with whether they already exist. No files written.

### Example 3: Scaffold with library API

```typescript
import { generateFiles, previewGeneration } from "@reaatech/agents-markdown-scaffold";

const config = {
  agentType: "mcp",
  agentId: "my-agent",
  displayName: "My Agent",
  outputDir: "./my-agent",
  overwrite: false,
  skills: [
    { skillId: "echo", displayName: "Echo", skillType: "tool" },
  ],
};

// Dry-run preview
const preview = previewGeneration(config);

// Generate files
const result = generateFiles(config);
console.log(result.created, result.skipped, result.errors);
```

## Generated Structure

```
outputDir/
├── AGENTS.md           # Full template with all required sections
└── skills/
    └── {skill-id}/
        └── skill.md    # Full template with all required sections
```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Directory exists | Output directory already has files | Skip existing files, report in skipped |
| Invalid agentId | Contains invalid characters | Return error with valid format suggestion |
| Permission denied | No write access to directory | Return error suggesting permission fix |
| Invalid agentType | Not a recognized agent type | Return error with valid type list |

### Recovery Strategies

- **Existing files:** Skip files that already exist (or overwrite if configured)
- **Invalid IDs:** Suggest using lowercase alphanumeric with hyphens only
- **Permission issues:** Suggest running with appropriate permissions
- **Unknown types:** Return list of valid agent types

## Security Considerations

### PII Handling

- Never include real user data in generated examples
- Use placeholder values like `user-123`, `example@example.com`
- Don't include actual API keys or secrets in templates

### Permissions

- Write access required for output directory
- Create parent directories if they don't exist
- Never overwrite existing files without explicit consent (overwrite: true)

### Audit Logging

- Log all scaffold operations with agentId and output path
- Include request_id for tracing
- Track files created and skipped
