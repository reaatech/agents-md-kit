/**
 * Frontmatter parser for extracting YAML from markdown files
 */

import type { ParsedFrontmatter } from '@reaatech/agents-markdown';
import YAML from 'yaml';

/**
 * Result of frontmatter extraction
 */
export interface FrontmatterResult {
  /** Parsed frontmatter object, or null if no frontmatter found */
  frontmatter: ParsedFrontmatter | null;
  /** Line range of the frontmatter (if present) */
  frontmatterRange: { start: number; end: number } | null;
  /** Content without frontmatter */
  contentWithoutFrontmatter: string;
}

/**
 * Extract YAML frontmatter from markdown content
 */
export function extractFrontmatter(content: string): FrontmatterResult {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  // Check if content starts with frontmatter delimiter
  if (lines.length === 0 || lines[0]?.trim() !== '---') {
    return {
      frontmatter: null,
      frontmatterRange: null,
      contentWithoutFrontmatter: content,
    };
  }

  // Find the end of frontmatter
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      endIndex = i;
      break;
    }
  }

  // If no closing delimiter found, treat as no frontmatter
  if (endIndex === -1) {
    return {
      frontmatter: null,
      frontmatterRange: null,
      contentWithoutFrontmatter: content,
    };
  }

  // Extract frontmatter YAML
  const frontmatterLines = lines.slice(1, endIndex);
  const frontmatterYaml = frontmatterLines.join('\n');
  const frontmatterRange = {
    start: 1, // Line 1 is the opening ---
    end: endIndex + 1, // +1 for 1-indexed line numbers
  };

  // Parse YAML
  let parsedYaml: Record<string, unknown>;
  try {
    const raw = YAML.parse(frontmatterYaml);
    if (raw === undefined || raw === null || typeof raw !== 'object') {
      return {
        frontmatter: null,
        frontmatterRange,
        contentWithoutFrontmatter: lines.slice(endIndex + 1).join('\n'),
      };
    }
    parsedYaml = raw as Record<string, unknown>;
  } catch {
    // Return null if YAML is invalid
    return {
      frontmatter: null,
      frontmatterRange,
      contentWithoutFrontmatter: lines.slice(endIndex + 1).join('\n'),
    };
  }

  // Normalize frontmatter to ParsedFrontmatter
  const frontmatter = normalizeFrontmatter(parsedYaml, frontmatterYaml);

  // Get content after frontmatter
  const contentWithoutFrontmatter = lines.slice(endIndex + 1).join('\n');

  return {
    frontmatter,
    frontmatterRange,
    contentWithoutFrontmatter,
  };
}

/**
 * Normalize parsed YAML to ParsedFrontmatter structure
 */
function normalizeFrontmatter(yaml: Record<string, unknown>, raw: string): ParsedFrontmatter {
  // Handle both agent_id and skill_id
  const id = (yaml.agent_id ?? yaml.skill_id ?? yaml.id ?? '') as string;
  const display_name = (yaml.display_name ?? yaml.displayName ?? '') as string;
  const version = (yaml.version ?? '0.0.0') as string;
  const description = (yaml.description ?? '') as string;
  const type = yaml.type as string | undefined;
  const category = yaml.category as string | undefined;

  return {
    id,
    display_name,
    version,
    description,
    ...(type !== undefined ? { type } : {}),
    ...(category !== undefined ? { category } : {}),
    raw,
  };
}

/**
 * Validate frontmatter structure
 */
export function validateFrontmatterStructure(
  frontmatter: ParsedFrontmatter | null
): Array<{ field: string; valid: boolean; message: string }> {
  if (!frontmatter) {
    return [{ field: 'frontmatter', valid: false, message: 'No frontmatter found' }];
  }

  const issues: Array<{ field: string; valid: boolean; message: string }> = [];

  // Check required fields
  if (!frontmatter.id) {
    issues.push({
      field: 'id',
      valid: false,
      message: 'Missing required field: id (or agent_id/skill_id)',
    });
  } else {
    issues.push({ field: 'id', valid: true, message: 'Valid' });
  }

  if (!frontmatter.display_name) {
    issues.push({
      field: 'display_name',
      valid: false,
      message: 'Missing required field: display_name',
    });
  } else {
    issues.push({ field: 'display_name', valid: true, message: 'Valid' });
  }

  if (!frontmatter.version) {
    issues.push({
      field: 'version',
      valid: false,
      message: 'Missing required field: version',
    });
  } else if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+\d+)?$/.test(frontmatter.version)) {
    issues.push({
      field: 'version',
      valid: false,
      message: 'Version must be semantic version (e.g., 1.0.0)',
    });
  } else {
    issues.push({ field: 'version', valid: true, message: 'Valid' });
  }

  if (!frontmatter.description) {
    issues.push({
      field: 'description',
      valid: false,
      message: 'Missing required field: description',
    });
  } else if (frontmatter.description.length < 10) {
    issues.push({
      field: 'description',
      valid: false,
      message: 'Description must be at least 10 characters',
    });
  } else {
    issues.push({ field: 'description', valid: true, message: 'Valid' });
  }

  return issues;
}

/**
 * Create frontmatter string from values
 */
function escapeYamlString(value: string): string {
  if (value.includes('"') || value.includes('\\') || value.includes('\n') || value.includes(':')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return `"${value}"`;
}

export function createFrontmatter(values: Partial<ParsedFrontmatter>, isSkill = false): string {
  const idKey = isSkill ? 'skill_id' : 'agent_id';
  const entries: string[] = [];

  if (values.id !== undefined && values.id !== '') {
    entries.push(`${idKey}: ${escapeYamlString(values.id)}`);
  }
  if (values.display_name !== undefined && values.display_name !== '') {
    entries.push(`display_name: ${escapeYamlString(values.display_name)}`);
  }
  if (values.version !== undefined && values.version !== '') {
    entries.push(`version: ${escapeYamlString(values.version)}`);
  }
  if (values.description !== undefined && values.description !== '') {
    entries.push(`description: ${escapeYamlString(values.description)}`);
  }
  if (values.type !== undefined && values.type !== '') {
    entries.push(`type: ${escapeYamlString(values.type)}`);
  }
  if (values.category !== undefined && values.category !== '') {
    entries.push(`category: ${escapeYamlString(values.category)}`);
  }

  if (entries.length === 0) {
    return '';
  }

  return `---\n${entries.join('\n')}\n---\n`;
}

/**
 * Update frontmatter in existing markdown content
 */
export function updateFrontmatter(content: string, updates: Partial<ParsedFrontmatter>): string {
  const { frontmatter, contentWithoutFrontmatter } = extractFrontmatter(content);

  const merged: Partial<ParsedFrontmatter> = {
    ...frontmatter,
    ...updates,
  };

  const newFrontmatter = createFrontmatter(merged);

  if (newFrontmatter) {
    return newFrontmatter + contentWithoutFrontmatter.trimStart();
  }

  return content;
}
