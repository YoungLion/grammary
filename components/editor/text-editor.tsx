"use client";

import { useState, useCallback, useRef, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { Suggestion } from "@/types";

interface TextEditorProps {
  suggestions: Suggestion[];
  onTextChange: (text: string) => void;
  onSuggestionClick: (suggestion: Suggestion) => void;
  isLoading: boolean;
}

// Get the color for each suggestion type
const getSuggestionColor = (type: Suggestion["type"]) => {
  switch (type) {
    case "spelling":
      return "bg-red-200/50 border-b-2 border-red-500";
    case "grammar":
      return "bg-yellow-200/50 border-b-2 border-yellow-500";
    case "style":
      return "bg-blue-200/50 border-b-2 border-blue-500";
    case "clarity":
      return "bg-purple-200/50 border-b-2 border-purple-500";
    case "punctuation":
      return "bg-orange-200/50 border-b-2 border-orange-500";
    case "tone":
      return "bg-green-200/50 border-b-2 border-green-500";
    default:
      return "bg-gray-200/50 border-b-2 border-gray-500";
  }
};

export const TextEditor = forwardRef<HTMLDivElement, TextEditorProps>(
  function TextEditor(
    { suggestions, onTextChange, onSuggestionClick, isLoading },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const editorRef = (ref as React.RefObject<HTMLDivElement>) || innerRef;
    const isComposing = useRef(false);

    const handleInput = useCallback(() => {
      if (isComposing.current) return;
      const editor = editorRef.current;
      if (!editor) return;

      const newText = editor.innerText || "";
      onTextChange(newText);
    }, [onTextChange, editorRef]);

    const handleCompositionStart = () => {
      isComposing.current = true;
    };

    const handleCompositionEnd = () => {
      isComposing.current = false;
      handleInput();
    };

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || suggestions.length === 0) return;

      // Focus the editor initially
      if (!editor.innerText) {
        editor.focus();
      }
    }, [editorRef, suggestions]);

    return (
      <div className="relative flex-1">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Analyzing...
            </div>
          </div>
        )}

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={cn(
            "min-h-[500px] w-full resize-none overflow-auto p-6 text-lg leading-relaxed outline-none",
            "rounded-lg border border-input bg-background",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
          )}
          data-placeholder="Start typing or paste your text here..."
          style={{ minHeight: "calc(100vh - 200px)" }}
        />
      </div>
    );
  }
);