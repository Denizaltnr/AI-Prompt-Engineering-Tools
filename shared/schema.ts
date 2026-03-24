import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  improvedContent: text("improved_content"),
  model: text("model").notNull().default("chatgpt"),
  taskType: text("task_type").notNull().default("general"),
  tone: text("tone").notNull().default("professional"),
  outputFormat: text("output_format").notNull().default("text"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  score: integer("score"),
  scoreBreakdown: jsonb("score_breakdown"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  templateCategory: text("template_category"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

export const generatePromptSchema = z.object({
  model: z.enum(["chatgpt", "claude", "gemini", "mistral"]),
  taskType: z.enum(["coding", "writing", "research", "marketing", "debugging", "summarization"]),
  tone: z.enum(["professional", "creative", "academic", "simple"]),
  outputFormat: z.enum(["json", "article", "bullet-list", "step-by-step"]),
  context: z.string().optional(),
});

export type GeneratePromptInput = z.infer<typeof generatePromptSchema>;

export const improvePromptSchema = z.object({
  prompt: z.string().min(1),
});

export type ImprovePromptInput = z.infer<typeof improvePromptSchema>;

export const scorePromptSchema = z.object({
  prompt: z.string().min(1),
});

export type ScorePromptInput = z.infer<typeof scorePromptSchema>;

export const sandboxTestSchema = z.object({
  prompt: z.string().min(1),
  model: z.enum(["chatgpt", "claude", "gemini", "mistral"]).optional(),
});

export type SandboxTestInput = z.infer<typeof sandboxTestSchema>;

export interface ScoreBreakdown {
  clarity: number;
  structure: number;
  constraints: number;
  roleDefinition: number;
  outputSpecification: number;
  total: number;
}

export interface ImproveResult {
  improvedPrompt: string;
  score: number;
  improvements: string[];
  techniques: string[];
}
