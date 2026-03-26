import type { ReactNode } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  SUBJECTIVE_COUNT,
  SUBJECTIVE_DISPLAY_START,
} from "@/lib/constants/exam";

const TOP_ROW_KEYS = [".", "/", "-"] as const;
const NUMBER_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

interface TutorialSubjectivePracticePreviewProps {
  targetQuestion: number;
  selectedQuestion: number | null;
  inputValue: string;
  savedAnswer: string;
  onSelectQuestion: (displayNumber: number) => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onComplete: () => void;
}

export function TutorialSubjectivePracticePreview({
  targetQuestion,
  selectedQuestion,
  inputValue,
  savedAnswer,
  onSelectQuestion,
  onKeyPress,
  onBackspace,
  onComplete,
}: TutorialSubjectivePracticePreviewProps) {
  return (
    <div className="flex items-start gap-[24px]">
      <TutorialSubjectiveOmrPreview
        targetQuestion={targetQuestion}
        selectedQuestion={selectedQuestion}
        inputValue={inputValue}
        savedAnswer={savedAnswer}
        onSelectQuestion={onSelectQuestion}
      />

      <div className="pt-[105px]">
        <TutorialSubjectiveKeypadPreview
          selectedQuestion={selectedQuestion}
          value={inputValue}
          onKeyPress={onKeyPress}
          onBackspace={onBackspace}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}

function TutorialSubjectiveOmrPreview({
  targetQuestion,
  selectedQuestion,
  inputValue,
  savedAnswer,
  onSelectQuestion,
}: Omit<TutorialSubjectivePracticePreviewProps, "onKeyPress" | "onBackspace" | "onComplete">) {
  return (
    <div className="w-[294px] shrink-0 [filter:drop-shadow(0_10px_26px_rgba(29,33,48,0.12))]">
      <div className="overflow-hidden rounded-b-[24px] bg-[#FCF8EA] px-[8px] pb-[6px]">
        <div className="overflow-hidden border-l-[1.5px] border-r-[1.5px] border-t-[1.5px] border-[#86A6F3]">
          {Array.from({ length: SUBJECTIVE_COUNT }, (_, index) => {
            const displayNumber = SUBJECTIVE_DISPLAY_START + index;
            const isTarget = displayNumber === targetQuestion;
            const isSelected = isTarget && selectedQuestion === targetQuestion;
            const hasSavedAnswer = isTarget && Boolean(savedAnswer);
            const isHighlighted = isTarget && (isSelected || !hasSavedAnswer);

            let content = "터치해서 주관식 답안 입력";
            let contentClassName = "text-[11px] font-bold text-[#D6CEC2]";

            if (isTarget) {
              if (isSelected) {
                content = inputValue || "답안을 입력하세요";
                contentClassName = inputValue
                  ? "text-[14px] font-semibold text-[#2B303B]"
                  : "text-[12px] font-semibold text-[#C7C2B7]";
              } else if (hasSavedAnswer) {
                content = savedAnswer;
                contentClassName = "text-[14px] font-semibold text-[#2B303B]";
              } else {
                content = "여기를 터치해주세요!";
                contentClassName = "text-[12px] font-semibold text-[#C7C2B7]";
              }
            }

            return (
              <button
                key={displayNumber}
                type="button"
                onClick={() => isTarget && onSelectQuestion(displayNumber)}
                disabled={!isTarget}
                className={cn(
                  "grid h-[34px] w-full grid-cols-[28px_minmax(0,1fr)] border-b-[1.5px] border-[#86A6F3] text-left",
                  !isTarget && "cursor-default",
                )}
              >
                <div className="flex items-center justify-center border-r-[1.5px] border-[#86A6F3] bg-[#E6EEFF]">
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      isTarget ? "text-[#5E86F3]" : "text-[#4E6FBE]",
                    )}
                  >
                    {displayNumber}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-center px-3 text-center",
                    isHighlighted &&
                      "bg-[#FFFDF7] shadow-[inset_0_0_0_1.5px_#5E86F3]",
                  )}
                >
                  <span className={cn("truncate", contentClassName)}>{content}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pt-[1px]">
          <p className="text-[11px] font-semibold tracking-[-0.02em] text-[#7B7870]">
            주관식 입력 부분입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function TutorialSubjectiveKeypadPreview({
  selectedQuestion,
  value,
  onKeyPress,
  onBackspace,
  onComplete,
}: Pick<
  TutorialSubjectivePracticePreviewProps,
  "selectedQuestion" | "onKeyPress" | "onBackspace" | "onComplete"
> & {
  value: string;
}) {
  const isCompleteEnabled = Boolean(selectedQuestion && value);

  return (
    <div className="w-[174px] shrink-0">
      <div
        className={cn(
          "flex h-[36px] items-center justify-center rounded-[12px] bg-white px-4",
          "shadow-[0_10px_20px_rgba(17,24,39,0.08),0_2px_6px_rgba(17,24,39,0.05)]",
          selectedQuestion ? "border-[1.5px] border-[#5E86F3]" : "border-[1.5px] border-transparent",
        )}
      >
        {value ? (
          <span className="text-[14px] font-semibold text-[#252525]">{value}</span>
        ) : (
          <span className="text-[11px] font-semibold text-[#C6C2BA]">
            {selectedQuestion
              ? `${selectedQuestion}번 답안을 입력하세요`
              : "입력할 곳을 터치해주세요"}
          </span>
        )}
      </div>

      <div className="mt-[10px] grid grid-cols-3 gap-[8px]">
        {TOP_ROW_KEYS.map((key) => (
          <KeypadButton key={key} label={key} onClick={() => onKeyPress(key)} />
        ))}

        {NUMBER_KEYS.map((key) => (
          <KeypadButton key={key} label={key} onClick={() => onKeyPress(key)} />
        ))}

        <KeypadButton
          label="0"
          onClick={() => onKeyPress("0")}
          className="col-span-2"
        />
        <KeypadButton
          label={<Delete className="size-[18px] stroke-[2.2]" />}
          onClick={onBackspace}
        />
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={!isCompleteEnabled}
        className={cn(
          "mt-[12px] flex h-[36px] w-full items-center justify-center rounded-[12px] text-[13px] font-bold",
          "transition-all duration-100",
          isCompleteEnabled
            ? "bg-[linear-gradient(90deg,#6F90FF_0%,#5E86F3_46%,#4D6FC2_100%)] text-white shadow-[0_12px_22px_rgba(77,111,194,0.28)]"
            : "bg-white text-[#D0CBC2] shadow-[0_10px_20px_rgba(17,24,39,0.04),0_2px_6px_rgba(17,24,39,0.03)]",
        )}
      >
        완료
      </button>
    </div>
  );
}

function KeypadButton({
  label,
  onClick,
  className,
}: {
  label: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[36px] items-center justify-center rounded-[12px] bg-white",
        "text-[17px] font-bold text-[#202020]",
        "shadow-[0_10px_20px_rgba(17,24,39,0.08),0_2px_6px_rgba(17,24,39,0.05)]",
        "active:scale-[0.98] transition-transform duration-75",
        className,
      )}
    >
      {label}
    </button>
  );
}
