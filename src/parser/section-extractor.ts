/**
 * Section extractor for building section hierarchy from markdown
 */

import type { Section, ErrorLocation } from '../types/domain.js';

/**
 * Extract sections from markdown content
 */
export function extractSections(
  content: string,
  lineOffset: number = 0
): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  const headingStack: { section: Section; level: number }[] = [];

  let currentContent: string[] = [];
  let currentLevel: number = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch?.[1] !== undefined && headingMatch[2] !== undefined) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      // Save current section content to the correct section on the stack
      if (currentLevel > 0 && currentContent.length > 0) {
        const sectionContent = currentContent.join('\n').trim();
        for (let k = headingStack.length - 1; k >= 0; k--) {
          const entry = headingStack[k];
          if (entry?.section !== undefined) {
            entry.section.content = sectionContent;
            break;
          }
        }
      }

      // Create new section
      const section: Section = {
        title,
        level,
        content: '',
        location: {
          line: i + 1 + lineOffset,
          endLine: i + 1 + lineOffset,
        } as ErrorLocation,
        subsections: [],
      };

      // Pop stack until we find parent level
      while (
        headingStack.length > 0 &&
        (headingStack[headingStack.length - 1]?.level ?? 0) >= level
      ) {
        headingStack.pop();
      }

      // Add to parent or root
      if (headingStack.length > 0) {
        const parent = headingStack[headingStack.length - 1]?.section;
        if (parent) {
          parent.subsections.push(section);
        }
      } else {
        sections.push(section);
      }

      headingStack.push({ section, level });
      currentLevel = level;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Handle last section
  if (headingStack.length > 0 && currentContent.length > 0) {
    const top = headingStack[headingStack.length - 1];
    if (top) {
      top.section.content = currentContent.join('\n').trim();
    }
  }

  // Set end lines for all sections
  setEndLines(sections, lines.length + lineOffset);

  return sections;
}

/**
 * Recursively set end lines for sections
 */
function setEndLines(sections: Section[], maxLine: number): void {
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section) {continue;}

    if (section.subsections.length > 0) {
      // End line is the end of the last subsection
      const lastSubsection = section.subsections[section.subsections.length - 1];
      if (lastSubsection) {
        section.location.endLine = lastSubsection.location.endLine ?? lastSubsection.location.line;
      }
    } else if (i + 1 < sections.length) {
      // End line is before the next sibling
      const nextSection = sections[i + 1];
      if (nextSection) {
        section.location.endLine = nextSection.location.line - 1;
      }
    } else {
      // Last section ends at end of content
      section.location.endLine = maxLine;
    }

    // Recurse for subsections
    setEndLines(section.subsections, maxLine);
  }
}

/**
 * Find a section by title (case-insensitive)
 */
export function findSection(
  sections: Section[],
  title: string
): Section | undefined {
  const lowerTitle = title.toLowerCase();
  
  for (const section of sections) {
    if (section.title.toLowerCase() === lowerTitle) {
      return section;
    }
    const found = findSection(section.subsections, title);
    if (found) {
      return found;
    }
  }
  
  return undefined;
}

/**
 * Find a section by path (e.g., "Architecture Overview/Skill System")
 */
export function findSectionByPath(
  sections: Section[],
  path: string[]
): Section | undefined {
  if (path.length === 0) {return undefined;}

  const [first, ...rest] = path;
  if (first === undefined) {return undefined;}

  const section = sections.find(
    (s) => s.title.toLowerCase() === first.toLowerCase()
  );

  if (!section) {return undefined;}
  if (rest.length === 0) {return section;}

  return findSectionByPath(section.subsections, rest);
}

/**
 * Get all section titles as a flat list
 */
export function flattenSectionTitles(sections: Section[]): string[] {
  const titles: string[] = [];

  function process(section: Section) {
    titles.push(section.title);
    for (const subsection of section.subsections) {
      process(subsection);
    }
  }

  for (const section of sections) {
    process(section);
  }

  return titles;
}

/**
 * Check if a section exists (case-insensitive)
 */
export function hasSection(sections: Section[], title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return sections.some(
    (s) =>
      s.title.toLowerCase() === lowerTitle ||
      hasSection(s.subsections, title)
  );
}

/**
 * Get sections at a specific level
 */
export function getSectionsAtLevel(
  sections: Section[],
  level: number
): Section[] {
  const result: Section[] = [];

  function process(sections: Section[]) {
    for (const section of sections) {
      if (section.level === level) {
        result.push(section);
      }
      process(section.subsections);
    }
  }

  process(sections);
  return result;
}
