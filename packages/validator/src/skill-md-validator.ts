/**
 * SKILL.md specific validation
 */

import type {
  Finding,
  MarkdownTable,
  SkillMdDocument,
  ValidationResult,
} from '@reaatech/agents-markdown';
import { SkillMdFrontmatterSchema } from '@reaatech/agents-markdown';
import { findSectionByTitle, hasSection } from '@reaatech/agents-markdown-parser';
import { createError, createWarning } from './schema-validator.js';

/**
 * Required sections for SKILL.md
 */
const REQUIRED_SECTIONS = [
  'Capability',
  'MCP Tools',
  'Usage Examples',
  'Error Handling',
  'Security Considerations',
];

/**
 * Validation options for SKILL.md
 */
export interface SkillMdValidationOptions {
  /** Base path for resolving references */
  basePath?: string;
  /** List of existing skill files */
  existingSkills?: string[];
}

/**
 * Validate a SKILL.md document
 */
export function validateSkillMd(
  document: SkillMdDocument,
  options: SkillMdValidationOptions = {}
): ValidationResult {
  const { basePath: _basePath } = options;

  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const suggestions: Finding[] = [];

  // 1. Validate frontmatter
  if (!document.frontmatter) {
    errors.push(
      createError(
        'missing-frontmatter',
        'SKILL.md must have YAML frontmatter with skill_id, display_name, version, and description',
        { line: 1 }
      )
    );
  } else {
    const rawFrontmatter: Record<string, unknown> = {};
    if (document.frontmatter.id !== '') {
      rawFrontmatter.skill_id = document.frontmatter.id;
    }
    if (document.frontmatter.display_name !== '') {
      rawFrontmatter.display_name = document.frontmatter.display_name;
    }
    if (document.frontmatter.version !== '') {
      rawFrontmatter.version = document.frontmatter.version;
    }
    if (document.frontmatter.description !== '') {
      rawFrontmatter.description = document.frontmatter.description;
    }
    if (document.frontmatter.category !== undefined) {
      rawFrontmatter.category = document.frontmatter.category;
    }
    const zodResult = SkillMdFrontmatterSchema.safeParse(rawFrontmatter);
    if (!zodResult.success) {
      for (const issue of zodResult.error.issues) {
        errors.push(
          createError(
            'invalid-frontmatter',
            issue.message,
            document.frontmatterRange ? { line: document.frontmatterRange.start } : undefined
          )
        );
      }
    }
  }

  // 2. Validate title (h1)
  if (!document.title || document.title === 'Untitled') {
    errors.push(
      createError('missing-title', 'SKILL.md must have a title (h1 heading)', { line: 1 })
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

  // 4. Validate MCP Tools section has proper table structure
  const mcpToolsSection = findSectionByTitle(document.sections, 'MCP Tools');
  if (mcpToolsSection) {
    const tables = document.tables.filter(
      (t) =>
        t.location.line >= mcpToolsSection.location.line &&
        t.location.line <= (mcpToolsSection.location.endLine ?? Number.MAX_SAFE_INTEGER)
    );

    if (tables.length === 0) {
      errors.push(
        createError(
          'missing-tools-table',
          'MCP Tools section must contain a table with Tool, Input Schema, and Output columns',
          mcpToolsSection.location,
          'Add a markdown table documenting the MCP tools'
        )
      );
    } else {
      for (const table of tables) {
        const tableIssues = validateMcpToolsTable(table);
        for (const issue of tableIssues) {
          if (issue.severity === 'error') {
            errors.push(issue);
          } else {
            warnings.push(issue);
          }
        }
      }
    }
  }

  // 5. Validate Usage Examples section has both success and error cases
  const usageExamplesSection = findSectionByTitle(document.sections, 'Usage Examples');
  if (usageExamplesSection) {
    const content = usageExamplesSection.content.toLowerCase();

    // Check for success example
    const hasSuccessExample =
      content.includes('success') ||
      content.includes('expected response') ||
      content.includes('expected output');

    // Check for error example
    const hasErrorExample =
      content.includes('error') || content.includes('failure') || content.includes('fail');

    if (!hasSuccessExample) {
      warnings.push(
        createWarning(
          'missing-success-example',
          'Usage Examples should include at least one success case',
          usageExamplesSection.location,
          'Add an example showing a successful tool execution'
        )
      );
    }

    if (!hasErrorExample) {
      warnings.push(
        createWarning(
          'missing-error-example',
          'Usage Examples should include at least one error case',
          usageExamplesSection.location,
          'Add an example showing error handling'
        )
      );
    }
  }

  // 6. Validate Security section mentions permissions
  const securitySection = findSectionByTitle(document.sections, 'Security Considerations');
  if (securitySection) {
    const content = securitySection.content.toLowerCase();

    if (!content.includes('pii')) {
      warnings.push(
        createWarning(
          'missing-pii-mention',
          'Security section should mention PII handling',
          securitySection.location,
          'Add information about how PII is handled'
        )
      );
    }

    if (!content.includes('permission') && !content.includes('access')) {
      warnings.push(
        createWarning(
          'missing-permissions-mention',
          'Security section should mention permission requirements',
          securitySection.location,
          'Add information about required permissions'
        )
      );
    }
  }

  // 7. Check for empty sections
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

  // 8. Check for placeholder text
  const allContent = document.raw;
  const placeholderPatterns = [/TODO/i, /FIXME/i, /XXX/i, /HACK/i];
  for (const pattern of placeholderPatterns) {
    const matches = allContent.match(pattern);
    if (matches && matches.length > 0) {
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

  return {
    valid: errors.length === 0,
    type: 'skill',
    path: document.path,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate MCP Tools table structure
 */
function validateMcpToolsTable(table: MarkdownTable): Finding[] {
  const findings: Finding[] = [];

  // Check required columns
  const requiredColumns = ['Tool', 'Input Schema', 'Output'];
  const headers = table.headers.map((h) => h.toLowerCase());

  for (const col of requiredColumns) {
    if (!headers.includes(col.toLowerCase())) {
      findings.push(
        createError(
          'missing-tools-column',
          `MCP Tools table missing required column: '${col}'`,
          table.location,
          `Add a '${col}' column to the tools table`
        )
      );
    }
  }

  // Check each row has tool name
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    const toolName = row?.[0] ?? '';

    if (!toolName) {
      findings.push(
        createError(
          'empty-tool-name',
          `Row ${i + 1} has empty tool name`,
          table.location,
          'Add a tool name'
        )
      );
    } else if (!/^[a-z][a-z0-9_-]*$/.test(toolName.toLowerCase())) {
      findings.push(
        createWarning(
          'invalid-tool-name',
          `Tool name '${toolName}' should be lowercase with optional hyphens/underscores`,
          table.location,
          `Use a name like '${toolName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}'`
        )
      );
    }
  }

  return findings;
}
