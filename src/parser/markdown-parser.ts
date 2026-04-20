/**
 * Markdown parser with AST extraction and line number preservation
 */

import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import type { Root } from 'mdast';
import type { AgentsMdDocument, SkillMdDocument, Section } from '../types/domain.js';
import { extractFrontmatter } from './frontmatter-parser.js';
import { extractSections } from './section-extractor.js';
import { parseTables } from './table-parser.js';
import { extractCodeBlocks } from './code-block-extractor.js';

/**
 * Parse markdown content to extract structured data
 */
export interface ParseResult {
  /** Parsed AST */
  ast: Root;
  /** Document type (inferred from content or specified) */
  type: 'agents' | 'skill' | 'unknown';
}

/**
 * Parse a markdown file into a structured document
 */
export async function parseMarkdown(
  content: string,
  path: string,
): Promise<AgentsMdDocument | SkillMdDocument> {
  // Parse markdown to AST
  const processor = remark().use(remarkFrontmatter, ['yaml']);
  const ast = processor.parse(content) as Root;

  // Extract frontmatter
  const { frontmatter, frontmatterRange, contentWithoutFrontmatter } = extractFrontmatter(content);

  // Extract sections
  const sections = extractSections(contentWithoutFrontmatter, frontmatterRange?.end ?? 0);

  // Extract tables (pass contentWithoutFrontmatter so line numbers are consistent with sections)
  const tables = parseTables(contentWithoutFrontmatter);
  for (const table of tables) {
    table.location.line += frontmatterRange?.end ?? 0;
    if (table.location.endLine !== undefined) {
      table.location.endLine += frontmatterRange?.end ?? 0;
    }
  }

  // Extract code blocks (same treatment)
  const codeBlocks = extractCodeBlocks(contentWithoutFrontmatter);
  for (const block of codeBlocks) {
    block.location.line += frontmatterRange?.end ?? 0;
    if (block.location.endLine !== undefined) {
      block.location.endLine += frontmatterRange?.end ?? 0;
    }
  }

  // Extract title (first h1)
  const title = extractTitle(ast) ?? 'Untitled';

  // Determine document type
  const type = determineDocumentType(frontmatter, sections, path);

  // Build document object
  const baseDocument = {
    path,
    raw: content,
    frontmatter,
    title,
    sections,
    tables,
    codeBlocks,
    frontmatterRange,
  };

  if (type === 'skill') {
    return baseDocument as SkillMdDocument;
  }

  return baseDocument as AgentsMdDocument;
}

/**
 * Parse multiple markdown files
 */
export async function parseMarkdownFiles(
  files: Array<{ content: string; path: string }>,
): Promise<Array<AgentsMdDocument | SkillMdDocument>> {
  return Promise.all(files.map((file) => parseMarkdown(file.content, file.path)));
}

/**
 * Extract the title from the AST (first h1 heading)
 */
function extractTitle(ast: Root): string | null {
  for (const node of ast.children) {
    if (node.type === 'heading' && 'depth' in node && node.depth === 1) {
      // Extract text content from heading
      const textParts: string[] = [];
      for (const child of node.children) {
        if (child.type === 'text') {
          textParts.push(child.value);
        }
      }
      return textParts.join('') || null;
    }
  }
  return null;
}

/**
 * Determine document type based on frontmatter and content
 */
function determineDocumentType(
  frontmatter: AgentsMdDocument['frontmatter'],
  sections: Section[],
  path: string,
): 'agents' | 'skill' | 'unknown' {
  // Check path for hints
  if (path.includes('skill.md') || path.includes('skills/')) {
    return 'skill';
  }
  if (path.includes('AGENTS.md') || path.includes('agents.md')) {
    return 'agents';
  }

  // Check frontmatter for type hints
  if (frontmatter) {
    const raw = frontmatter.raw ?? '';
    if (raw.includes('agent_id:')) {
      return 'agents';
    }
    if (raw.includes('skill_id:')) {
      return 'skill';
    }
  }

  // Check sections for hints
  const sectionTitles = sections.map((s) => s.title.toLowerCase());
  if (sectionTitles.some((t) => t.includes('skill system') || t.includes('mcp integration'))) {
    return 'agents';
  }
  if (sectionTitles.some((t) => t.includes('capability') || t.includes('mcp tools'))) {
    return 'skill';
  }

  return 'unknown';
}

/**
 * Get section titles from a parsed document
 */
export function getSectionTitles(document: AgentsMdDocument | SkillMdDocument): string[] {
  return document.sections.map((s) => s.title);
}

/**
 * Find a section by title (case-insensitive)
 */
export function findSection(
  document: AgentsMdDocument | SkillMdDocument,
  title: string,
): Section | undefined {
  const lowerTitle = title.toLowerCase();
  return document.sections.find((s) => s.title.toLowerCase() === lowerTitle);
}

/**
 * Get all headings from a document
 */
export function getHeadings(document: AgentsMdDocument | SkillMdDocument): Array<{
  title: string;
  level: number;
  line: number;
}> {
  const headings: Array<{ title: string; level: number; line: number }> = [];

  function processSection(section: Section) {
    headings.push({
      title: section.title,
      level: section.level,
      line: section.location.line,
    });

    for (const subsection of section.subsections) {
      processSection(subsection);
    }
  }

  for (const section of document.sections) {
    processSection(section);
  }

  return headings;
}
