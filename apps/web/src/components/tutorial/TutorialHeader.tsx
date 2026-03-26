import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TutorialHeaderProps {
  className?: string;
  onHome?: () => void;
}

export function TutorialHeader({ className, onHome }: TutorialHeaderProps) {
  return (
    <header
      className={cn(
        "relative shrink-0 grid h-16 grid-cols-[auto_1fr] items-center gap-4 border-b border-[#f0ede7] bg-white px-5 md:px-7",
        className,
      )}
    >
      <div className="flex items-center">
        <img src="/logo-image.png" alt="Logo" className="h-8 w-auto" />
      </div>
      <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-[-0.03em] text-[#232323]">
        모의고사 모드
      </h1>
      <div className="flex items-center justify-self-end gap-4 md:gap-6">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#f4efe8] bg-[#fdfbf8] px-4 text-[14px] font-semibold tracking-[-0.02em] text-[#2a2a2a] shadow-[0_8px_18px_rgba(24,24,24,0.06)] select-none touch-manipulation"
        >
          신희철 학생
          <ChevronDown className="size-4 text-[#4b4b4b]" strokeWidth={2.25} />
        </button>
        <button
          type="button"
          onClick={onHome}
          className="text-[15px] font-semibold tracking-[-0.02em] text-[#3a3a3a] select-none touch-manipulation"
        >
          홈으로
        </button>
      </div>
    </header>
  );
}
