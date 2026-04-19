# Contributing to agents-md-kit

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/reaatech/agents-md-kit.git
cd agents-md-kit

# Install dependencies
npm install

# Start development
npm run dev
```

## Project Structure

```
src/
├── parser/       # Markdown parsing and AST extraction
├── validator/    # Schema validation engine
├── linter/       # Linting rules engine
├── scaffold/     # Template-based file generation
├── reporter/     # Output formatters
├── mcp-server/   # MCP server implementation
├── observability/# Logging and metrics
└── types/        # Core domain types and schemas
```

## Adding a New Lint Rule

1. Create the rule in `src/linter/` (e.g., `my-rule.ts`)
2. Export a function that takes a parsed document and returns findings
3. Register the rule in `src/linter/rules-engine.ts`
4. Add tests in `tests/linter.test.ts`

Example rule:

```typescript
import type { ParsedDocument, LintFinding } from '../types/domain.js';

export function myRule(doc: ParsedDocument): LintFinding[] {
  const findings: LintFinding[] = [];
  
  // Check something about the document
  if (!doc.sections.some(s => s.heading === 'My Section')) {
    findings.push({
      rule: 'my-rule',
      severity: 'warning',
      message: 'Missing required section: My Section',
      location: { line: 1, column: 1 },
    });
  }
  
  return findings;
}
```

## Adding a New Schema

1. Define the Zod schema in `src/types/schemas.ts`
2. Create a validator in `src/validator/`
3. Export from `src/validator/index.ts`
4. Add tests

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/parser.test.ts
```

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run typecheck
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass and coverage is maintained
4. Update documentation if needed
5. Submit a pull request

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
