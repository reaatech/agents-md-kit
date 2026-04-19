/**
 * Linter module barrel export
 */

export { runLintRules, registerRule, getRegisteredRules } from './rules-engine.js';
export type { LintRule } from './rules-engine.js';

// Import rule files to register all rules
import './style-rules.js';
import './content-rules.js';
import './best-practice-rules.js';

export { runAutoFix } from './auto-fix.js';
