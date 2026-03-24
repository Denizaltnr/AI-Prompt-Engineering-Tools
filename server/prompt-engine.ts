import type { GeneratePromptInput, ScoreBreakdown, ImproveResult } from "@shared/schema";

const MODEL_TIPS: Record<string, string> = {
  chatgpt: "Use clear instructions, break complex tasks into steps, and specify the desired format.",
  claude: "Be direct, provide context, and use XML tags for structure when helpful.",
  gemini: "Provide detailed context, use examples, and specify constraints clearly.",
  mistral: "Keep instructions concise, use structured formats, and define the expected output.",
};

const TASK_TEMPLATES: Record<string, (context?: string) => string> = {
  coding: (ctx) =>
    `You are an expert software engineer. Write clean, well-documented, and production-ready code.${
      ctx ? `\n\nTask: ${ctx}` : ""
    }\n\nRequirements:\n- Follow best practices and design patterns\n- Include error handling\n- Add inline comments for complex logic\n- Ensure the code is testable and maintainable`,
  writing: (ctx) =>
    `You are a skilled writer and editor. Create compelling, well-structured content.${
      ctx ? `\n\nTopic: ${ctx}` : ""
    }\n\nGuidelines:\n- Use engaging language and clear structure\n- Include relevant examples and analogies\n- Maintain consistent tone throughout\n- Proofread for grammar and clarity`,
  research: (ctx) =>
    `You are a thorough research analyst. Provide comprehensive, evidence-based analysis.${
      ctx ? `\n\nResearch topic: ${ctx}` : ""
    }\n\nApproach:\n- Gather information from multiple perspectives\n- Cite key findings and data points\n- Identify trends and patterns\n- Provide actionable conclusions`,
  marketing: (ctx) =>
    `You are a marketing strategist and copywriter. Create persuasive, conversion-focused content.${
      ctx ? `\n\nObjective: ${ctx}` : ""
    }\n\nFocus on:\n- Clear value proposition\n- Target audience pain points\n- Compelling calls to action\n- Measurable outcomes`,
  debugging: (ctx) =>
    `You are a debugging expert. Systematically identify and resolve issues.${
      ctx ? `\n\nProblem: ${ctx}` : ""
    }\n\nProcess:\n- Analyze the symptoms and error messages\n- Identify potential root causes\n- Suggest fixes with explanations\n- Recommend prevention strategies`,
  summarization: (ctx) =>
    `You are a skilled summarizer. Distill complex information into clear, concise summaries.${
      ctx ? `\n\nContent to summarize: ${ctx}` : ""
    }\n\nApproach:\n- Identify key points and main arguments\n- Preserve essential details\n- Use clear, accessible language\n- Maintain the original meaning and intent`,
};

const TONE_MODIFIERS: Record<string, string> = {
  professional:
    "Maintain a professional, authoritative tone. Use precise language and industry-standard terminology.",
  creative:
    "Be creative and engaging. Use vivid language, metaphors, and an innovative approach.",
  academic:
    "Use an academic tone with formal language. Include citations format and structured argumentation.",
  simple:
    "Use simple, everyday language. Avoid jargon and explain concepts as if to a beginner.",
};

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  json: "Format your response as valid JSON with clearly labeled fields.",
  article:
    "Structure your response as a well-organized article with introduction, body, and conclusion.",
  "bullet-list":
    "Present your response as a structured bullet-point list with clear categories.",
  "step-by-step":
    "Break down your response into numbered, sequential steps that are easy to follow.",
};

export function generatePrompt(input: GeneratePromptInput): string {
  const taskTemplate = TASK_TEMPLATES[input.taskType]?.(input.context) || TASK_TEMPLATES.coding(input.context);
  const toneModifier = TONE_MODIFIERS[input.tone] || TONE_MODIFIERS.professional;
  const formatInstruction = FORMAT_INSTRUCTIONS[input.outputFormat] || FORMAT_INSTRUCTIONS["step-by-step"];
  const modelTip = MODEL_TIPS[input.model] || "";

  return `${taskTemplate}\n\nTone: ${toneModifier}\n\nOutput Format: ${formatInstruction}${
    modelTip ? `\n\n[Optimized for ${input.model}: ${modelTip}]` : ""
  }`;
}

