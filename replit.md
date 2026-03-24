# PromptForge - AI Prompt Engineering Tools

## Overview
A full-stack web application for generating, optimizing, testing, and managing prompts for large language models (ChatGPT, Claude, Gemini, Mistral).

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS + Shadcn UI + Framer Motion + wouter
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL via Drizzle ORM
- **Language**: TypeScript

## Architecture
- `client/` - React frontend with pages and components
- `server/` - Express backend with routes, storage, and prompt engine
- `shared/` - Shared schema and types (Drizzle + Zod)

## Features
1. **Prompt Generator** - Generate optimized prompts by selecting model, task type, tone, and format
2. **Prompt Improver** - Paste a prompt to get an improved version with score and technique explanations
3. **Prompt Library** - Save, edit, tag, search, and favorite prompts with export to JSON
4. **Prompt Templates** - 7 pre-built templates for coding, startup, design, marketing, research, debugging, analysis
5. **Prompt Sandbox** - Test prompts with simulated AI responses in a chat interface
6. **Prompt Scoring** - Score prompts on 5 dimensions: clarity, structure, constraints, role definition, output specification

## Key Files
- `shared/schema.ts` - Database schema and Zod validation schemas
- `server/prompt-engine.ts` - Prompt generation, improvement, scoring, and simulation logic
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database CRUD operations
- `server/seed.ts` - Template seeding
- `client/src/App.tsx` - Main app with sidebar navigation and routing

## API Endpoints
- `POST /api/generate-prompt` - Generate an optimized prompt
- `POST /api/improve-prompt` - Improve an existing prompt
- `POST /api/score-prompt` - Score a prompt
- `POST /api/sandbox-test` - Test a prompt with simulated response
- `GET /api/prompts` - Get all saved prompts
- `GET /api/templates` - Get all templates
- `POST /api/prompts` - Save a new prompt
- `PATCH /api/prompts/:id` - Update a prompt
- `DELETE /api/prompts/:id` - Delete a prompt

## Database
Uses PostgreSQL with Drizzle ORM. Schema pushed via `npm run db:push`. Templates auto-seeded on startup.
