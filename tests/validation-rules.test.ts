import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../src/parser/markdown-parser.js';
import { validateAgentsMd } from '../src/validator/agents-md-validator.js';
import { validateSkillMd } from '../src/validator/skill-md-validator.js';

describe('document validators', () => {
  it('reports multiple AGENTS.md issues', async () => {
    const content = `---
agent_id: "agent"
display_name: "Agent"
version: "1.0.0"
description: "short"
---

# Agent

## What this is

Test.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const result = validateAgentsMd(document);

    expect(result.valid).toBe(false);
    expect(result.errors.some((finding) => finding.rule === 'heading-missing')).toBe(true);
    expect(result.warnings.some((finding) => finding.rule === 'missing-recommended-section')).toBe(
      true,
    );
  });

  it('reports skill table and examples issues', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

Does a thing.

## MCP Tools

No table here.

## Usage Examples

Only success.

## Error Handling

Handled.

## Security Considerations

Permissions are required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);

    expect(result.valid).toBe(false);
    expect(result.errors.some((finding) => finding.rule === 'missing-tools-table')).toBe(true);
    expect(result.warnings.some((finding) => finding.rule === 'missing-error-example')).toBe(true);
  });

  it('reports invalid frontmatter fields', async () => {
    const content = `---
agent_id: "agent"
display_name: "Agent"
version: "abc"
description: "xy"
---

# Agent

## What this is

Test.

## Architecture Overview

Test.

## Skill System

Test.

## MCP Integration

Test.

## Security Considerations

PII handling documented.

## Observability

Structured logging.

## Checklist: Production Readiness

Done.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const result = validateAgentsMd(document);
    expect(result.errors.some((f) => f.rule === 'invalid-frontmatter')).toBe(true);
  });

  it('reports heading-order when levels are skipped', async () => {
    const content = `---
agent_id: "test"
display_name: "Test"
version: "1.0.0"
description: "A test agent description here"
---

# Test

## What this is

Test.

## Architecture Overview

Test.

## Skill System

### Sub heading

#### SubSub heading

## MCP Integration

Test.

## Security Considerations

PII handling.

## Observability

Logging.

## Checklist: Production Readiness

Done.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const headings = document.sections.flatMap((s) => [s, ...s.subsections]);
    const subSub = headings.find((h) => h.title === 'SubSub heading');
    if (subSub) {
      const result = validateAgentsMd(document);
      expect(result.warnings.some((f) => f.rule === 'heading-order')).toBe(true);
    }
  });

  it('reports broken-skill-reference when existingSkills does not match', async () => {
    const content = `---
agent_id: "test"
display_name: "Test"
version: "1.0.0"
description: "A test agent description here"
---

# Test

## What this is

Test.

## Architecture Overview

Test.

## Skill System

skills/routing

## MCP Integration

Test.

## Security Considerations

PII is encrypted.

## Observability

Structured logging with pino.

## Checklist: Production Readiness

Done.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const result = validateAgentsMd(document, { existingSkills: ['skills/echo/skill.md'] });
    expect(result.errors.some((f) => f.rule === 'broken-skill-reference')).toBe(true);
  });

  it('reports missing-pii-mention in security section', async () => {
    const content = `---
agent_id: "test"
display_name: "Test"
version: "1.0.0"
description: "A test agent description here"
---

# Test

## What this is

Test.

## Architecture Overview

Test.

## Skill System

Test.

## MCP Integration

Test.

## Security Considerations

Some security notes.

## Observability

Structured logging.

## Checklist: Production Readiness

Done.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const result = validateAgentsMd(document);
    expect(result.warnings.some((f) => f.rule === 'missing-pii-mention')).toBe(true);
  });

  it('reports missing-logging-mention in observability section', async () => {
    const content = `---
agent_id: "test"
display_name: "Test"
version: "1.0.0"
description: "A test agent description here"
---

# Test

## What this is

Test.

## Architecture Overview

Test.

## Skill System

Test.

## MCP Integration

Test.

## Security Considerations

PII handling documented.

## Observability

We use metrics only.

## Checklist: Production Readiness

Done.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const result = validateAgentsMd(document);
    expect(result.warnings.some((f) => f.rule === 'missing-observability')).toBe(true);
  });

  it('reports placeholder text in AGENTS.md', async () => {
    const content = `---
agent_id: "test"
display_name: "Test"
version: "1.0.0"
description: "A test agent description here"
---

# Test

## What this is

TODO: fill this in.

## Architecture Overview

Test.

## Skill System

Test.

## MCP Integration

Test.

## Security Considerations

PII.

## Observability

Logging.

## Checklist: Production Readiness

Done.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const result = validateAgentsMd(document);
    expect(result.warnings.some((f) => f.rule === 'placeholder-text')).toBe(true);
  });

  it('reports empty sections in AGENTS.md via linter content rules', async () => {
    const content = `---
agent_id: "test"
display_name: "Test"
version: "1.0.0"
description: "A test agent description here"
---

# Test

## What this is

## Architecture Overview

Content here.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const { runLintRules } = await import('../src/linter/index.js');
    const lintResult = runLintRules(document);
    expect(lintResult.findings.some((f) => f.rule === 'empty-section')).toBe(true);
  });

  it('passes a fully valid AGENTS.md', async () => {
    const content = `---
agent_id: "test"
display_name: "Test"
version: "1.0.0"
description: "A test agent description here"
confidence_threshold: 0.9
---

# Test

## What this is

Test description.

## Architecture Overview

Overview.

## Skill System

skills/echo

## MCP Integration

Integration details.

## Security Considerations

PII handling documented.

## Observability

Structured logging with pino.

## Checklist: Production Readiness

Done.
`;
    const document = await parseMarkdown(content, 'AGENTS.md');
    const result = validateAgentsMd(document, { existingSkills: ['skills/echo/skill.md'] });
    expect(result.valid).toBe(true);
  });

  it('reports missing-success-example in skill usage examples', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

Does a thing.

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| echo | z.string() | string |

## Usage Examples

Only error case shown.

## Error Handling

Handled.

## Security Considerations

PII encrypted. Permissions required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);
    expect(result.warnings.some((f) => f.rule === 'missing-success-example')).toBe(true);
  });

  it('reports missing-pii-mention in skill security', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

Does a thing.

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| echo | z.string() | string |

## Usage Examples

Success case. Error case.

## Error Handling

Handled.

## Security Considerations

Permissions are required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);
    expect(result.warnings.some((f) => f.rule === 'missing-pii-mention')).toBe(true);
  });

  it('reports missing-permissions-mention in skill security', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

Does a thing.

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| echo | z.string() | string |

## Usage Examples

Success case. Error case.

## Error Handling

Handled.

## Security Considerations

PII is handled carefully.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);
    expect(result.warnings.some((f) => f.rule === 'missing-permissions-mention')).toBe(true);
  });

  it('reports empty-section in skill documents via linter content rules', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| echo | z.string() | string |

## Usage Examples

Success and error.

## Error Handling

Handled.

## Security Considerations

PII encrypted. Permissions required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const { runLintRules } = await import('../src/linter/index.js');
    const lintResult = runLintRules(document);
    expect(lintResult.findings.some((f) => f.rule === 'empty-section')).toBe(true);
  });

  it('reports placeholder-text in skill documents', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

FIXME: implement this.

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| echo | z.string() | string |

## Usage Examples

Success and error.

## Error Handling

Handled.

## Security Considerations

PII encrypted. Permissions required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);
    expect(result.warnings.some((f) => f.rule === 'placeholder-text')).toBe(true);
  });

  it('reports missing-tools-column when table lacks required columns', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

Does a thing.

## MCP Tools

| Tool | Output |
|------|--------|
| echo | string |

## Usage Examples

Success and error.

## Error Handling

Handled.

## Security Considerations

PII encrypted. Permissions required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);
    expect(result.errors.some((f) => f.rule === 'missing-tools-column')).toBe(true);
  });

  it('reports empty-tool-name in MCP tools table (manual document)', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

Does a thing.

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| echo_tool | z.string() | string |

## Usage Examples

Success and error.

## Error Handling

Handled.

## Security Considerations

PII encrypted. Permissions required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    document.tables[0] = {
      ...document.tables[0]!,
      rows: [['', 'z.string()', 'string']],
    };
    const result = validateSkillMd(document);
    expect(result.errors.some((f) => f.rule === 'empty-tool-name')).toBe(true);
  });

  it('reports invalid-tool-name in MCP tools table', async () => {
    const content = `---
skill_id: "skill"
display_name: "Skill"
version: "1.0.0"
description: "A valid description"
---

# Skill

## Capability

Does a thing.

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| My Tool! | z.string() | string |

## Usage Examples

Success and error.

## Error Handling

Handled.

## Security Considerations

PII encrypted. Permissions required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);
    expect(result.warnings.some((f) => f.rule === 'invalid-tool-name')).toBe(true);
  });

  it('passes a fully valid skill document', async () => {
    const content = `---
skill_id: "echo"
display_name: "Echo Skill"
version: "1.0.0"
description: "Echoes input back"
category: "tool"
---

# Echo Skill

## Capability

Echoes input.

## MCP Tools

| Tool | Input Schema | Output |
|------|-------------|--------|
| echo | z.string() | string |

## Usage Examples

Success example and error example.

## Error Handling

Handled gracefully.

## Security Considerations

PII encrypted. Permissions required.
`;
    const document = await parseMarkdown(content, 'skill.md');
    const result = validateSkillMd(document);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
