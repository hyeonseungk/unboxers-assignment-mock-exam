import { cn } from "@/lib/utils/cn";

const SUBJECTIVE_COUNT = 11;
const SUBJECTIVE_START = 15;

interface OmrSubjectiveListProps {
  answers: Record<number, string>;
  selectedQuestion: number | null;
  onSelectQuestion: (displayNumber: number) => void;
  disabled?: boolean;
}

export function OmrSubjectiveList({
  answers,
  selectedQuestion,
  onSelectQuestion,
  disabled = false,
}: OmrSubjectiveListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-line-secondary pb-2 mb-3">
        <p className="text-base font-bold text-fg-primary text-center">
          주관식 답안
        </p>
      </div>

      <p className="text-base text-fg-muted mb-3">
        문항을 터치하여 답안을 입력하세요.
      </p>

      <div className="flex flex-col gap-1.5">
        {Array.from({ length: SUBJECTIVE_COUNT }, (_, i) => {
          const displayNumber = SUBJECTIVE_START + i;
          const value = answers[displayNumber] ?? "";
          const isSelected = selectedQuestion === displayNumber;

          return (
            <button
              key={displayNumber}
              type="button"
              onClick={() => onSelectQuestion(displayNumber)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-3 min-h-11 px-3 py-1.5 rounded-lg",
                "text-base transition-all duration-150",
                "select-none touch-manipulation",
                "active:scale-[0.99]",
                isSelected
                  ? "bg-accent-light border-2 border-accent"
                  : "bg-surface-secondary border border-line hover:border-line-secondary",
                disabled && "pointer-events-none opacity-60",
              )}
            >
              <span className="font-medium text-fg-primary w-8 shrink-0">
                {displayNumber}
              </span>
              <span
                className={cn(
                  "flex-1 text-left",
                  value ? "text-fg-primary font-semibold" : "text-fg-muted",
                )}
              >
                {value || "미입력"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-auto pt-3 text-base text-fg-muted leading-relaxed">
        아래표는 주관식 답안을
        <br />
        입력하는 방법에 활용하세요.
      </p>
    </div>
  );
}
