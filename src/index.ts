/**
 * agents-md-kit — Library entry point
 *
 * Linter, validator, and scaffolding tool for AGENTS.md and SKILL.md files.
 */

// Types
export * from './types/index.js';

// Parser
export * from './parser/index.js';

// Validator
export * from './validator/index.js';

// Linter
export * from './linter/index.js';

// Scaffold
export * from './scaffold/index.js';

// Reporter
export * from './reporter/index.js';

// MCP Server
export * from './mcp-server/index.js';

// Observability
export * from './observability/index.js';

// File-based library helpers
export {
  applyFixes,
  applyFixesToFile,
  filterLintResult,
  findMarkdownFiles,
  getFixableRules,
  lintDirectory,
  lintFile,
  parseFile,
  pathIsDirectory,
  scaffoldAgent,
  validateDirectory,
  validateFile,
} from './cli/cli-utils.js';

// Version (will be replaced during build)
export const VERSION = '1.0.0';

/**
 * Main API for programmatic use
 */
export const agentsMdKit = {
  /** Parse markdown files */
  parse: async (content: string, path: string) => {
    const { parseMarkdown } = await import('./parser/index.js');
    return parseMarkdown(content, path);
  },

  /** Validate a parsed document */
  validate: async (
    document: Awaited<ReturnType<typeof import('./parser/index.js').parseMarkdown>>,
    options?: import('./validator/schema-validator.js').ValidationOptions,
  ) => {
    const { validate } = await import('./validator/index.js');
    return validate(document, options);
  },

  /** Get version */
  version: VERSION,
};

export default agentsMdKit;
