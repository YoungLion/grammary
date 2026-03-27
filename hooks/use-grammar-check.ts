"use client";

import { useState, useCallback, useRef } from "react";
import type { GrammarCheckResult, WritingGoals } from "@/types";

interface UseGrammarCheckResult {
  checkText: (text: string, goals?: WritingGoals) => void;
  result: GrammarCheckResult | null;
  isLoading: boolean;
  isLoadingAdvanced: boolean;
  error: string | null;
}

export function useGrammarCheck(): UseGrammarCheckResult {
  const [result, setResult] = useState<GrammarCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdvanced, setIsLoadingAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const advancedAbortControllerRef = useRef<AbortController | null>(null);
  const fastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const advancedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTextRef = useRef<string>("");

  const checkText = useCallback((text: string, goals?: WritingGoals) => {
    currentTextRef.current = text;

    // Cancel previous requests
    if (fastTimeoutRef.current) {
      clearTimeout(fastTimeoutRef.current);
    }
    if (advancedTimeoutRef.current) {
      clearTimeout(advancedTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (advancedAbortControllerRef.current) {
      advancedAbortControllerRef.current.abort();
    }

    // Clear previous error
    setError(null);

    // Don't check empty text
    if (!text.trim()) {
      setResult({
        suggestions: [],
        stats: {
          wordCount: 0,
          characterCount: 0,
          sentenceCount: 0,
          readingTime: "0 min read",
          readabilityScore: 100,
        },
      });
      return;
    }

    // Fast NLP check (short debounce: 200ms)
    fastTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, goals, mode: "fast" }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Failed to check grammar");

        const data = await response.json();
        setResult(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }, 200);

    // Advanced LLM check (longer debounce: 800ms)
    advancedTimeoutRef.current = setTimeout(async () => {
      setIsLoadingAdvanced(true);
      advancedAbortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: currentTextRef.current, goals, mode: "advanced" }),
          signal: advancedAbortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Failed advanced check");

        const data = await response.json();

        // Merge with existing results
        setResult((prev) => {
          if (!prev) return data;

          // Avoid duplicate suggestions
          const existingOriginals = new Set(
            prev.suggestions.map((s) => s.original.toLowerCase())
          );
          const newSuggestions = data.suggestions.filter(
            (s: { original: string }) => !existingOriginals.has(s.original.toLowerCase())
          );

          return {
            suggestions: [...prev.suggestions, ...newSuggestions],
            stats: prev.stats,
            tone: data.tone || prev.tone,
          };
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        // Don't show error for advanced check, just log it
        console.error("Advanced check error:", err);
      } finally {
        setIsLoadingAdvanced(false);
      }
    }, 800);
  }, []);

  return {
    checkText,
    result,
    isLoading,
    isLoadingAdvanced,
    error,
  };
}