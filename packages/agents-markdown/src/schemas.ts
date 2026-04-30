/**
 * Zod schemas for validating AGENTS.md and SKILL.md files
 */

import { z } from 'zod';

/**
 * Schema for YAML frontmatter in AGENTS.md files
 */
export const AgentsMdFrontmatterSchema = z.object({
  /** Unique agent identifier */
  agent_id: z.string().min(1, 'agent_id is required'),
  /** Human-readable display name */
  display_name: z.string().min(1, 'display_name is required'),
  /** Semantic version */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semantic version (e.g., 1.0.0)'),
  /** Brief description of agent capabilities */
  description: z.string().min(10, 'description must be at least 10 characters'),
  /** Agent type */
  type: z.enum(['mcp', 'orchestrator', 'classifier', 'router', 'evaluator']).optional(),
  /** Confidence threshold for agent decisions */
  confidence_threshold: z.number().min(0).max(1).optional(),
  /** Environment variables configuration */
  config: z
    .object({
      env_vars: z.array(z.string()).optional(),
      secrets: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Schema for YAML frontmatter in SKILL.md files
 */
export const SkillMdFrontmatterSchema = z.object({
  /** Unique skill identifier */
  skill_id: z.string().min(1, 'skill_id is required'),
  /** Human-readable display name */
  display_name: z.string().min(1, 'display_name is required'),
  /** Semantic version */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semantic version (e.g., 1.0.0)'),
  /** Brief description of skill capabilities */
  description: z.string().min(10, 'description must be at least 10 characters'),
  /** Skill category */
  category: z.enum(['tool', 'orchestration', 'evaluation', 'routing']),
});

/**
 * Schema for a section in a markdown document
 */
export const SectionSchema = z.object({
  /** Section heading text */
  title: z.string(),
  /** Heading level (1-6) */
  level: z.number().min(1).max(6),
  /** Section content */
  content: z.string(),
  /** Line number where section starts */
  startLine: z.number().min(1),
  /** Line number where section ends */
  endLine: z.number().min(1),
});

/**
 * Schema for validating AGENTS.md document structure
 */
export const AgentsMdSchema = z.object({
  /** Frontmatter validation */
  frontmatter: AgentsMdFrontmatterSchema,
  /** Document must have a title (h1) */
  title: z.string().min(1, 'Document must have a title'),
  /** Required sections */
  sections: z.object({
    /** What this is section */
    whatThisIs: SectionSchema.optional(),
    /** Architecture Overview section */
    architectureOverview: SectionSchema.optional(),
    /** Skill System section */
    skillSystem: SectionSchema.optional(),
    /** MCP Integration section */
    mcpIntegration: SectionSchema.optional(),
    /** Security Considerations section */
    securityConsiderations: SectionSchema.optional(),
    /** Observability section */
    observability: SectionSchema.optional(),
    /** Checklist: Production Readiness section */
    checklist: SectionSchema.optional(),
  }),
});

/**
 * Schema for validating SKILL.md document structure
 */
export const SkillMdSchema = z.object({
  /** Frontmatter validation */
  frontmatter: SkillMdFrontmatterSchema,
  /** Document must have a title (h1) */
  title: z.string().min(1, 'Document must have a title'),
  /** Required sections */
  sections: z.object({
    /** Capability section */
    capability: SectionSchema.optional(),
    /** MCP Tools section */
    mcpTools: SectionSchema.optional(),
    /** Usage Examples section */
    usageExamples: SectionSchema.optional(),
    /** Error Handling section */
    errorHandling: SectionSchema.optional(),
    /** Security Considerations section */
    securityConsiderations: SectionSchema.optional(),
  }),
});

/**
 * Schema for MCP tool definition in SKILL.md
 */
export const McpToolSchema = z.object({
  /** Tool name */
  name: z.string(),
  /** Input schema description */
  inputSchema: z.string().optional(),
  /** Output description */
  output: z.string().optional(),
  /** Rate limit */
  rateLimit: z.string().optional(),
});

/**
 * Schema for skill reference in AGENTS.md
 */
export const SkillReferenceSchema = z.object({
  /** Skill ID */
  skillId: z.string(),
  /** File path to skill */
  path: z.string(),
});

/**
 * Inferred types from schemas
 */
export type AgentsMdFrontmatter = z.infer<typeof AgentsMdFrontmatterSchema>;
export type SkillMdFrontmatter = z.infer<typeof SkillMdFrontmatterSchema>;
export type SchemaSection = z.infer<typeof SectionSchema>;
export type AgentsMdValidation = z.infer<typeof AgentsMdSchema>;
export type SkillMdValidation = z.infer<typeof SkillMdSchema>;
export type McpTool = z.infer<typeof McpToolSchema>;
export type SkillReference = z.infer<typeof SkillReferenceSchema>;
