import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePromptSchema, improvePromptSchema, scorePromptSchema, sandboxTestSchema, insertPromptSchema } from "@shared/schema";
import { generatePrompt, scorePrompt, improvePrompt, simulateAIResponse } from "./prompt-engine";
import { registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerAuthRoutes(app);

  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const parsed = generatePromptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
      }
      const prompt = generatePrompt(parsed.data);
      res.json({ prompt });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/improve-prompt", async (req, res) => {
    try {
      const parsed = improvePromptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
      }
      const result = improvePrompt(parsed.data.prompt);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/score-prompt", async (req, res) => {
    try {
      const parsed = scorePromptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
      }
      const result = scorePrompt(parsed.data.prompt);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/sandbox-test", async (req, res) => {
    try {
      const parsed = sandboxTestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
      }
      const response = simulateAIResponse(parsed.data.prompt, parsed.data.model || "chatgpt");
      res.json({ response });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/prompts", async (_req, res) => {
    try {
      const prompts = await storage.getPrompts();
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/prompts", async (req, res) => {
    try {
      const parsed = insertPromptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.message });
      }
      const prompt = await storage.createPrompt(parsed.data);
      res.json(prompt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/prompts/:id", async (req, res) => {
    try {
      const partial = insertPromptSchema.partial().safeParse(req.body);
      if (!partial.success) {
        return res.status(400).json({ message: partial.error.message });
      }
      const updated = await storage.updatePrompt(req.params.id, partial.data);
      if (!updated) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/prompts/:id", async (req, res) => {
    try {
      await storage.deletePrompt(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
