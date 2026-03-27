"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WritingStats, ToneAnalysis, Suggestion } from "@/types";
import { Clock, FileText, Type, BarChart3, Sparkles, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsPanelProps {
  stats: WritingStats;
  tone?: ToneAnalysis;
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const typeColors: Record<Suggestion["type"], string> = {
  spelling: "text-red-600 bg-red-50 border-red-200",
  grammar: "text-yellow-600 bg-yellow-50 border-yellow-200",
  style: "text-blue-600 bg-blue-50 border-blue-200",
  clarity: "text-purple-600 bg-purple-50 border-purple-200",
  punctuation: "text-orange-600 bg-orange-50 border-orange-200",
  tone: "text-green-600 bg-green-50 border-green-200",
};

export function StatsPanel({ stats, tone, suggestions, onSuggestionClick }: StatsPanelProps) {
  const suggestionCount = suggestions.length;

  return (
    <div className="space-y-4">
      {/* Writing Stats */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Statistics
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" />
              Words
            </span>
            <span className="font-medium">{stats.wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Characters</span>
            <span className="font-medium">{stats.characterCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Sentences
            </span>
            <span className="font-medium">{stats.sentenceCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Reading time
            </span>
            <span className="font-medium">{stats.readingTime}</span>
          </div>
        </div>
      </Card>

      {/* Readability Score */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Readability Score</h3>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-muted fill-none"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-primary fill-none"
                strokeWidth="4"
                strokeDasharray={`${(stats.readabilityScore / 100) * 176} 176`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{stats.readabilityScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {stats.readabilityScore >= 80
                ? "Very Easy"
                : stats.readabilityScore >= 60
                ? "Fairly Easy"
                : stats.readabilityScore >= 40
                ? "Standard"
                : stats.readabilityScore >= 20
                ? "Fairly Difficult"
                : "Very Difficult"}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.readabilityScore >= 60
                ? "Suitable for most readers"
                : "May need simplification"}
            </p>
          </div>
        </div>
      </Card>

      {/* Tone */}
      {tone && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Tone
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">{tone.primary}</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(tone.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{tone.description}</p>
          </div>
        </Card>
      )}

      {/* Issues List */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Issues Found
        </h3>

        {suggestionCount === 0 ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-green-100 text-green-700">
              ✓
            </div>
            <p className="text-sm text-muted-foreground">No issues found!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto py-2 px-3 border",
                  typeColors[suggestion.type]
                )}
                onClick={() => onSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-xs uppercase font-semibold shrink-0 mt-0.5">
                    {suggestion.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      "{suggestion.original}"
                    </p>
                    <p className="text-xs opacity-70 truncate">
                      {suggestion.message}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                </div>
              </Button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}