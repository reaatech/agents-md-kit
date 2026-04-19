/**
 * Validator module exports
 */

// Main validator
export {
  validate,
  validateMultiple,
  createFinding,
  createError,
  createWarning,
  createInfo,
  createSuggestion,
  createFixableFinding,
  type ValidationOptions,
} from './schema-validator.js';

// AGENTS.md validator
export {
  validateAgentsMd,
  type AgentsMdValidationOptions,
} from './agents-md-validator.js';

// SKILL.md validator
export {
  validateSkillMd,
  type SkillMdValidationOptions,
} from './skill-md-validator.js';

// Error formatter
export {
  formatFinding,
  formatValidationSummary,
  formatFindingsGrouped,
  formatWithContext,
  createErrorReport,
  getAutoFixableFindings,
} from './error-formatter.js';
