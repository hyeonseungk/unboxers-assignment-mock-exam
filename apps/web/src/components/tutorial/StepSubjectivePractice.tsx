import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { TutorialSubjectivePracticePreview } from "./TutorialSubjectivePracticePreview";

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
    setPracticeState("selected");
    setInputValue(savedAnswer);
  };

  const handleKeyPress = (key: string) => {
    if (practiceState !== "selected") return;
    setInputValue((prev) => {
      if (prev.length >= 4) return prev;
      if (key === "." && (prev.length === 0 || prev.includes("."))) return prev;
      if ((key === "/" || key === "-") && prev.length > 0) return prev;
      return prev + key;
    });
  };

  const handleBackspace = () => {
    if (practiceState !== "selected") return;
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleComplete = () => {
    if (practiceState !== "selected") return;
    if (!inputValue) return;
    setSavedAnswer(inputValue);
    setPracticeState("completed");
    setInputValue("");
    onStateChange(true);
  };

  const selectedQuestion = practiceState === "selected" ? TARGET_QUESTION : null;

  return (
    <div className="flex h-full flex-col items-center overflow-hidden px-8">
      <div className="flex-1 pt-[10px]">
        <TutorialSubjectivePracticePreview
          targetQuestion={TARGET_QUESTION}
          selectedQuestion={selectedQuestion}
          inputValue={inputValue}
          savedAnswer={savedAnswer}
          onSelectQuestion={handleSelectQ4}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onComplete={handleComplete}
        />
      </div>

      <div className="mt-[18px] shrink-0 pb-[4px] text-center">
        <ChevronUp className="mx-auto size-[18px] stroke-[2.7] text-[#121212]" />
        <p className="mt-[6px] text-[14px] font-semibold tracking-[-0.02em] text-[#343434]">
          {practiceState === "completed"
            ? "좋아요! 다음으로 넘어가볼까요?"
            : "다음으로 넘어가려면 직접 해보세요"}
        </p>

        <div className="mt-[18px] space-y-[2px] text-[31px] font-black leading-[1.23] tracking-[-0.04em] text-[#141414]">
          <p>
            {practiceState === "initial" &&
              "주관식 답안을 입력하려면 입력할 곳을 터치해요"}
            {practiceState === "selected" && "아무 숫자나 입력하고"}
            {practiceState === "completed" && "입력한 답안을 수정하려면"}
          </p>
          <p>
            {practiceState === "initial" && (
              <>
                <span className="text-[#5E86F3]">{TARGET_QUESTION}번 문제</span>의
                답안을 입력해볼까요?
              </>
            )}
            {practiceState === "selected" && (
              <>
                <span className="text-[#5E86F3]">완료</span> 버튼을 눌러서 답안을
                작성해요
              </>
            )}
            {practiceState === "completed" &&
              "해당 문제를 다시 한 번 터치해요"}
          </p>
        </div>
      </div>
    </div>
  );
}
