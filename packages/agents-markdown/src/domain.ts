/**
 * Core domain types for agents-md-kit
 */

/** Severity levels for validation and linting results */
export type Severity = 'error' | 'warning' | 'info' | 'suggestion';

/** Location information for errors and warnings */
export interface ErrorLocation {
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column?: number;
  /** End line number */
  endLine?: number;
  /** End column number */
  endColumn?: number;
}

/** A single finding from validation or linting */
export interface Finding {
  /** Unique rule identifier */
  rule: string;
  /** Severity level */
  severity: Severity;
  /** Human-readable message */
  message: string;
  /** Location in the source file */
  location?: ErrorLocation;
  /** Suggestion for fixing the issue */
  suggestion?: string;
  /** Whether this finding can be auto-fixed */
  autoFixable: boolean;
  /** The fix to apply (if auto-fixable) */
  fix?: {
    /** Type of fix */
    type: 'replace' | 'insert' | 'delete';
    /** Line to apply the fix */
    line: number;
    /** Column to apply the fix */
    column?: number;
    /** Content to insert or replace with */
    content?: string;
  };
}

/** Parsed YAML frontmatter from a markdown file */
export interface ParsedFrontmatter {
  /** Agent or skill identifier */
  id: string;
  /** Display name */
  display_name: string;
  /** Version string */
  version: string;
  /** Description */
  description: string;
  /** Type of agent or skill */
  type?: string;
  /** Category for skills */
  category?: string;
  /** Raw YAML content */
  raw: string;
}

/** A section extracted from markdown */
export interface Section {
  /** Section heading text */
  title: string;
  /** Heading level (1-6) */
  level: number;
  /** Section content (markdown text) */
  content: string;
  /** Location in the source file */
  location: ErrorLocation;
  /** Subsections */
  subsections: Section[];
}

/** A table extracted from markdown */
export interface MarkdownTable {
  /** Table headers */
  headers: string[];
  /** Table rows */
  rows: string[][];
  /** Location in the source file */
  location: ErrorLocation;
}

/** A code block extracted from markdown */
export interface CodeBlock {
  /** Programming language identifier */
  language?: string;
  /** Code content */
  content: string;
  /** Location in the source file */
  location: ErrorLocation;
}

/** Parsed AGENTS.md document structure */
export interface AgentsMdDocument {
  /** File path */
  path: string;
  /** Raw markdown content */
  raw: string;
  /** Parsed frontmatter */
  frontmatter: ParsedFrontmatter | null;
  /** Document title (h1) */
  title: string;
  /** Sections in the document */
  sections: Section[];
  /** Tables in the document */
  tables: MarkdownTable[];
  /** Code blocks in the document */
  codeBlocks: CodeBlock[];
  /** Frontmatter line range */
  frontmatterRange?: { start: number; end: number };
}

/** Parsed SKILL.md document structure */
export interface SkillMdDocument {
  /** File path */
  path: string;
  /** Raw markdown content */
  raw: string;
  /** Parsed frontmatter */
  frontmatter: ParsedFrontmatter | null;
  /** Document title (h1) */
  title: string;
  /** Sections in the document */
  sections: Section[];
  /** Tables in the document */
  tables: MarkdownTable[];
  /** Code blocks in the document */
  codeBlocks: CodeBlock[];
  /** Frontmatter line range */
  frontmatterRange?: { start: number; end: number };
}

/** Result of schema validation */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Document type */
  type: 'agents' | 'skill';
  /** File path */
  path: string;
  /** Validation errors */
  errors: Finding[];
  /** Validation warnings */
  warnings: Finding[];
  /** Suggestions for improvement */
  suggestions: Finding[];
}

/** Result of linting */
export interface LintResult {
  /** File path */
  path: string;
  /** All findings */
  findings: Finding[];
  /** Number of errors */
  errorCount: number;
  /** Number of warnings */
  warningCount: number;
  /** Number of info messages */
  infoCount: number;
  /** Whether any findings can be auto-fixed */
  fixableCount: number;
}

/** Configuration for scaffold generation */
export interface ScaffoldConfig {
  /** Agent type (mcp-server, orchestrator, classifier, router, evaluator) */
  agentType: AgentType;
  /** Agent ID */
  agentId: string;
  /** Display name */
  displayName: string;
  /** Description */
  description?: string;
  /** Version */
  version?: string;
  /** Skills to include */
  skills: ScaffoldSkillConfig[];
  /** Output directory */
  outputDir: string;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
}

/** Configuration for a skill in scaffold */
export interface ScaffoldSkillConfig {
  /** Skill ID */
  skillId: string;
  /** Display name */
  displayName: string;
  /** Skill type */
  skillType: SkillType;
  /** Description */
  description?: string;
}

/** Definition of a lint rule */
export interface RuleDefinition {
  /** Unique rule identifier */
  id: string;
  /** Rule description */
  description: string;
  /** Default severity */
  severity: Severity;
  /** Category */
  category: 'style' | 'content' | 'best-practice';
  /** Whether the rule can be auto-fixed */
  autoFixable: boolean;
  /** Rule configuration options */
  options?: Record<string, unknown>;
}

/** Agent type enumeration */
export type AgentType = 'mcp' | 'orchestrator' | 'classifier' | 'router' | 'evaluator';

/** Skill type enumeration */
export type SkillType = 'tool' | 'orchestration' | 'evaluation' | 'routing';

/** Output format for reporters */
export type OutputFormat = 'console' | 'json' | 'html' | 'markdown';
