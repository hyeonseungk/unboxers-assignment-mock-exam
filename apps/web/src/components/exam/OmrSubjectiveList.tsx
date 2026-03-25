import { cn } from "@/lib/utils/cn";
import {
  SUBJECTIVE_COUNT,
  SUBJECTIVE_DISPLAY_START,
} from "@/lib/constants/exam";
import {
  OMR_BORDER_B,
  OMR_BORDER_R,
  OMR_LINE,
  OMR_NUMBER_STRIP_GRID,
  OMR_PLACEHOLDER,
  OMR_SELECTION_BG,
  OMR_STRIP_BG,
  OMR_TEXT,
  OMR_TITLE_TEXT,
} from "./omrStyles";

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
    <div className="grid h-full w-full grid-rows-[40px_1fr]">
      <div className={cn("flex items-center justify-center", OMR_BORDER_B, OMR_LINE)}>
        <p className={cn(OMR_TITLE_TEXT, OMR_TEXT)}>주 관 식 답 안</p>
      </div>

      <div className="flex min-h-0 flex-col">
        {Array.from({ length: SUBJECTIVE_COUNT }, (_, index) => {
          const displayNumber = SUBJECTIVE_DISPLAY_START + index;
          const value = answers[displayNumber] ?? "";
          const isSelected = selectedQuestion === displayNumber;
          const isLast = index === SUBJECTIVE_COUNT - 1;

          return (
            <button
              key={displayNumber}
              type="button"
              onClick={() => onSelectQuestion(displayNumber)}
              disabled={disabled}
              className={cn(
                "grid min-h-0 flex-1 text-left",
                OMR_NUMBER_STRIP_GRID,
                !isLast && OMR_BORDER_B,
                OMR_LINE,
                disabled && "pointer-events-none",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center",
                  OMR_BORDER_R,
                  OMR_LINE,
                  OMR_STRIP_BG,
                )}
              >
                <span className={cn("text-[12px] font-semibold", OMR_TEXT)}>
                  {displayNumber}
                </span>
              </div>

              <div
                className={cn(
                  "flex items-center justify-center px-4 text-center",
                  isSelected && OMR_SELECTION_BG,
                )}
              >
                <span
                  className={cn(
                    "truncate",
                    value
                      ? `text-[13px] font-semibold ${OMR_TEXT}`
                      : `text-[12px] font-bold ${OMR_PLACEHOLDER}`,
                  )}
                >
                  {value || "터치해서 주관식 답안 입력"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
