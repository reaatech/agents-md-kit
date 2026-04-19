/**
 * AGENTS.md specific validation
 */

import type { AgentsMdDocument, ValidationResult, Finding } from '../types/domain.js';
import {
  createError,
  createWarning,
} from './schema-validator.js';
import { AgentsMdFrontmatterSchema } from '../types/schemas.js';
import { hasSection, findSection } from '../parser/section-extractor.js';

/**
 * Required sections for AGENTS.md
 */
const REQUIRED_SECTIONS = [
  'What this is',
  'Architecture Overview',
  'Skill System',
  'MCP Integration',
  'Security Considerations',
  'Observability',
  'Checklist: Production Readiness',
];

/**
 * Recommended sections for AGENTS.md
 */
const RECOMMENDED_SECTIONS = [
  'Agent Configuration',
  'Error Handling',
  'Testing',
  'Deployment',
  'References',
];

/**
 * Validation options for AGENTS.md
 */
export interface AgentsMdValidationOptions {
  /** Base path for resolving skill references */
  basePath?: string;
  /** List of existing skill files for cross-reference validation */
  existingSkills?: string[];
}

/**
 * Validate an AGENTS.md document
 */
export function validateAgentsMd(
  document: AgentsMdDocument,
  options: AgentsMdValidationOptions = {}
): ValidationResult {
  const { basePath = '', existingSkills = [] } = options;

  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const suggestions: Finding[] = [];

  // 1. Validate frontmatter
  if (!document.frontmatter) {
    errors.push(
      createError(
        'missing-frontmatter',
        'AGENTS.md must have YAML frontmatter with agent_id, display_name, version, and description',
        { line: 1 }
      )
    );
  } else {
    const rawFrontmatter: Record<string, unknown> = {};
    if (document.frontmatter.id !== '') { rawFrontmatter.agent_id = document.frontmatter.id; }
    if (document.frontmatter.display_name !== '') { rawFrontmatter.display_name = document.frontmatter.display_name; }
    if (document.frontmatter.version !== '') { rawFrontmatter.version = document.frontmatter.version; }
    if (document.frontmatter.description !== '') { rawFrontmatter.description = document.frontmatter.description; }
    if (document.frontmatter.type !== undefined) { rawFrontmatter.type = document.frontmatter.type; }
    const zodResult = AgentsMdFrontmatterSchema.safeParse(rawFrontmatter);
    if (!zodResult.success) {
      for (const issue of zodResult.error.issues) {
        errors.push(
          createError(
            'invalid-frontmatter',
            issue.message,
            document.frontmatterRange
              ? { line: document.frontmatterRange.start }
              : undefined
          )
        );
      }
    }
  }

  // 1b. Check confidence_threshold
  if (document.frontmatter) {
    const raw = document.frontmatter.raw ?? '';
    if (!raw.includes('confidence_threshold')) {
      errors.push(
        createError(
          'missing-confidence',
          'Agent config must include confidence_threshold',
          document.frontmatterRange
            ? { line: document.frontmatterRange.start }
            : undefined,
          'Add confidence_threshold to frontmatter (e.g., confidence_threshold: 0.9)'
        )
      );
    }
  }

  // 2. Validate title (h1)
  if (!document.title || document.title === 'Untitled') {
    errors.push(
      createError(
        'missing-title',
        'AGENTS.md must have a title (h1 heading)',
        { line: 1 }
      )
    );
  }

  // 3. Validate required sections
  for (const section of REQUIRED_SECTIONS) {
    if (!hasSection(document.sections, section)) {
      errors.push(
        createError(
          'heading-missing',
          `Required section '${section}' not found`,
          undefined,
          `Add a '## ${section}' section to the document`
        )
      );
    }
  }

  // 4. Validate recommended sections
  for (const section of RECOMMENDED_SECTIONS) {
    if (!hasSection(document.sections, section)) {
      warnings.push(
        createWarning(
          'missing-recommended-section',
          `Recommended section '${section}' not found`,
          undefined,
          `Consider adding a '## ${section}' section`
        )
      );
    }
  }

  // 5. Validate section ordering (h2 sections should come after h1)
  const headings = document.sections
    .flatMap((s) => [s, ...s.subsections])
    .filter((s): s is NonNullable<typeof s> => s !== null && s !== undefined);

  let lastLevel = 0;
  for (const section of headings) {
    if (section.level > lastLevel + 1 && lastLevel > 0) {
      warnings.push(
        createWarning(
          'heading-order',
          `Heading level skipped: ${section.title} (level ${section.level} after level ${lastLevel})`,
          section.location
        )
      );
    }
    lastLevel = section.level;
  }

  // 6. Validate skill references
  const skillSection = findSection(document.sections, 'Skill System');
  if (skillSection) {
    const referencedSkills = extractSkillReferences(skillSection.content);
    for (const skillRef of referencedSkills) {
      const skillPath = `${basePath}/${skillRef}`;
      if (existingSkills.length > 0 && !existingSkills.some((s) => s.includes(skillRef))) {
        errors.push(
          createError(
            'broken-skill-reference',
            `Referenced skill '${skillRef}' not found`,
            skillSection.location,
            `Create the skill file at ${skillPath} or remove the reference`
          )
        );
      }
    }
  }

  // 7. Validate Security section mentions PII
  const securitySection = findSection(document.sections, 'Security Considerations');
  if (securitySection) {
    const content = securitySection.content.toLowerCase();
    if (!content.includes('pii')) {
      warnings.push(
        createWarning(
          'missing-pii-mention',
          'Security section should mention PII handling',
          securitySection.location,
          'Add a paragraph about how PII is handled, stored, and protected'
        )
      );
    }
  }

  // 8. Validate Observability section mentions logging
  const observabilitySection = findSection(document.sections, 'Observability');
  if (observabilitySection) {
    const content = observabilitySection.content.toLowerCase();
    if (!content.includes('log')) {
      warnings.push(
        createWarning(
          'missing-observability',
          'Observability section should mention structured logging',
          observabilitySection.location,
          'Add information about logging approach and log format'
        )
      );
    }
  }

  // 9. Check for placeholder text
  const allContent = document.raw;
  const placeholderPatterns = [/TODO/i, /FIXME/i, /XXX/i, /HACK/i];
  for (const pattern of placeholderPatterns) {
    const matches = allContent.match(pattern);
    if (matches) {
      warnings.push(
        createWarning(
          'placeholder-text',
          `Found placeholder text matching pattern: ${pattern.source}`,
          undefined,
          'Replace placeholder text with actual content before production'
        )
      );
    }
  }

  // 10. Check for empty sections
  for (const section of document.sections) {
    if (!section.content.trim() && section.subsections.length === 0) {
      warnings.push(
        createWarning(
          'empty-section',
          `Section '${section.title}' has no content`,
          section.location,
          'Add content to this section or remove it'
        )
      );
    }
  }

  return {
    valid: errors.length === 0,
    type: 'agents',
    path: document.path,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Extract skill file references from content
 * Looks for patterns like skills/xxx or skills/xxx/skill.md
 */
function extractSkillReferences(content: string): string[] {
  const references: string[] = [];

  // Match patterns like skills/xxx or skills/xxx/skill.md
  const pattern = /skills\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?/g;
  const matches = content.match(pattern);

  if (matches) {
    for (const match of matches) {
      if (!references.includes(match)) {
        references.push(match);
      }
    }
  }

  return references;
}
