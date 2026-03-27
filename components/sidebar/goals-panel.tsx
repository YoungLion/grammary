"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WritingGoals } from "@/types";
import { Target, Users, Lightbulb, PenLine } from "lucide-react";

interface GoalsPanelProps {
  goals: WritingGoals;
  onGoalsChange: (goals: WritingGoals) => void;
}

const audienceOptions: { value: WritingGoals["audience"]; label: string; icon: React.ReactNode }[] = [
  { value: "general", label: "General", icon: <Users className="h-4 w-4" /> },
  { value: "academic", label: "Academic", icon: <Target className="h-4 w-4" /> },
  { value: "business", label: "Business", icon: <Target className="h-4 w-4" /> },
  { value: "casual", label: "Casual", icon: <Users className="h-4 w-4" /> },
];

const intentOptions: { value: WritingGoals["intent"]; label: string }[] = [
  { value: "inform", label: "Inform" },
  { value: "persuade", label: "Persuade" },
  { value: "entertain", label: "Entertain" },
  { value: "describe", label: "Describe" },
];

const styleOptions: { value: WritingGoals["style"]; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "neutral", label: "Neutral" },
  { value: "casual", label: "Casual" },
];

export function GoalsPanel({ goals, onGoalsChange }: GoalsPanelProps) {
  const updateGoal = <K extends keyof WritingGoals>(
    key: K,
    value: WritingGoals[K]
  ) => {
    onGoalsChange({ ...goals, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Audience */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Audience
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {audienceOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={goals.audience === option.value ? "default" : "outline"}
              className="justify-start"
              onClick={() => updateGoal("audience", option.value)}
            >
              {option.icon}
              <span className="ml-2">{option.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Intent */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Intent
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {intentOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={goals.intent === option.value ? "default" : "outline"}
              className="justify-start"
              onClick={() => updateGoal("intent", option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Style */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <PenLine className="h-4 w-4" />
          Style
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {styleOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={goals.style === option.value ? "default" : "outline"}
              onClick={() => updateGoal("style", option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}