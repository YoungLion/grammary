export type SuggestionType =
  | "spelling"
  | "grammar"
  | "style"
  | "clarity"
  | "punctuation"
  | "tone";

export interface Suggestion {
  id: string;
  type: SuggestionType;
  message: string;
  original: string;
  replacements: string[];
  position?: {
    start: number;
    end: number;
  };
  explanation?: string;
}

export interface GrammarCheckResult {
  suggestions: Suggestion[];
  tone?: ToneAnalysis;
  stats: WritingStats;
}

export interface ToneAnalysis {
  primary: string;
  confidence: number;
  description: string;
}

export interface WritingStats {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  readingTime: string;
  readabilityScore: number;
}

export interface WritingGoals {
  audience: "general" | "academic" | "business" | "casual";
  intent: "inform" | "persuade" | "entertain" | "describe";
  style: "formal" | "neutral" | "casual";
}

export interface EditorState {
  text: string;
  suggestions: Suggestion[];
  isLoading: boolean;
  selectedSuggestion: Suggestion | null;
  goals: WritingGoals;
}