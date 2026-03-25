import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { NumberKeypad } from "@/components/NumberKeypad";
import { ChevronUp } from "lucide-react";
import { SUBJECTIVE_COUNT } from "@/lib/constants/exam";

type PracticeState = "initial" | "selected" | "completed";

interface StepSubjectivePracticeProps {
  onStateChange: (canGoNext: boolean) => void;
}

const TARGET_QUESTION = 4;

export function StepSubjectivePractice({
  onStateChange,
}: StepSubjectivePracticeProps) {
  const [practiceState, setPracticeState] = useState<PracticeState>("initial");
  const [inputValue, setInputValue] = useState("");
  const [savedAnswer, setSavedAnswer] = useState("");

  const handleSelectQ4 = () => {
    if (practiceState === "completed") return;
    setPracticeState("selected");
    setInputValue("");
  };

  const handleKeyPress = (key: string) => {
    if (practiceState !== "selected") return;
    setInputValue((prev) => {
      if (prev.length >= 3) return prev;
      return prev + key;
    });
  };

  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleComplete = () => {
    if (!inputValue) return;
    setSavedAnswer(inputValue);
    setPracticeState("completed");
    onStateChange(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Content: List + Keypad */}
      <div className="flex-1 flex justify-center gap-8 px-8 pt-6 overflow-hidden">
        {/* Left: Subjective question list */}
        <div className="w-96 bg-surface border border-line rounded-2xl overflow-y-auto">
          <div className="divide-y divide-line">
            {Array.from({ length: SUBJECTIVE_COUNT }, (_, i) => i + 1).map(
              (num) => {
                const isTarget = num === TARGET_QUESTION;
                const isSelected =
                  isTarget && practiceState === "selected";
                const hasAnswer = isTarget && savedAnswer;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={isTarget ? handleSelectQ4 : undefined}
                    disabled={!isTarget}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-3.5 text-left",
                      "transition-all duration-100",
                      isSelected && "bg-accent-light border-l-4 border-accent",
                      isTarget && !isSelected
                        ? "cursor-pointer active:bg-background-secondary"
                        : "",
                      !isTarget && "opacity-60 cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "text-base font-semibold shrink-0 w-8",
                        isTarget ? "text-accent" : "text-fg-primary",
                      )}
                    >
                      {num}
                    </span>
                    <span
                      className={cn(
                        "text-base flex-1",
                        hasAnswer ? "text-fg-primary font-medium" : "text-fg-muted",
                      )}
                    >
                      {hasAnswer ? savedAnswer : "터치하여 주관식 답안 입력"}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Right: Keypad */}
        <div className="w-72 shrink-0">
          <NumberKeypad
            value={practiceState === "selected" ? inputValue : ""}
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
            onComplete={handleComplete}
            showCompleteButton={practiceState === "selected"}
            disabled={practiceState !== "selected"}
            placeholder={
              practiceState === "selected"
                ? `${TARGET_QUESTION}번 답안을 입력하세요`
                : "답안 입력을 시작하세요"
            }
          />
        </div>
      </div>

      {/* Instruction area */}
      <div className="shrink-0 text-center space-y-2 px-8 pb-4">
        {practiceState !== "completed" ? (
          <>
            <ChevronUp className="size-5 mx-auto text-fg-muted" />
            <p className="text-base text-fg-muted">
              다음으로 넘어가려면 직접 해보세요
            </p>
          </>
        ) : (
          <p className="text-base text-fg-muted">
            좋아요! 다음으로 넘어가볼까요?
          </p>
        )}

        <p className="text-2xl font-bold text-fg-primary">
          {practiceState === "initial" &&
            "주관식 답안을 입력하려면 입력할 곳을 터치해요"}
          {practiceState === "selected" && "아무 숫자나 입력하고"}
          {practiceState === "completed" && "입력한 답안을 수정하려면"}
        </p>
        <p className="text-xl font-bold text-fg-primary">
          {practiceState === "initial" && (
            <>
              <span className="text-accent">{TARGET_QUESTION}번</span> 문제의
              답안을 입력해볼까요?
            </>
          )}
          {practiceState === "selected" && (
            <>
              <span className="text-accent">완료</span> 버튼을 눌러서 답안을
              작성해요
            </>
          )}
          {practiceState === "completed" &&
            "해당 문제를 다시 한 번 터치해요"}
        </p>
      </div>
    </div>
  );
}
