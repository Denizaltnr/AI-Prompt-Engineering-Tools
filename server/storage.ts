import { type Prompt, type InsertPrompt, prompts } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getPrompts(): Promise<Prompt[]>;
  getPromptById(id: string): Promise<Prompt | undefined>;
  getTemplates(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: string, data: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: string): Promise<void>;
  searchPrompts(query: string): Promise<Prompt[]>;
}

export class DatabaseStorage implements IStorage {
  async getPrompts(): Promise<Prompt[]> {
    return db.select().from(prompts).where(eq(prompts.isTemplate, false)).orderBy(desc(prompts.createdAt));
  }

  async getPromptById(id: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async getTemplates(): Promise<Prompt[]> {
    return db.select().from(prompts).where(eq(prompts.isTemplate, true)).orderBy(prompts.templateCategory);
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [created] = await db.insert(prompts).values(prompt).returning();
    return created;
  }

  async updatePrompt(id: string, data: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const [updated] = await db.update(prompts).set(data).where(eq(prompts.id, id)).returning();
    return updated;
  }

  async deletePrompt(id: string): Promise<void> {
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  async searchPrompts(query: string): Promise<Prompt[]> {
    return db
      .select()
      .from(prompts)
      .where(
        and(
          eq(prompts.isTemplate, false),
          sql`(${prompts.title} ILIKE ${'%' + query + '%'} OR ${prompts.content} ILIKE ${'%' + query + '%'})`
        )
      )
      .orderBy(desc(prompts.createdAt));
  }
}

export const storage = new DatabaseStorage();
