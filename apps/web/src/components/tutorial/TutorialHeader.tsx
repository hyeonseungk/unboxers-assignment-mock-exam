import { cn } from "@/lib/utils/cn";

interface TutorialHeaderProps {
  className?: string;
}

export function TutorialHeader({ className }: TutorialHeaderProps) {
  return (
    <header
      className={cn(
        "shrink-0 h-16 grid grid-cols-3 items-center px-8 border-b border-line",
        className,
      )}
    >
      <div className="flex items-center">
        <img src="/logo-image.png" alt="Logo" className="h-8 w-auto" />
      </div>
      <h1 className="text-lg font-bold text-fg-primary text-center">
        모의고사 모드
      </h1>
      <div className="flex justify-end">
        <button className="text-base text-fg-secondary select-none touch-manipulation">
          홈으로
        </button>
      </div>
    </header>
  );
}
