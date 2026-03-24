import { useState, useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { type Theme, applyTheme, getStoredTheme } from "@/lib/utils/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  const toggle = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      className={cn(
        "inline-flex items-center justify-center",
        "size-12 rounded-xl",
        "bg-surface border border-line text-fg-secondary",
        "active:scale-95 transition-all duration-150",
        "touch-manipulation select-none",
        className,
      )}
    >
      {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </button>
  );
}
