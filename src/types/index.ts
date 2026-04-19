/**
 * Type exports for agents-md-kit
 */

// Domain types
export type {
  Severity,
  ErrorLocation,
  Finding,
  ParsedFrontmatter,
  Section,
  MarkdownTable,
  CodeBlock,
  AgentsMdDocument,
  SkillMdDocument,
  ValidationResult,
  LintResult,
  ScaffoldConfig,
  ScaffoldSkillConfig,
  RuleDefinition,
  AgentType,
  SkillType,
  OutputFormat,
} from './domain.js';

// Zod schemas (types only)
export type {
  AgentsMdFrontmatter,
  SkillMdFrontmatter,
  AgentsMdValidation,
  SkillMdValidation,
  McpTool,
  SkillReference,
  SchemaSection,
} from './schemas.js';
