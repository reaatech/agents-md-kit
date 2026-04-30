export const VERSION = '1.0.0';

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

export {
  AgentsMdFrontmatterSchema,
  SkillMdFrontmatterSchema,
  SectionSchema,
  AgentsMdSchema,
  SkillMdSchema,
  McpToolSchema,
  SkillReferenceSchema,
} from './schemas.js';

export type {
  AgentsMdFrontmatter,
  SkillMdFrontmatter,
  SchemaSection,
  AgentsMdValidation,
  SkillMdValidation,
  McpTool,
  SkillReference,
} from './schemas.js';

export {
  assertNever,
  delay,
  randomId,
  sanitizePath,
  normalizeLineEndings,
  truncate,
  debounce,
  groupBy,
} from './utils.js';
