"use client";

import { useState, useCallback, useRef } from "react";
import type { GrammarCheckResult, WritingGoals } from "@/types";

interface UseGrammarCheckResult {
  checkText: (text: string, goals?: WritingGoals) => Promise<void>;
  result: GrammarCheckResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useGrammarCheck(): UseGrammarCheckResult {
  const [result, setResult] = useState<GrammarCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkText = useCallback(async (text: string, goals?: WritingGoals) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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

    // Debounce the request
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, goals }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to check grammar");
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, []);

  return { checkText, result, isLoading, error };
}