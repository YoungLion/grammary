import { NextRequest, NextResponse } from "next/server";
import { checkGrammar } from "@/lib/ai/grammar-check";
import type { WritingGoals } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, goals } = body as { text: string; goals?: WritingGoals };

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const result = await checkGrammar(text, goals);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to check grammar" },
      { status: 500 }
    );
  }
}