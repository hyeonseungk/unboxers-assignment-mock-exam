import { ExternalLink } from "lucide-react";

interface ExamHeaderProps {
  onEndExam: () => void;
}

export function ExamHeader({ onEndExam }: ExamHeaderProps) {
  return (
    <header className="flex items-center justify-end px-6 py-3 shrink-0">
      <button
        type="button"
        onClick={onEndExam}
        className="inline-flex items-center gap-1.5 text-base font-medium text-fg-secondary
                   active:text-fg-primary active:scale-[0.98] transition-all duration-150
                   select-none touch-manipulation min-h-12 px-4"
      >
        종료하기
        <ExternalLink className="w-4 h-4" />
      </button>
    </header>
  );
}