export function scorePrompt(prompt: string): ScoreBreakdown {
  const lower = prompt.toLowerCase();
  const words = prompt.split(/\s+/).length;
  const sentences = prompt.split(/[.!?]+/).filter(Boolean).length;
  const lines = prompt.split("\n").filter((l) => l.trim()).length;

  let clarity = 4;
  if (words > 20) clarity += 3;
  if (words > 50) clarity += 3;
  if (sentences > 2) clarity += 2;
  if (!lower.includes("maybe") && !lower.includes("perhaps")) clarity += 2;
  if (lower.includes("specific") || lower.includes("exactly") || lower.includes("precisely")) clarity += 3;
  if (prompt.includes("?") && prompt.includes(".")) clarity += 1;
  if (words > 10 && words < 500) clarity += 2;
  clarity = Math.min(20, clarity);

  let structure = 3;
  if (lines > 3) structure += 3;
  if (prompt.includes("-") || prompt.includes("*") || prompt.includes("1.")) structure += 3;
  if (prompt.includes("\n\n")) structure += 2;
  if (lower.includes("step") || lower.includes("first") || lower.includes("then")) structure += 3;
  if (prompt.includes(":")) structure += 2;
  if (lines > 5) structure += 2;
  if (/\d+\.\s/.test(prompt)) structure += 2;
  structure = Math.min(20, structure);

  let constraints = 2;
  if (lower.includes("must") || lower.includes("should") || lower.includes("required")) constraints += 3;
  if (lower.includes("do not") || lower.includes("don't") || lower.includes("avoid")) constraints += 3;
  if (lower.includes("limit") || lower.includes("maximum") || lower.includes("minimum")) constraints += 3;
  if (lower.includes("only") || lower.includes("never") || lower.includes("always")) constraints += 2;
  if (lower.includes("ensure") || lower.includes("make sure")) constraints += 2;
  if (lower.includes("constraint") || lower.includes("requirement")) constraints += 2;
  if (lower.includes("between") || lower.includes("range")) constraints += 2;
  constraints = Math.min(20, constraints);

  let roleDefinition = 2;
  if (lower.includes("you are") || lower.includes("act as") || lower.includes("role")) roleDefinition += 4;
  if (lower.includes("expert") || lower.includes("specialist") || lower.includes("professional")) roleDefinition += 3;
  if (lower.includes("perspective") || lower.includes("point of view")) roleDefinition += 2;
  if (lower.includes("persona") || lower.includes("character")) roleDefinition += 2;
  if (lower.includes("experience") || lower.includes("background")) roleDefinition += 2;
  if (lower.includes("senior") || lower.includes("lead") || lower.includes("chief")) roleDefinition += 3;
  if (lower.includes("years of experience")) roleDefinition += 2;
  roleDefinition = Math.min(20, roleDefinition);

  let outputSpecification = 2;
  if (lower.includes("format") || lower.includes("output") || lower.includes("response")) outputSpecification += 3;
  if (lower.includes("json") || lower.includes("markdown") || lower.includes("html")) outputSpecification += 3;
  if (lower.includes("example") || lower.includes("sample")) outputSpecification += 3;
  if (lower.includes("length") || lower.includes("words") || lower.includes("paragraphs")) outputSpecification += 2;
  if (lower.includes("structure") || lower.includes("sections")) outputSpecification += 2;
  if (lower.includes("include") || lower.includes("contain")) outputSpecification += 2;
  if (lower.includes("list") || lower.includes("table") || lower.includes("bullet")) outputSpecification += 2;
  outputSpecification = Math.min(20, outputSpecification);

  const total = clarity + structure + constraints + roleDefinition + outputSpecification;

  return { clarity, structure, constraints, roleDefinition, outputSpecification, total };
}

export function improvePrompt(originalPrompt: string): ImproveResult {
  const score = scorePrompt(originalPrompt);
  const improvements: string[] = [];
  const techniques: string[] = [];
  let improved = originalPrompt;

  if (score.roleDefinition < 10) {
    improved = `You are an experienced AI assistant with deep expertise in this domain.\n\n${improved}`;
    improvements.push("Added role definition to establish AI expertise and context");
    techniques.push("Role Prompting");
  }

  if (score.structure < 10) {
    if (!improved.includes("\n\n")) {
      const sentences = improved.split(/(?<=[.!?])\s+/);
      if (sentences.length > 2) {
        const mid = Math.ceil(sentences.length / 2);
        improved = sentences.slice(0, mid).join(" ") + "\n\n" + sentences.slice(mid).join(" ");
      }
    }
    improvements.push("Improved structural organization with clear sections");
    techniques.push("Structured Instruction Formatting");
  }

  if (score.constraints < 10) {
    improved += "\n\nConstraints:\n- Ensure accuracy and relevance in all responses\n- Avoid speculation or unverified claims\n- Stay focused on the specified topic";
    improvements.push("Added explicit constraints to guide AI behavior");
    techniques.push("Few-shot Prompting");
  }

  if (score.outputSpecification < 10) {
    improved += "\n\nExpected Output:\n- Provide a well-structured, comprehensive response\n- Include specific examples where applicable\n- Use clear formatting for readability";
    improvements.push("Added output specification for clearer expectations");
    techniques.push("Output Schema Enforcement");
  }

  if (score.clarity < 10) {
    improved += "\n\nThink through this step-by-step:\n1. First, analyze the core requirements\n2. Then, consider relevant approaches\n3. Finally, provide a comprehensive solution";
    improvements.push("Added chain-of-thought reasoning for better clarity");
    techniques.push("Chain of Thought");
  }

  if (improvements.length === 0) {
    improvements.push("Your prompt is already well-structured");
    improvements.push("Minor formatting optimizations applied");
    techniques.push("Best Practices Review");
  }

  const improvedScore = scorePrompt(improved);

  return {
    improvedPrompt: improved,
    score: improvedScore.total,
    improvements,
    techniques,
  };
}

