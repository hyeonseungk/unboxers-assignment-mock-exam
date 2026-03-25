import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronUp } from "lucide-react";
import {
  OBJECTIVE_CHOICES,
  OBJECTIVE_COLUMN_COUNT,
  OBJECTIVE_PER_COLUMN,
} from "@/lib/constants/exam";

type PracticeState = "initial" | "marked" | "completed";

interface StepObjectivePracticeProps {
  onStateChange: (canGoNext: boolean) => void;
}

const QUESTION_COLUMNS = Array.from(
  { length: OBJECTIVE_COLUMN_COUNT },
  (_, columnIndex) =>
    Array.from(
      { length: OBJECTIVE_PER_COLUMN },
      (_, rowIndex) => columnIndex * OBJECTIVE_PER_COLUMN + rowIndex + 1,
    ),
);

export function StepObjectivePractice({
  onStateChange,
}: StepObjectivePracticeProps) {
  const [selections, setSelections] = useState<Record<number, number | null>>(
    {},
  );
  const [practiceState, setPracticeState] = useState<PracticeState>("initial");

  const handleBubbleClick = (question: number, answer: number) => {
    const isCurrentlySelected = selections[question] === answer;

    setSelections((prev) => ({
      ...prev,
      [question]: isCurrentlySelected ? null : answer,
    }));

    if (question === 15 && answer === 3) {
      if (practiceState === "initial" && !isCurrentlySelected) {
        setPracticeState("marked");
      } else if (practiceState === "marked" && isCurrentlySelected) {
        setPracticeState("completed");
        onStateChange(true);
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center">
      <div className="flex-1 flex items-start justify-center pt-4 px-8 overflow-y-auto">
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <div className="flex gap-6">
            {QUESTION_COLUMNS.map((questions, index) => (
              <div key={`tutorial-col-${index}`} className="flex items-start">
                <OmrColumn
                  questions={questions}
                  selections={selections}
                  onBubbleClick={handleBubbleClick}
                />
                {index < QUESTION_COLUMNS.length - 1 && (
                  <div className="w-px bg-line ml-6 h-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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
            "객관식 답안은 화면을 터치해서 마킹해요"}
          {practiceState === "marked" &&
            "마킹한 곳을 한 번 더 터치하면 지울 수 있어요"}
          {practiceState === "completed" &&
            "2개 이상의 답안을 골라야 하는 문제에서는"}
        </p>
        <p className="text-xl font-bold text-fg-primary">
          {practiceState === "initial" && (
            <>
              <span className="text-accent">15번</span> 문제에{" "}
              <span className="text-accent">3번</span>으로 답안을 마킹해보세요
            </>
          )}
          {practiceState === "marked" && (
            <>
              <span className="text-accent">15번</span> 문제에{" "}
              <span className="text-accent">3번</span> 답안을 지워보세요
            </>
          )}
          {practiceState === "completed" && "두 답안 모두 마킹하면 돼요"}
        </p>
      </div>
    </div>
  );
}

function OmrColumn({
  questions,
  selections,
  onBubbleClick,
}: {
  questions: number[];
  selections: Record<number, number | null>;
  onBubbleClick: (question: number, answer: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 pb-2 border-b border-line mb-1">
        <div className="w-9 text-center text-base font-semibold text-fg-muted">
          번호
        </div>
        {OBJECTIVE_CHOICES.map((n) => (
          <div
            key={n}
            className="w-10 text-center text-base font-semibold text-fg-muted"
          >
            {n}
          </div>
        ))}
      </div>

      {questions.map((q) => (
        <div key={q} className="flex items-center gap-1 py-[3px]">
          <div className="w-9 text-center text-base font-medium text-fg-primary">
            {q}
          </div>
          {OBJECTIVE_CHOICES.map((a) => {
            const isSelected = selections[q] === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => onBubbleClick(q, a)}
                aria-label={`${q}번 문제 ${a}번 선택지`}
                aria-pressed={isSelected}
                className={cn(
                  "w-10 h-7 rounded-full border",
                  "transition-all duration-100",
                  "active:scale-90",
                  "select-none touch-manipulation",
                  isSelected
                    ? "bg-omr-selected border-omr-selected-border"
                    : "bg-omr-default border-omr-default-border",
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
