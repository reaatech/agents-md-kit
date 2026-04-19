# Lint Rules Reference

Complete documentation of all linting rules available in agents-md-kit.

## Rule Severity Levels

| Level | Description | CI Behavior |
|-------|-------------|-------------|
| `error` | Must be fixed | Fails CI |
| `warning` | Should be fixed | Warns in CI |
| `info` | Nice to have | Informational |
| `suggestion` | Optional improvement | Informational |

---

## Style Rules

### `heading-order`

**Severity:** warning  
**Auto-fix:** ✅ Yes  
**Description:** Heading levels should not be skipped (e.g., h1 → h3 without h2).

**Example (Invalid):**
```markdown
# Main Title

### Subsection  <!-- Skipped h2 -->
```

**Example (Valid):**
```markdown
# Main Title

## Section

### Subsection
```

---

### `no-code-language`

**Severity:** warning  
**Auto-fix:** ✅ Yes  
**Description:** Code blocks should specify a language identifier.

**Example (Invalid):**
````markdown
```
const x = 5;
```
````

**Example (Valid):**
````markdown
```typescript
const x = 5;
```
````

---

### `trailing-whitespace`

**Severity:** info  
**Auto-fix:** ✅ Yes  
**Description:** Lines should not have trailing whitespace.

---

### `line-too-long`

**Severity:** info  
**Auto-fix:** ❌ No  
**Description:** Lines should not exceed 120 characters.

**Configuration:**
```json
{
  "rules": {
    "line-too-long": ["info", { "max": 120 }]
  }
}
```

---

### `table-format`

**Severity:** warning  
**Auto-fix:** ✅ Yes  
**Description:** Markdown tables should be properly formatted with consistent column counts and aligned pipes.

---

### `list-format`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** List markers should be consistent throughout the document. Mixing `-`, `*`, and `+` is flagged.

**Example (Invalid):**
```markdown
- First item
* Second item
+ Third item
```

**Example (Valid):**
```markdown
- First item
- Second item
- Third item
```

---

## Content Rules

### `heading-missing`

**Severity:** error  
**Auto-fix:** ❌ No  
**Description:** Required section headings must be present.

**Required sections for AGENTS.md:**
- `# {Agent Name}`
- `## What this is`
- `## Architecture Overview`
- `## Skill System`
- `## MCP Integration`
- `## Security Considerations`
- `## Observability`
- `## Checklist: Production Readiness`

**Required sections for SKILL.md:**
- `# {Skill Name}`
- `## Capability`
- `## MCP Tools`
- `## Usage Examples`
- `## Error Handling`
- `## Security Considerations`

---

### `empty-section`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** Sections should contain non-empty content.

---

### `placeholder-detection`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** Placeholder text (TODO, FIXME, TBD, etc.) should be resolved.

**Detected patterns:**
- `TODO`
- `FIXME`
- `TBD`
- `XXX`
- `HACK`
- `[INSERT`
- `{{placeholder}}`

---

### `broken-skill-reference`

**Severity:** error  
**Auto-fix:** ❌ No  
**Description:** Skills referenced in AGENTS.md must exist as files.

---

### `duplicate-skill-id`

**Severity:** error  
**Auto-fix:** ❌ No  
**Description:** Skill IDs must be unique within an agent.

---

### `duplicate-section`

**Severity:** error  
**Auto-fix:** ❌ No  
**Description:** Duplicate section headings are not allowed.

---

### `section-ordering`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** Sections should follow the recommended order for AGENTS.md files.

**Recommended order:**
1. What this is
2. Architecture Overview
3. Skill System
4. MCP Integration
5. Security Considerations
6. Observability
7. Checklist: Production Readiness

---

### `min-content-length`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** Top-level sections (h2) should have at least 20 characters of content. Flags sections that exist but are nearly empty.

---

## Best Practice Rules

### `missing-pii-mention`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** Security section must mention PII handling.

**Required keywords:**
- PII
- personal information
- sensitive data
- privacy

---

### `missing-confidence-threshold`

**Severity:** error  
**Auto-fix:** ❌ No  
**Description:** Agent configuration must include a confidence_threshold.

---

### `missing-tool-schema`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** MCP tools must have input schemas documented.

---

### `incomplete-examples`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** Usage examples must include both success and error cases.

---

### `missing-observability-logging`

**Severity:** warning  
**Auto-fix:** ❌ No  
**Description:** Observability section must mention structured logging.

**Required keywords:**
- structured logging
- JSON logging
- log level
- logging

---

## Rule Configuration

Rules can be configured via `.agentsmdrc.json` or `package.json`:

```json
{
  "rules": {
    "heading-order": "error",
    "line-too-long": ["info", { "max": 100 }],
    "trailing-whitespace": "off",
    "missing-pii-mention": ["warning", { "keywords": ["PII", "personal"] }]
  }
}
```

## Disabling Rules

### Disable for entire file

```markdown
---
# agents-md-disable
agent_id: "my-agent"
---
```

### Disable for specific rule

```markdown
---
# agents-md-disable:line-too-long
agent_id: "my-agent"
---
```

### Disable for single line

```markdown
const longLine = "this is a very long line that exceeds 120 characters"; // agents-md-disable-line
```

### Disable for block

```markdown
<!-- agents-md-disable-next-line -->
### Skipped heading level for special reason

<!-- agents-md-disable-start -->
### Another skipped heading
#### And another
<!-- agents-md-disable-end -->
```

## Running Lint

```bash
# Lint single file
npm run lint -- AGENTS.md

# Lint directory
npm run lint -- examples/

# Specific output format
npm run lint -- examples/ --format json
npm run lint -- examples/ --format html --output report.html

# Filter by severity
npm run lint -- examples/ --severity error

# Auto-fix fixable issues
npm run format:fix
