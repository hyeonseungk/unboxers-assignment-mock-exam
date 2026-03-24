import { memo } from "react";
import { OmrBubble } from "@/components/ui";

const OBJECTIVE_COUNT = 14;
const CHOICES = [1, 2, 3, 4, 5] as const;

interface OmrObjectiveGridProps {
  answers: Record<number, number>;
  onSelect: (questionNumber: number, choice: number) => void;
  disabled?: boolean;
}

export function OmrObjectiveGrid({
  answers,
  onSelect,
  disabled = false,
}: OmrObjectiveGridProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-line-secondary pb-2 mb-3">
        <p className="text-base font-bold text-fg-primary text-center">
          객관식 답안
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* 헤더 행 */}
        <div className="flex items-center gap-1">
          <span className="w-8 text-center text-base text-fg-muted shrink-0">
            번호
          </span>
          {CHOICES.map((c) => (
            <span
              key={c}
              className="w-12 text-center text-base text-fg-muted"
            >
              {c}
            </span>
          ))}
        </div>

        {/* 문항 행 */}
        {Array.from({ length: OBJECTIVE_COUNT }, (_, i) => i + 1).map(
          (qNum) => (
            <ObjectiveRow
              key={qNum}
              questionNumber={qNum}
              selectedChoice={answers[qNum]}
              onSelect={onSelect}
              disabled={disabled}
            />
          ),
        )}
      </div>
    </div>
  );
}

const ObjectiveRow = memo(function ObjectiveRow({
  questionNumber,
  selectedChoice,
  onSelect,
  disabled,
}: {
  questionNumber: number;
  selectedChoice: number | undefined;
  onSelect: (qNum: number, choice: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-8 text-center text-base font-medium text-fg-primary shrink-0">
        {questionNumber}
      </span>
      {CHOICES.map((choice) => (
        <OmrBubble
          key={choice}
          number={choice}
          selected={selectedChoice === choice}
          onSelect={() => onSelect(questionNumber, choice)}
          disabled={disabled}
        />
      ))}
    </div>
  );
});
