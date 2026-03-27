import OpenAI from "openai";
import type { GrammarCheckResult, Suggestion, WritingGoals, ToneAnalysis } from "@/types";
import { checkWithNlp, calculateStats } from "@/lib/nlp/grammar-check";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
}

const ADVANCED_CHECK_PROMPT = `You are an expert writing advisor. Analyze the given text for advanced writing improvements.

Focus on:
1. Tone analysis (formal, casual, confident, tentative, etc.)
2. Style improvements (word choice, conciseness, clarity)
3. Sentence structure suggestions

For each suggestion, provide:
- type: "style", "clarity", or "tone"
- message: brief description
- original: the exact text to improve
- replacements: suggested alternatives
- explanation: why this improvement helps

Also provide a tone analysis.

Respond in JSON format:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "style",
      "message": "Consider a more concise alternative",
      "original": "in order to",
      "replacements": ["to"],
      "explanation": "'To' is more concise and direct"
    }
  ],
  "tone": {
    "primary": "formal",
    "confidence": 0.85,
    "description": "The text has a formal, professional tone"
  }
}

Important:
- Only suggest meaningful improvements, not trivial changes
- The "original" field must be exact text from the input
- Provide helpful explanations
- Be conservative - don't suggest changes unless they genuinely improve the writing`;

/**
 * Fast NLP-based grammar check
 * Returns immediately with spelling, basic grammar, readability
 */
export async function checkGrammarFast(text: string): Promise<GrammarCheckResult> {
  const [suggestions, stats] = await Promise.all([
    checkWithNlp(text),
    Promise.resolve(calculateStats(text)),
  ]);

  return {
    suggestions,
    stats,
    tone: undefined,
  };
}

/**
 * Advanced LLM-based writing analysis
 * For tone, style, and context-aware suggestions
 */
export async function checkGrammarAdvanced(
  text: string,
  goals?: WritingGoals
): Promise<{ suggestions: Suggestion[]; tone?: ToneAnalysis }> {
  if (!text.trim()) {
    return { suggestions: [], tone: undefined };
  }

  const goalContext = goals
    ? `\n\nWriting goals context:
- Audience: ${goals.audience}
- Intent: ${goals.intent}
- Style: ${goals.style}
Please consider these goals when making suggestions.`
    : "";

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "glm-4.5-air",
      messages: [
        { role: "system", content: ADVANCED_CHECK_PROMPT + goalContext },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from API");
    }

    // Strip markdown code blocks if present
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const result = JSON.parse(jsonContent) as {
      suggestions: Suggestion[];
      tone?: ToneAnalysis;
    };

    // Ensure each suggestion has an id and mark as advanced
    result.suggestions = result.suggestions.map((s: Suggestion, i: number) => ({
      ...s,
      id: s.id || `llm-${i}-${Date.now()}`,
      type: s.type || "style",
    }));

    return result;
  } catch (error) {
    console.error("Advanced grammar check error:", error);
    return { suggestions: [], tone: undefined };
  }
}

/**
 * Full grammar check (NLP + LLM)
 * Combines both for comprehensive analysis
 */
export async function checkGrammar(
  text: string,
  goals?: WritingGoals
): Promise<GrammarCheckResult> {
  // Run both in parallel
  const [fastResult, advancedResult] = await Promise.all([
    checkGrammarFast(text),
    checkGrammarAdvanced(text, goals),
  ]);

  // Merge suggestions (avoid duplicates by comparing original text)
  const seenOriginals = new Set(fastResult.suggestions.map((s) => s.original.toLowerCase()));
  const uniqueAdvanced = advancedResult.suggestions.filter(
    (s) => !seenOriginals.has(s.original.toLowerCase())
  );

  return {
    suggestions: [...fastResult.suggestions, ...uniqueAdvanced],
    stats: fastResult.stats,
    tone: advancedResult.tone,
  };
}