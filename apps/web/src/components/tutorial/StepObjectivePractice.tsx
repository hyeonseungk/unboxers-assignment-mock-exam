import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { TutorialObjectiveAnswerPreview } from "./TutorialObjectiveAnswerPreview";

type PracticeState = "initial" | "marked" | "completed";

interface StepObjectivePracticeProps {
  onStateChange: (canGoNext: boolean) => void;
}

export function StepObjectivePractice({
  onStateChange,
}: StepObjectivePracticeProps) {
  const [practiceState, setPracticeState] = useState<PracticeState>("initial");

  const handleBubbleClick = (question: number, answer: number) => {
    if (practiceState === "completed") return;
    if (question !== 15 || answer !== 3) return;

    if (practiceState === "initial") {
      setPracticeState("marked");
      return;
    }

    setPracticeState("completed");
    onStateChange(true);
  };

  const displayedAnswers: Record<number, number> =
    practiceState === "initial"
      ? {}
      : practiceState === "marked"
        ? { 15: 3 }
        : {};

  const guideText =
    practiceState === "completed"
      ? "좋아요! 다음으로 넘어가볼까요?"
      : "다음으로 넘어가려면 직접 해보세요";

  return (
    <div className="flex h-full flex-col items-center overflow-hidden px-8">
      <div className="shrink-0">
        <TutorialObjectiveAnswerPreview
          answers={displayedAnswers}
          onSelect={handleBubbleClick}
          disabled={practiceState === "completed"}
        />
      </div>

      <div className="mt-[20px] shrink-0 text-center">
        <ChevronUp className="mx-auto size-[18px] stroke-[2.7] text-[#121212]" />
        <p className="mt-[6px] text-[14px] font-semibold tracking-[-0.02em] text-[#343434]">
          {guideText}
        </p>

        <div className="mt-[18px] space-y-[2px] text-[31px] font-black leading-[1.23] tracking-[-0.04em] text-[#141414]">
          <p>
            {practiceState === "initial" &&
              "객관식 답안은 화면을 터치해서 마킹해요"}
            {practiceState === "marked" &&
              "마킹한 곳을 한 번 더 터치하면 지울 수 있어요"}
            {practiceState === "completed" &&
              "2개 이상의 답안을 골라야 하는 문제에서는"}
          </p>
          <p>
            {practiceState === "initial" && (
              <>
                <span className="text-[#5E86F3]">15번 문제</span>에{" "}
                <span className="text-[#5E86F3]">3번</span>으로 답안을 마킹해보세요
              </>
            )}
            {practiceState === "marked" && (
              <>
                <span className="text-[#5E86F3]">15번 문제</span>에{" "}
                <span className="text-[#5E86F3]">3번</span> 답안을 지워보세요
              </>
            )}
            {practiceState === "completed" && "두 답안 모두 마킹하면 돼요"}
          </p>
        </div>
      </div>
    </div>
  );
}
