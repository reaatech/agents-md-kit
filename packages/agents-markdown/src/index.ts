export const VERSION = '1.0.0';

export type {
  AgentsMdDocument,
  AgentType,
  CodeBlock,
  ErrorLocation,
  Finding,
  LintResult,
  MarkdownTable,
  OutputFormat,
  ParsedFrontmatter,
  RuleDefinition,
  ScaffoldConfig,
  ScaffoldSkillConfig,
  Section,
  Severity,
  SkillMdDocument,
  SkillType,
  ValidationResult,
} from './domain.js';
export type {
  AgentsMdFrontmatter,
  AgentsMdValidation,
  McpTool,
  SchemaSection,
  SkillMdFrontmatter,
  SkillMdValidation,
  SkillReference,
} from './schemas.js';
export {
  AgentsMdFrontmatterSchema,
  AgentsMdSchema,
  McpToolSchema,
  SectionSchema,
  SkillMdFrontmatterSchema,
  SkillMdSchema,
  SkillReferenceSchema,
} from './schemas.js';

export {
  assertNever,
  debounce,
  delay,
  groupBy,
  normalizeLineEndings,
  randomId,
  sanitizePath,
  truncate,
} from './utils.js';
