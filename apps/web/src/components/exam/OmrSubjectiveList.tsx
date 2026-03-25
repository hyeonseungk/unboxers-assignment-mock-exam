import { cn } from "@/lib/utils/cn";
import {
  SUBJECTIVE_COUNT,
  SUBJECTIVE_DISPLAY_START,
} from "@/lib/constants/exam";

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
    <div className="flex flex-col h-full pl-3 pr-2 w-full">
      <div className="pb-[18px]">
        <p className="text-[17px] font-extrabold text-[#111] text-center tracking-[0.3em]">
          주 관 식 답 안
        </p>
      </div>

      <div className="flex flex-col border border-[#8EABF2] bg-[#FFFBEF] overflow-hidden">
        {Array.from({ length: SUBJECTIVE_COUNT }, (_, i) => {
          const displayNumber = SUBJECTIVE_DISPLAY_START + i;
          const value = answers[displayNumber] ?? "";
          const isSelected = selectedQuestion === displayNumber;
          const isLast = i === SUBJECTIVE_COUNT - 1;

          return (
            <button
              key={displayNumber}
              type="button"
              onClick={() => onSelectQuestion(displayNumber)}
              disabled={disabled}
              className={cn(
                "flex items-stretch min-h-[43px] bg-[#FFFBEF]",
                "transition-all duration-150 select-none touch-manipulation",
                !isLast && "border-b border-[#8EABF2]",
                isSelected && "bg-[#F5F8FF]",
                disabled && "pointer-events-none opacity-60",
              )}
            >
              <div className="w-[40px] shrink-0 flex items-center justify-center bg-[#EAF2FF] border-r border-[#8EABF2]">
                <span className="font-bold text-[#5D7FE6] text-[14px]">
                  {displayNumber}
                </span>
              </div>
              <div
                className={cn(
                  "flex-1 text-center px-3 flex items-center justify-center",
                  value
                    ? "text-[#365CC8] font-bold text-[14px]"
                    : "text-[#D0D7E8] text-[12px] font-medium tracking-wide",
                )}
              >
                {value || "터치해서 주관식 답안 입력"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
