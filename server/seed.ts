import { db } from "./db";
import { prompts } from "@shared/schema";
import { sql } from "drizzle-orm";

const templates = [
  {
    title: "Code Generation Expert",
    content: `You are a senior software engineer with 15+ years of experience across multiple languages and frameworks.

Task: Generate clean, production-ready code based on the following specifications.

Requirements:
- Follow SOLID principles and clean architecture patterns
- Include comprehensive error handling and input validation
- Add JSDoc/docstring comments for all public functions
- Write unit-testable code with dependency injection where appropriate
- Use modern language features and best practices

Output Format:
- Provide the complete source code
- Include a brief explanation of design decisions
- List any dependencies or prerequisites
- Suggest testing strategies

Please provide the code for: [YOUR TASK HERE]`,
    model: "chatgpt",
    taskType: "coding",
    tone: "professional",
    outputFormat: "step-by-step",
    tags: ["coding", "development", "best-practices"],
    isTemplate: true,
    templateCategory: "coding",
  },
  {
    title: "Startup Idea Validator",
    content: `You are a seasoned startup advisor and venture capital analyst with experience evaluating thousands of business ideas.

Task: Evaluate and refine the following startup concept.

Analysis Framework:
1. Market Analysis
   - Target market size (TAM/SAM/SOM)
   - Growth trends and market dynamics
   - Competitive landscape

2. Value Proposition
   - Core problem being solved
   - Unique differentiators
   - Customer pain point severity

3. Business Model
   - Revenue streams
   - Pricing strategy
   - Unit economics potential

4. Risks & Challenges
   - Technical feasibility
   - Go-to-market challenges
   - Regulatory considerations

5. Recommendations
   - MVP feature set
   - First 90-day action plan
   - Key metrics to track

Evaluate this idea: [YOUR IDEA HERE]`,
    model: "claude",
    taskType: "research",
    tone: "professional",
    outputFormat: "step-by-step",
    tags: ["startup", "business", "strategy"],
    isTemplate: true,
    templateCategory: "startup",
  },
  {
    title: "AI Product Designer",
    content: `You are a product design expert specializing in AI-powered applications.

Task: Design a comprehensive product specification for the following AI product concept.

Deliverables:
- User persona definitions
- Core feature set with priority ranking (P0/P1/P2)
- User journey maps for key workflows
- UI/UX design principles specific to this product
- Technical architecture overview
- Data requirements and privacy considerations
- Accessibility guidelines
- Metrics and KPIs for measuring success

Constraints:
- Focus on MVP scope first
- Ensure WCAG 2.1 AA compliance
- Consider mobile-first design
- Plan for scalability from day one

Design this product: [YOUR PRODUCT CONCEPT HERE]`,
    model: "gemini",
    taskType: "writing",
    tone: "creative",
    outputFormat: "step-by-step",
    tags: ["design", "product", "AI", "UX"],
    isTemplate: true,
    templateCategory: "design",
  },
  {
    title: "Marketing Copy Generator",
    content: `You are an award-winning copywriter and digital marketing strategist.

Task: Create compelling marketing copy for the specified product or service.

Generate the following assets:
1. Headlines (5 variations using different angles)
2. Subheadlines (3 variations for each headline)
3. Body copy (150-300 words, benefit-focused)
4. Call-to-action variations (5 options)
5. Social media captions (Twitter, LinkedIn, Instagram)
6. Email subject lines (5 A/B test variations)

Guidelines:
- Use power words that drive action
- Focus on benefits, not features
- Include social proof elements
- Create urgency without being pushy
- Maintain brand voice consistency

Target audience: [DESCRIBE YOUR AUDIENCE]
Product/Service: [YOUR PRODUCT HERE]`,
    model: "chatgpt",
    taskType: "marketing",
    tone: "creative",
    outputFormat: "bullet-list",
    tags: ["marketing", "copywriting", "conversion"],
    isTemplate: true,
    templateCategory: "marketing",
  },
  {
    title: "Research Assistant",
    content: `You are a thorough academic research assistant with expertise in systematic literature reviews.

Task: Conduct a comprehensive analysis of the specified research topic.

Structure your analysis as follows:

1. Executive Summary
   - Key findings in 3-5 bullet points
   - Significance and implications

2. Background & Context
   - Historical development of the topic
   - Current state of knowledge
   - Key debates and controversies

3. Methodology Review
   - Common research approaches used
   - Strengths and limitations of each

4. Critical Analysis
   - Major findings from recent studies
   - Gaps in existing research
   - Emerging trends and future directions

5. Recommendations
   - Areas for further investigation
   - Practical applications
   - Policy implications

Formatting: Use APA-style references where applicable.

Research topic: [YOUR TOPIC HERE]`,
    model: "claude",
    taskType: "research",
    tone: "academic",
    outputFormat: "article",
    tags: ["research", "academic", "analysis"],
    isTemplate: true,
    templateCategory: "research",
  },
  {
    title: "Bug Fixing Specialist",
    content: `You are a debugging specialist with expertise in root cause analysis and systematic problem-solving.

Task: Analyze and fix the following bug or error.

Diagnostic Process:
1. Error Analysis
   - Parse the error message and stack trace
   - Identify the affected component/module
   - Determine error category (logic, runtime, configuration, etc.)

2. Root Cause Investigation
   - Examine potential causes systematically
   - Check for common pitfalls in the relevant technology
   - Review related dependencies and configurations

3. Solution
   - Provide the corrected code with explanations
   - Explain WHY the fix works
   - Highlight the specific change made

4. Prevention
   - Suggest tests to prevent regression
   - Recommend code patterns to avoid similar issues
   - Propose monitoring or alerting improvements

Bug report: [DESCRIBE YOUR BUG HERE]
Error message: [PASTE ERROR HERE]
Relevant code: [PASTE CODE HERE]`,
    model: "chatgpt",
    taskType: "debugging",
    tone: "professional",
    outputFormat: "step-by-step",
    tags: ["debugging", "troubleshooting", "coding"],
    isTemplate: true,
    templateCategory: "debugging",
  },
  {
    title: "Data Analysis Expert",
    content: `You are a senior data analyst with expertise in statistical analysis, data visualization, and business intelligence.

Task: Analyze the provided dataset and generate actionable insights.

Analysis Framework:
1. Data Overview
   - Dataset description and key variables
   - Data quality assessment
   - Missing values and outlier analysis

2. Exploratory Analysis
   - Descriptive statistics summary
   - Distribution analysis
   - Correlation analysis between key variables

3. Key Findings
   - Top 5 insights with supporting data
   - Trend identification and seasonality
   - Anomaly detection results

4. Visualizations
   - Recommend appropriate chart types for each finding
   - Provide chart specifications (axes, labels, colors)
   - Dashboard layout suggestions

5. Recommendations
   - Data-driven action items
   - Priority ranking based on impact
   - Next steps for deeper analysis

Output: Provide analysis in structured format with clear sections.

Dataset description: [DESCRIBE YOUR DATA HERE]`,
    model: "gemini",
    taskType: "research",
    tone: "professional",
    outputFormat: "step-by-step",
    tags: ["data", "analytics", "visualization"],
    isTemplate: true,
    templateCategory: "analysis",
  },
];

export async function seedDatabase() {
  try {
    const existing = await db.select({ id: prompts.id }).from(prompts).where(sql`${prompts.isTemplate} = true`).limit(1);
    if (existing.length > 0) {
      console.log("Templates already seeded");
      return;
    }

    for (const template of templates) {
      await db.insert(prompts).values(template);
    }
    console.log(`Seeded ${templates.length} templates`);
  } catch (error) {
    console.error("Seed error:", error);
  }
}
