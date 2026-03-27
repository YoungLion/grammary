import { unified } from "unified";
import retextEnglish from "retext-english";
import retextSpell from "retext-spell";
import retextReadability from "retext-readability";
import retextPassive from "retext-passive";
import retextIndefiniteArticle from "retext-indefinite-article";
import retextRepeatedWords from "retext-repeated-words";
import retextSentenceSpacing from "retext-sentence-spacing";
import dictionaryEn from "dictionary-en";
import type { Suggestion, WritingStats } from "@/types";
import type { VFile } from "vfile";

interface NlpMessage {
  reason: string;
  source?: string;
  expected?: string[];
}

// Map retext source to our suggestion types
function mapType(source?: string): Suggestion["type"] {
  switch (source) {
    case "retext-spell":
      return "spelling";
    case "retext-indefinite-article":
      return "grammar";
    case "retext-repeated-words":
      return "style";
    case "retext-passive":
      return "style";
    case "retext-readability":
      return "clarity";
    case "retext-sentence-spacing":
      return "punctuation";
    default:
      return "grammar";
  }
}

export async function checkWithNlp(text: string): Promise<Suggestion[]> {
  if (!text.trim()) {
    return [];
  }

  const suggestions: Suggestion[] = [];

  try {
    // Create processor and parse the text
    const processor = unified()
      .use(retextEnglish)
      .use(retextSpell, dictionaryEn)
      .use(retextIndefiniteArticle)
      .use(retextRepeatedWords)
      .use(retextPassive)
      .use(retextSentenceSpacing)
      .use(retextReadability);

    // Parse the text to get the syntax tree
    const tree = processor.parse(text);

    // Run the transformers on the tree
    const file: VFile = { data: {}, messages: [], value: text } as VFile;
    await processor.run(tree, file);

    // Extract messages
    const messages = file.messages as unknown as NlpMessage[];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Extract the original word from backticks in the message reason
      // Format: "Unexpected article `a` before `apple`, expected `an`"
      const backtickMatch = message.reason.match(/`([^`]+)`/);
      const original = backtickMatch ? backtickMatch[1] : "";

      if (!original) continue;

      // Find the position in text
      const startPos = text.indexOf(original);
      if (startPos === -1) continue;

      suggestions.push({
        id: `nlp-${i}-${Date.now()}`,
        type: mapType(message.source),
        message: message.reason,
        original,
        replacements: message.expected || [],
        explanation: undefined,
      });
    }
  } catch (error) {
    console.error("NLP check error:", error);
  }

  return suggestions;
}

export function calculateStats(text: string): WritingStats {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const characters = text.length;

  // Calculate readability score (Flesch-Kincaid simplified)
  const syllableCount = countSyllables(text);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);

  // Flesch Reading Ease approximation
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / Math.max(1, wordCount);
  const readabilityScore = Math.round(
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  );

  return {
    wordCount,
    characterCount: characters,
    sentenceCount,
    readingTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
  };
}

// Simple syllable counter
function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  let count = 0;

  for (const word of words) {
    if (word.length <= 3) {
      count += 1;
      continue;
    }

    // Remove silent e at end
    let w = word.replace(/e$/, "");

    // Count vowel groups
    const vowels = w.match(/[aeiouy]+/g);
    count += vowels ? vowels.length : 1;
  }

  return count;
}