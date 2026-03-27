import OpenAI from "openai";
import type { GrammarCheckResult, Suggestion, WritingGoals } from "@/types";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
}

const GRAMMAR_CHECK_PROMPT = `You are an expert grammar and style checker. Analyze the given text and identify issues.

For each issue found, provide:
1. The type: one of "spelling", "grammar", "style", "clarity", "punctuation", "tone"
2. A brief message describing the issue
3. The original text that has the issue (exact text from the input)
4. Suggested replacements (array of strings)
5. An optional explanation of why it's an issue

Also analyze:
- The overall tone of the text
- Writing statistics

Respond in JSON format with this structure:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "grammar",
      "message": "Subject-verb agreement error",
      "original": "the cats runs",
      "replacements": ["the cats run"],
      "explanation": "Plural subjects need plural verbs"
    }
  ],
  "tone": {
    "primary": "formal",
    "confidence": 0.85,
    "description": "The text has a formal, professional tone"
  },
  "stats": {
    "wordCount": 100,
    "characterCount": 500,
    "sentenceCount": 10,
    "readingTime": "2 min read",
    "readabilityScore": 65
  }
}

Important:
- Only report actual issues, not false positives
- The "original" field must be exact text from the input (this is critical for replacements)
- Provide helpful, actionable suggestions
- Calculate reading time based on ~200 words per minute
- Readability score should be 0-100 (higher = easier to read)`;

export async function checkGrammar(
  text: string,
  goals?: WritingGoals
): Promise<GrammarCheckResult> {
  if (!text.trim()) {
    return {
      suggestions: [],
      stats: {
        wordCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        readingTime: "0 min read",
        readabilityScore: 100,
      },
    };
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
        { role: "system", content: GRAMMAR_CHECK_PROMPT + goalContext },
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

    const result = JSON.parse(jsonContent) as GrammarCheckResult;

    // Ensure each suggestion has an id
    result.suggestions = result.suggestions.map((s: Suggestion, i: number) => ({
      ...s,
      id: s.id || `suggestion-${i}-${Date.now()}`,
    }));

    return result;
  } catch (error) {
    console.error("Grammar check error:", error);
    // Return basic stats on error
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(Boolean);

    return {
      suggestions: [],
      stats: {
        wordCount: words.length,
        characterCount: text.length,
        sentenceCount: sentences.length,
        readingTime: `${Math.max(1, Math.ceil(words.length / 200))} min read`,
        readabilityScore: 70,
      },
    };
  }
}