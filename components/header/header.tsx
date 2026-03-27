"use client";

import { Button } from "@/components/ui/button";
import { PenLine, Settings, Moon, Sun } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PenLine className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Grammary</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button size="icon-sm" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}