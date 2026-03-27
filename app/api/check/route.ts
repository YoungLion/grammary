import { NextRequest, NextResponse } from "next/server";
import { checkGrammarFast, checkGrammarAdvanced, checkGrammar } from "@/lib/ai/grammar-check";
import type { WritingGoals } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, goals, mode } = body as {
      text: string;
      goals?: WritingGoals;
      mode?: "fast" | "advanced" | "full";
    };

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Default to fast mode for real-time checking
    const checkMode = mode || "fast";

    let result;

    switch (checkMode) {
      case "fast":
        // NLP only - instant response
        result = await checkGrammarFast(text);
        break;

      case "advanced":
        // LLM only - for background processing
        const advanced = await checkGrammarAdvanced(text, goals);
        result = {
          suggestions: advanced.suggestions,
          stats: {
            wordCount: 0,
            characterCount: 0,
            sentenceCount: 0,
            readingTime: "0 min read",
            readabilityScore: 70,
          },
          tone: advanced.tone,
        };
        break;

      case "full":
      default:
        // Combined NLP + LLM
        result = await checkGrammar(text, goals);
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to check grammar" },
      { status: 500 }
    );
  }
}