export function simulateAIResponse(prompt: string, model: string): string {
  const lower = prompt.toLowerCase();
  const modelName = model.charAt(0).toUpperCase() + model.slice(1);

  if (lower.includes("code") || lower.includes("function") || lower.includes("program") || lower.includes("script")) {
    return `[${modelName} Simulated Response]\n\nBased on your request, here's a solution approach:\n\n\`\`\`\n// Implementation outline\nfunction solution() {\n  // Step 1: Parse and validate input\n  const input = validateInput(data);\n  \n  // Step 2: Process the core logic\n  const result = processLogic(input);\n  \n  // Step 3: Format and return output\n  return formatOutput(result);\n}\n\n// Error handling wrapper\ntry {\n  const output = solution();\n  console.log(output);\n} catch (error) {\n  console.error('Error:', error.message);\n}\n\`\`\`\n\nKey considerations:\n- Input validation is crucial for robustness\n- The processing step should handle edge cases\n- Output formatting ensures consistency\n\nThis is a simulated response for testing purposes. In production, connect to a real ${modelName} API for actual responses.`;
  }

  if (lower.includes("write") || lower.includes("article") || lower.includes("blog") || lower.includes("essay")) {
    return `[${modelName} Simulated Response]\n\n# Understanding the Topic\n\nThis subject presents several interesting facets worth exploring. Let me break this down into key areas:\n\n## Key Points\n\n1. **Foundation**: The underlying principles establish a strong base for understanding.\n\n2. **Application**: Practical applications demonstrate real-world relevance and impact.\n\n3. **Future Implications**: Looking ahead, we can anticipate significant developments in this area.\n\n## Analysis\n\nThe intersection of theory and practice reveals opportunities for innovation. By examining current trends and historical patterns, we can identify actionable insights.\n\n## Conclusion\n\nMoving forward, continued exploration and adaptation will be essential for staying ahead in this dynamic field.\n\nThis is a simulated response for testing purposes.`;
  }

  if (lower.includes("list") || lower.includes("ideas") || lower.includes("suggest") || lower.includes("recommend")) {
    return `[${modelName} Simulated Response]\n\nHere are the key recommendations based on your request:\n\n1. **Start with clear objectives** - Define what success looks like before beginning\n\n2. **Research and benchmark** - Study existing solutions and best practices\n\n3. **Iterate and refine** - Use feedback loops to continuously improve\n\n4. **Measure and optimize** - Track key metrics and adjust accordingly\n\n5. **Document and share** - Create comprehensive documentation for future reference\n\nEach recommendation builds on the previous one, creating a systematic approach to achieving your goals.\n\nThis is a simulated response for testing purposes.`;
  }

  if (lower.includes("analyze") || lower.includes("data") || lower.includes("research")) {
    return `[${modelName} Simulated Response]\n\n## Analysis Results\n\n### Overview\nAfter examining the available information, several patterns emerge:\n\n### Key Findings\n- **Trend 1**: Consistent growth observed across primary metrics (+15% YoY)\n- **Trend 2**: Emerging opportunities in secondary market segments\n- **Trend 3**: Operational efficiency improvements of 20-30%\n\n### Methodology\nThe analysis employed both quantitative and qualitative approaches to ensure comprehensive coverage.\n\n### Recommendations\n1. Capitalize on identified growth areas\n2. Invest in automation for efficiency gains\n3. Monitor emerging trends for early adoption opportunities\n\nThis is a simulated response for testing purposes.`;
  }

  return `[${modelName} Simulated Response]\n\nThank you for your prompt. Here's my response:\n\nI've analyzed your request and identified the following key aspects to address:\n\n1. **Understanding the Context**\n   Your prompt provides a clear foundation for generating a relevant response. The specificity helps guide the output effectively.\n\n2. **Approach**\n   Based on the requirements, I recommend a structured methodology that prioritizes clarity and actionable outcomes.\n\n3. **Key Considerations**\n   - Ensure alignment with stated objectives\n   - Maintain consistency throughout the response\n   - Provide specific, actionable recommendations\n\n4. **Next Steps**\n   Consider refining the prompt further for even more targeted results. Adding specific examples or constraints can significantly improve output quality.\n\nThis is a simulated response for testing purposes. Connect to a real ${modelName} API for production use.`;
}
