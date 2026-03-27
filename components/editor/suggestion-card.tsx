"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Suggestion } from "@/types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Pencil,
  SpellCheck,
  X,
} from "lucide-react";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: (replacement: string) => void;
  onIgnore: () => void;
}

const typeIcons: Record<Suggestion["type"], React.ReactNode> = {
  spelling: <SpellCheck className="h-4 w-4" />,
  grammar: <BookOpen className="h-4 w-4" />,
  style: <Pencil className="h-4 w-4" />,
  clarity: <Lightbulb className="h-4 w-4" />,
  punctuation: <MessageSquare className="h-4 w-4" />,
  tone: <AlertCircle className="h-4 w-4" />,
};

const typeColors: Record<Suggestion["type"], string> = {
  spelling: "text-red-600 bg-red-50 border-red-200",
  grammar: "text-yellow-600 bg-yellow-50 border-yellow-200",
  style: "text-blue-600 bg-blue-50 border-blue-200",
  clarity: "text-purple-600 bg-purple-50 border-purple-200",
  punctuation: "text-orange-600 bg-orange-50 border-orange-200",
  tone: "text-green-600 bg-green-50 border-green-200",
};

export function SuggestionCard({
  suggestion,
  onAccept,
  onIgnore,
}: SuggestionCardProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onIgnore}
      />

      {/* Modal */}
      <Card
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 p-4 shadow-xl",
          "animate-in fade-in-0 zoom-in-95",
          typeColors[suggestion.type]
        )}
      >
        {/* Close button */}
        <button
          onClick={onIgnore}
          className="absolute right-2 top-2 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-current/20">
          <span className="flex items-center gap-1.5 text-sm font-semibold capitalize">
            {typeIcons[suggestion.type]}
            {suggestion.type}
          </span>
        </div>

        {/* Message */}
        <p className="text-sm font-medium mb-3">{suggestion.message}</p>

        {/* Original text */}
        <div className="text-sm mb-3 p-2 rounded bg-white/50">
          <span className="text-muted-foreground text-xs">Original: </span>
          <span className="line-through">"{suggestion.original}"</span>
        </div>

        {/* Replacements */}
        {suggestion.replacements.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium mb-2">Suggested fixes:</p>
            <div className="flex flex-wrap gap-2">
              {suggestion.replacements.slice(0, 3).map((replacement, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className="h-8 text-sm bg-white/80 hover:bg-white"
                  onClick={() => onAccept(replacement)}
                >
                  {replacement}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {suggestion.explanation && (
          <p className="text-xs text-muted-foreground mb-3 p-2 bg-white/30 rounded italic">
            {suggestion.explanation}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-current/20">
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={onIgnore}
          >
            Ignore
          </Button>
          {suggestion.replacements[0] && (
            <Button
              size="sm"
              className="h-8"
              onClick={() => onAccept(suggestion.replacements[0])}
            >
              Accept
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}