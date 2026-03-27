"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Settings2, Target } from "lucide-react";
import { GoalsPanel } from "./goals-panel";
import type { WritingGoals } from "@/types";

interface SidebarProps {
  goals: WritingGoals;
  onGoalsChange: (goals: WritingGoals) => void;
}

export function Sidebar({ goals, onGoalsChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"goals" | "settings">("goals");

  return (
    <>
      {/* Toggle Button */}
      <Button
        size="icon-sm"
        variant="outline"
        className="fixed right-4 top-20 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-72 border-l bg-background transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "goals"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("goals")}
            >
              <Target className="h-4 w-4 inline-block mr-2" />
              Goals
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings2 className="h-4 w-4 inline-block mr-2" />
              Settings
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "goals" && (
              <GoalsPanel goals={goals} onGoalsChange={onGoalsChange} />
            )}
            {activeTab === "settings" && (
              <div className="text-sm text-muted-foreground">
                <p>Settings panel coming soon...</p>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <div className="border-t p-2 hidden md:block">
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsOpen(false)}
            >
              <ChevronRight className="h-4 w-4 mr-2" />
              Collapse sidebar
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}