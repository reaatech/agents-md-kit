/**
 * Content linting rules for AGENTS.md and SKILL.md files
 */

import { registerRule } from './rules-engine.js';
import type { LintRule } from './rules-engine.js';

/**
 * Rule: empty-section
 * Check for sections with no content
 */
const emptySectionRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const sections = document.sections ?? [];

  for (const section of sections) {
    // Check if section has any content (excluding subsections)
    const content = section.content?.trim();
    if (!content || content.length === 0) {
      findings.push({
        ruleId: 'empty-section',
        severity: 'warning',
        message: `Section '${section.title}' has no content`,
        line: section.location?.line,
        suggestion: 'Add content to this section or remove it',
      });
    }
  }

  return findings;
};

registerRule('content', 'empty-section', emptySectionRule, {
  id: 'empty-section',
  description: 'Sections should have content',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: placeholder-text
 * Check for TODO/FIXME placeholder text
 */
const placeholderTextRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const placeholderPatterns = [/\bTODO\b/i, /\bFIXME\b/i, /\bXXX\b/i, /\bHACK\b/i];
  const lines = document.raw.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    for (const pattern of placeholderPatterns) {
      if (pattern.test(line)) {
        findings.push({
          ruleId: 'placeholder-text',
          severity: 'warning',
          message: 'Found placeholder text matching pattern: ' + pattern.source.replace(/[\\b]/g, ''),
          line: i + 1,
          suggestion: 'Replace placeholder text with actual content before production',
        });
        break;
      }
    }
  }

  return findings;
};

registerRule('content', 'placeholder-text', placeholderTextRule, {
  id: 'placeholder-text',
  description: 'Placeholder text (TODO, FIXME, etc.) should be replaced',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: duplicate-section
 * Check for duplicate section titles
 */
const duplicateSectionRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const sections = document.sections ?? [];
  const seenTitles = new Map<string, number>();

  for (const section of sections) {
    const title = section.title.toLowerCase();
    const existing = seenTitles.get(title);
    if (existing !== undefined) {
      findings.push({
        ruleId: 'duplicate-section',
        severity: 'error',
        message: `Duplicate section title: '${section.title}' (also at line ${existing})`,
        line: section.location?.line,
        suggestion: 'Use unique section titles or merge duplicate sections',
      });
    } else {
      seenTitles.set(title, section.location?.line ?? 0);
    }
  }

  return findings;
};

registerRule('content', 'duplicate-section', duplicateSectionRule, {
  id: 'duplicate-section',
  description: 'Section titles should be unique',
  severity: 'error',
  autoFixable: false,
});

/**
 * Required sections per document type
 */
const AGENTS_REQUIRED_SECTIONS = [
  'What this is',
  'Architecture Overview',
  'Skill System',
  'MCP Integration',
  'Security Considerations',
  'Observability',
  'Checklist: Production Readiness',
];

const SKILL_REQUIRED_SECTIONS = [
  'Capability',
  'MCP Tools',
  'Usage Examples',
  'Error Handling',
  'Security Considerations',
];

/**
 * Rule: heading-missing
 * Check that required section headings are present
 */
const headingMissingRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const isSkill =
    document.path.includes('skill.md') ||
    document.path.includes('skills/');

  const requiredSections = isSkill ? SKILL_REQUIRED_SECTIONS : AGENTS_REQUIRED_SECTIONS;

  // Also include subsection titles
  const allTitles = new Set<string>();
  function collectTitles(sections: typeof document.sections) {
    for (const section of sections) {
      allTitles.add(section.title.toLowerCase());
      collectTitles(section.subsections);
    }
  }
  collectTitles(document.sections);

  for (const required of requiredSections) {
    if (!allTitles.has(required.toLowerCase())) {
      findings.push({
        ruleId: 'heading-missing',
        severity: 'error',
        message: `Required section '${required}' not found`,
        suggestion: `Add a '## ${required}' section to the document`,
      });
    }
  }

  return findings;
};

registerRule('content', 'heading-missing', headingMissingRule, {
  id: 'heading-missing',
  description: 'Required section headings must be present',
  severity: 'error',
  autoFixable: false,
});

/**
 * Rule: broken-skill-ref
 * Check that skill references point to existing skills
 */
const brokenSkillRefRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  // Only applicable to AGENTS.md documents
  const isSkill =
    document.path.includes('skill.md') ||
    document.path.includes('skills/');
  if (isSkill) { return findings; }

  // Find skills table or skill references in content
  const skillSection = document.sections.find(
    (s) => s.title.toLowerCase().includes('skill system') || s.title.toLowerCase().includes('skills')
  );
  if (!skillSection) { return findings; }

  // Extract skill file references from content
  const pattern = /skills\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)?/g;
  const refs = new Set<string>();
  const matches = skillSection.content.match(pattern);
  if (matches) {
    for (const match of matches) {
      refs.add(match);
    }
  }

  // Also check subsections
  for (const sub of skillSection.subsections) {
    const subMatches = sub.content.match(pattern);
    if (subMatches) {
      for (const match of subMatches) {
        refs.add(match);
      }
    }
  }

  // We can only flag references — actual file existence checking happens in the validator
  // But we can check the tables for references that look malformed
  for (const table of document.tables ?? []) {
    const fileColIdx = table.headers.findIndex(
      (h) => h.toLowerCase() === 'file' || h.toLowerCase() === 'path'
    );
    if (fileColIdx === -1) { continue; }

    for (const row of table.rows) {
      const ref = row[fileColIdx];
      if (ref !== undefined && ref.length > 0 && ref.includes('skills/') && !ref.match(/skills\/[a-zA-Z0-9_-]+/)) {
        findings.push({
          ruleId: 'broken-skill-ref',
          severity: 'error',
          message: `Invalid skill reference: '${ref}'`,
          line: table.location?.line,
          suggestion: 'Skill references should match the pattern skills/<skill-id>/skill.md',
        });
      }
    }
  }

  return findings;
};

registerRule('content', 'broken-skill-ref', brokenSkillRefRule, {
  id: 'broken-skill-ref',
  description: 'Skill references must be valid',
  severity: 'error',
  autoFixable: false,
});

/**
 * Rule: duplicate-skill-id
 * Check that skill IDs in the skills table are unique
 */
const duplicateSkillIdRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  // Only applicable to AGENTS.md documents
  const isSkill =
    document.path.includes('skill.md') ||
    document.path.includes('skills/');
  if (isSkill) { return findings; }

  // Find tables that look like skill tables
  for (const table of document.tables ?? []) {
    const skillIdColIdx = table.headers.findIndex(
      (h) =>
        h.toLowerCase() === 'skill id' ||
        h.toLowerCase() === 'skill' ||
        h.toLowerCase() === 'id'
    );
    if (skillIdColIdx === -1) { continue; }

    const seen = new Map<string, number>();
    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const skillId = (row?.[skillIdColIdx] ?? '').trim().replace(/`/g, '');
      if (!skillId) { continue; }

      const existing = seen.get(skillId);
      if (existing !== undefined) {
        findings.push({
          ruleId: 'duplicate-skill-id',
          severity: 'error',
          message: `Duplicate skill ID: '${skillId}' (first seen in row ${existing + 1})`,
          line: table.location?.line,
          suggestion: 'Each skill must have a unique ID',
        });
      } else {
        seen.set(skillId, i);
      }
    }
  }

  return findings;
};

registerRule('content', 'duplicate-skill-id', duplicateSkillIdRule, {
  id: 'duplicate-skill-id',
  description: 'Skill IDs must be unique',
  severity: 'error',
  autoFixable: false,
});

/**
 * Recommended section ordering for AGENTS.md
 */
const AGENTS_SECTION_ORDER = [
  'what this is',
  'architecture overview',
  'skill system',
  'mcp integration',
  'security considerations',
  'observability',
  'checklist: production readiness',
];

/**
 * Rule: section-ordering
 * Check that sections follow the recommended order
 */
const sectionOrderingRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  const isSkill =
    document.path.includes('skill.md') ||
    document.path.includes('skills/');
  if (isSkill) { return findings; }

  const sectionTitles = document.sections
    .filter((s) => s.level === 2)
    .map((s) => s.title.toLowerCase());

  let lastOrderIndex = -1;
  for (const title of sectionTitles) {
    const orderIndex = AGENTS_SECTION_ORDER.indexOf(title);
    if (orderIndex === -1) { continue; } // Not a tracked section

    if (orderIndex < lastOrderIndex) {
      const section = document.sections.find(
        (s) => s.title.toLowerCase() === title
      );
      const line = section?.location?.line;
      findings.push({
        ruleId: 'section-ordering',
        severity: 'warning',
        message: `Section '${section?.title ?? title}' is out of recommended order`,
        ...(line !== undefined ? { line } : {}),
        suggestion: 'Recommended order: What this is, Architecture Overview, Skill System, MCP Integration, Security Considerations, Observability, Checklist',
      });
    } else {
      lastOrderIndex = orderIndex;
    }
  }

  return findings;
};

registerRule('content', 'section-ordering', sectionOrderingRule, {
  id: 'section-ordering',
  description: 'Sections should follow the recommended order',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: min-content-length
 * Check that sections have a minimum amount of content
 */
const minContentLengthRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];
  const minLength = 20; // Minimum characters of content

  for (const section of document.sections) {
    if (section.level > 2) { continue; } // Only check top-level sections

    const content = section.content?.trim() ?? '';
    if (content.length > 0 && content.length < minLength && section.subsections.length === 0) {
      findings.push({
        ruleId: 'min-content-length',
        severity: 'warning',
        message: `Section '${section.title}' has very little content (${content.length} characters)`,
        line: section.location?.line,
        suggestion: `Expand this section to at least ${minLength} characters`,
      });
    }
  }

  return findings;
};

registerRule('content', 'min-content-length', minContentLengthRule, {
  id: 'min-content-length',
  description: 'Sections should have minimum content length',
  severity: 'warning',
  autoFixable: false,
});
