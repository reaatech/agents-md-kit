/**
 * Linter module barrel export
 */

export type { LintRule } from './rules-engine.js';
export { getRegisteredRules, registerRule, runLintRules } from './rules-engine.js';

// Import rule files to register all rules
import './style-rules.js';
import './content-rules.js';
import './best-practice-rules.js';

export { getAutoFixableRules, runAutoFix } from './auto-fix.js';
