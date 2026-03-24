# PromptForge — AI Prompt Engineering Tools

> **Canlı Demo / Live Demo:** _[Deployment URL will be added after deploy]_

---

## 🇹🇷 Türkçe

**PromptForge**, ChatGPT, Claude, Gemini ve Mistral gibi büyük dil modelleri için komut (prompt) oluşturmanıza, optimize etmenize, test etmenize ve yönetmenize yardımcı olan kapsamlı bir yapay zeka araç platformudur.

### 🚀 Özellikler

| Sayfa | Açıklama |
|-------|----------|
| **Komut Üreticisi** | Model, görev türü, ton ve çıktı formatı seçerek otomatik optimize edilmiş komutlar üretin |
| **Komut İyileştirici** | Mevcut komutunuzu yapıştırın; Role Prompting, Chain of Thought, Few-Shot gibi tekniklerle iyileştirilmiş halini ve kalite puanını alın |
| **Komut Kütüphanesi** | Komutlarınızı kaydedin, düzenleyin, etiketleyin, arayın, favorileyin ve JSON olarak dışa aktarın |
| **Şablonlar** | Kodlama, startup, tasarım, pazarlama, araştırma, hata ayıklama ve veri analizi için 7 hazır şablon |
| **Test Alanı** | Simüle yapay zeka yanıtlarıyla komutlarınızı gerçek zamanlı test edin |
| **Puanlama** | Komutlarınızı 5 boyutta (Netlik, Yapı, Kısıtlamalar, Rol Tanımı, Çıktı Tanımı) 0-100 arasında puanlayın |

### 🌍 Dil Desteği

Sağ üst köşedeki **TR / EN** butonuyla tam Türkçe ↔ İngilizce geçiş yapabilirsiniz.

---

## 🇺🇸 English

**PromptForge** is a comprehensive AI prompt engineering platform that helps you generate, optimize, test, and manage prompts for ChatGPT, Claude, Gemini, Mistral, and other large language models.

### 🚀 Features

| Page | Description |
|------|-------------|
| **Prompt Generator** | Generate optimized prompts by selecting model, task type, tone, and output format |
| **Prompt Improver** | Paste any prompt and receive an improved version using Role Prompting, Chain of Thought, Few-Shot techniques with a quality score |
| **Prompt Library** | Save, edit, tag, search, favorite, and export prompts as JSON |
| **Templates** | 7 pre-built templates: Coding, Startup, Design, Marketing, Research, Debugging, Data Analysis |
| **Sandbox** | Test prompts with simulated AI responses in a real-time chat interface |
| **Scoring** | Score prompts across 5 dimensions (Clarity, Structure, Constraints, Role Definition, Output Specification) on a 0-100 scale |

### 🌍 Language Support

Switch between full **Turkish ↔ English** UI using the **TR / EN** toggle in the top-right corner.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animations** | Framer Motion |
| **Routing** | Wouter |
| **State / Data** | TanStack Query v5 |
| **Backend** | Express.js + Node.js |
| **Database** | PostgreSQL + Drizzle ORM |
| **Validation** | Zod + drizzle-zod |

---

## 📁 Project Structure

```
/
├── client/
│   └── src/
│       ├── components/
│       │   ├── app-sidebar.tsx       # Navigation sidebar
│       │   ├── theme-provider.tsx    # Dark/light mode
│       │   ├── theme-toggle.tsx      # Theme button
│       │   ├── language-provider.tsx # i18n context (EN/TR)
│       │   └── language-toggle.tsx   # Language button
│       ├── lib/
│       │   ├── i18n.ts               # All translations (EN + TR)
│       │   └── queryClient.ts        # TanStack Query setup
│       └── pages/
│           ├── home.tsx              # Landing page
│           ├── generator.tsx         # Prompt Generator
│           ├── improver.tsx          # Prompt Improver
│           ├── library.tsx           # Prompt Library
│           ├── templates.tsx         # Templates
│           ├── sandbox.tsx           # Sandbox
│           └── scoring.tsx           # Scoring
├── server/
│   ├── index.ts                      # Express server entry point
│   ├── routes.ts                     # API endpoints
│   ├── storage.ts                    # Database CRUD layer
│   ├── db.ts                         # Drizzle DB connection
│   ├── prompt-engine.ts              # Core prompt logic
│   └── seed.ts                       # Template seeding
└── shared/
    └── schema.ts                     # Drizzle schema + Zod types
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-prompt` | Generate an optimized prompt |
| `POST` | `/api/improve-prompt` | Improve an existing prompt |
| `POST` | `/api/score-prompt` | Score a prompt (0-100) |
| `POST` | `/api/sandbox-test` | Simulate AI response |
| `GET`  | `/api/prompts` | Get all saved prompts |
| `GET`  | `/api/templates` | Get all templates |
| `POST` | `/api/prompts` | Save a prompt |
| `PATCH`| `/api/prompts/:id` | Update a prompt |
| `DELETE`| `/api/prompts/:id` | Delete a prompt |

---

## ⚙️ Scoring System

Prompts are scored across 5 dimensions, each worth up to 20 points (total: 100):

| Dimension | Description |
|-----------|-------------|
| **Clarity** | How clear and unambiguous the prompt is |
| **Structure** | Organization, formatting, and logical flow |
| **Constraints** | Presence of rules, limits, and restrictions |
| **Role Definition** | How well the AI's role/persona is defined |
| **Output Specification** | Clarity of expected format and output |

**Grade Scale:** A+ (90-100) · A (80-89) · B (70-79) · C (60-69) · D (50-59) · F (0-49)

---

## 🔧 Prompt Improvement Techniques

The Prompt Improver applies the following techniques automatically:

- **Role Prompting** — Adds an expert role definition
- **Chain of Thought** — Adds step-by-step reasoning instructions
- **Few-Shot Prompting** — Adds constraint examples
- **Structured Instruction Formatting** — Improves organization and layout
- **Output Schema Enforcement** — Adds clear output format requirements

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Denizaltnr/AI-Prompt-Engineering-Tools.git
cd AI-Prompt-Engineering-Tools

# 2. Install dependencies
npm install

# 3. Set environment variables
# Create a .env file or export:
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
export SESSION_SECRET="your-secret-key"

# 4. Push database schema
npm run db:push

# 5. Start development server
npm run dev
# → App runs on http://localhost:5000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema changes to database |

---

## 🌐 Deployment

This app is deployed on **Replit Autoscale**. Visit the live demo:

> **[Live Demo →](_deployment-url_)**

The app uses:
- **Replit Autoscale** for hosting
- **Replit PostgreSQL** for persistent database
- **Replit Secrets** for environment variables

---

## 📝 Pre-built Templates

The app ships with 7 professionally crafted templates:

1. **Code Generation Expert** — Production-ready code with SOLID principles
2. **Startup Idea Validator** — VC-style analysis with TAM/SAM/SOM framework
3. **AI Product Designer** — Full product spec with UX and accessibility guidelines
4. **Marketing Copy Generator** — Headlines, CTAs, social captions, email subjects
5. **Research Assistant** — Systematic literature review framework
6. **Bug Fixing Specialist** — Root cause analysis and prevention strategies
7. **Data Analysis Expert** — Statistical analysis and visualization recommendations

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ using React, Express, and PostgreSQL</p>
