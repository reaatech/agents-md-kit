/**
 * Main schema validation engine
 */

import type {
  AgentsMdDocument,
  Finding,
  Severity,
  SkillMdDocument,
  ValidationResult,
} from '@reaatech/agents-markdown';
import { validateAgentsMd } from './agents-md-validator.js';
import { validateSkillMd } from './skill-md-validator.js';

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Strict mode - fail on warnings too */
  strict?: boolean;
  /** Base path for resolving skill references */
  basePath?: string;
  /** List of existing skill files for cross-reference validation */
  existingSkills?: string[];
}

/**
 * Validate an AGENTS.md or SKILL.md document
 */
export function validate(
  document: AgentsMdDocument | SkillMdDocument,
  options: ValidationOptions = {}
): ValidationResult {
  const { strict = false, basePath = '', existingSkills = [] } = options;

  // Determine document type
  const isSkillDoc = isSkillDocument(document);

  let result: ValidationResult;

  if (isSkillDoc) {
    result = validateSkillMd(document as SkillMdDocument, {
      basePath,
      existingSkills,
    });
  } else {
    result = validateAgentsMd(document as AgentsMdDocument, {
      basePath,
      existingSkills,
    });
  }

  // In strict mode, promote warnings to errors
  if (strict) {
    for (const warning of result.warnings) {
      result.errors.push({
        ...warning,
        severity: 'error' as Severity,
      });
    }
    result.warnings = [];
  }

  // Update valid status
  result.valid = result.errors.length === 0;

  return result;
}

/**
 * Validate multiple documents
 */
export function validateMultiple(
  documents: Array<AgentsMdDocument | SkillMdDocument>,
  options: ValidationOptions = {}
): ValidationResult[] {
  return documents.map((doc) => validate(doc, options));
}

/**
 * Check if a document is a SKILL.md document
 */
function isSkillDocument(document: AgentsMdDocument | SkillMdDocument): boolean {
  if (document.path.endsWith('AGENTS.md') || document.path.endsWith('agents.md')) {
    return false;
  }

  if (document.path.endsWith('skill.md') || /skills\/[^/]+\/skill\.md$/.test(document.path)) {
    return true;
  }

  if (document.frontmatter) {
    const raw = document.frontmatter.raw ?? '';
    if (raw.includes('skill_id:')) {
      return true;
    }
    if (raw.includes('agent_id:')) {
      return false;
    }
  }

  const sectionTitles = document.sections.map((s) => s.title.toLowerCase());
  if (sectionTitles.some((t) => t.includes('mcp tools') || t.includes('capability'))) {
    return true;
  }

  return false;
}

/**
 * Create a finding with standard structure
 */
export function createFinding(
  rule: string,
  severity: Severity,
  message: string,
  location?: Finding['location'],
  suggestion?: string,
  autoFixable = false,
  fix?: Finding['fix']
): Finding {
  const finding: Finding = {
    rule,
    severity,
    message,
    autoFixable,
  };

  if (location !== undefined) {
    finding.location = location;
  }
  if (suggestion !== undefined) {
    finding.suggestion = suggestion;
  }
  if (fix !== undefined) {
    finding.fix = fix;
  }

  return finding;
}

/**
 * Create an error finding
 */
export function createError(
  rule: string,
  message: string,
  location?: Finding['location'],
  suggestion?: string
): Finding {
  return createFinding(rule, 'error', message, location, suggestion, false);
}

/**
 * Create a warning finding
 */
export function createWarning(
  rule: string,
  message: string,
  location?: Finding['location'],
  suggestion?: string
): Finding {
  return createFinding(rule, 'warning', message, location, suggestion, false);
}

/**
 * Create an info finding
 */
export function createInfo(
  rule: string,
  message: string,
  location?: Finding['location'],
  suggestion?: string
): Finding {
  return createFinding(rule, 'info', message, location, suggestion, false);
}

/**
 * Create a suggestion finding
 */
export function createSuggestion(
  rule: string,
  message: string,
  location?: Finding['location'],
  suggestion?: string
): Finding {
  return createFinding(rule, 'suggestion', message, location, suggestion, false);
}

/**
 * Create an auto-fixable finding
 */
export function createFixableFinding(
  rule: string,
  severity: Severity,
  message: string,
  location: Finding['location'],
  suggestion: string,
  fix: Finding['fix']
): Finding {
  return createFinding(rule, severity, message, location, suggestion, true, fix);
}
