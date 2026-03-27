"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TextEditor } from "@/components/editor/text-editor";
import { SuggestionCard } from "@/components/editor/suggestion-card";
import { StatsPanel } from "@/components/editor/stats-panel";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Header } from "@/components/header/header";
import { useGrammarCheck } from "@/hooks/use-grammar-check";
import type { Suggestion, WritingGoals } from "@/types";

export default function Home() {
  const { checkText, result, isLoading, error } = useGrammarCheck();
  const [goals, setGoals] = useState<WritingGoals>({
    audience: "general",
    intent: "inform",
    style: "neutral",
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [text, setText] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTextChange = useCallback(
    (newText: string) => {
      setText(newText);
      checkText(newText, goals);
    },
    [checkText, goals]
  );

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
  }, []);

  const handleAccept = useCallback((replacement: string) => {
    if (!selectedSuggestion) return;

    // Find the actual position of the original text
    const originalText = selectedSuggestion.original;
    let startPos = text.indexOf(originalText);

    // If not found, try case-insensitive search
    if (startPos === -1) {
      const lowerText = text.toLowerCase();
      const lowerOriginal = originalText.toLowerCase();
      startPos = lowerText.indexOf(lowerOriginal);
    }

    if (startPos === -1) {
      console.error("Could not find original text in the document");
      setSelectedSuggestion(null);
      return;
    }

    const endPos = startPos + originalText.length;

    // Replace the text
    const newText =
      text.slice(0, startPos) +
      replacement +
      text.slice(endPos);

    setText(newText);

    // Update the editor content
    if (editorRef.current) {
      editorRef.current.innerText = newText;
    }

    // Trigger a check on the new text
    checkText(newText, goals);
    setSelectedSuggestion(null);
  }, [selectedSuggestion, text, checkText, goals]);

  const handleIgnore = useCallback(() => {
    setSelectedSuggestion(null);
  }, []);

  // Close suggestion card when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedSuggestion && !(e.target as Element).closest('[data-suggestion-card]')) {
        setSelectedSuggestion(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [selectedSuggestion]);

  const suggestions = result?.suggestions || [];
  const stats = result?.stats || {
    wordCount: 0,
    characterCount: 0,
    sentenceCount: 0,
    readingTime: "0 min read",
    readabilityScore: 100,
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <main className="flex-1 overflow-auto p-4 lg:pr-[320px]">
          <div className="mx-auto max-w-3xl">
            {/* Error display */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Editor */}
            <div className="relative">
              <TextEditor
                ref={editorRef}
                suggestions={suggestions}
                onTextChange={handleTextChange}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isLoading}
              />

              {/* Suggestion Card */}
              {selectedSuggestion && (
                <div data-suggestion-card>
                  <SuggestionCard
                    suggestion={selectedSuggestion}
                    onAccept={handleAccept}
                    onIgnore={handleIgnore}
                  />
                </div>
              )}
            </div>

            {/* Stats Panel - Below editor on mobile */}
            <div className="mt-4 lg:hidden">
              <StatsPanel
                stats={stats}
                tone={result?.tone}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </div>
        </main>

        {/* Sidebar with Goals */}
        <Sidebar goals={goals} onGoalsChange={setGoals} />

        {/* Right panel with stats - Desktop only */}
        <aside className="hidden w-72 border-l bg-background p-4 xl:block">
          <StatsPanel
            stats={stats}
            tone={result?.tone}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        </aside>
      </div>
    </div>
  );
}