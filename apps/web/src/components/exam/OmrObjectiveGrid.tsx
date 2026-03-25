import { memo } from "react";
import { OmrBubble } from "@/components/ui";
import {
  OBJECTIVE_CHOICES,
  OBJECTIVE_COLUMN_COUNT,
  OBJECTIVE_PER_COLUMN,
} from "@/lib/constants/exam";

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
  const columns = Array.from({ length: OBJECTIVE_COLUMN_COUNT }, (_, index) =>
    Array.from(
      { length: OBJECTIVE_PER_COLUMN },
      (_, rowIndex) => index * OBJECTIVE_PER_COLUMN + rowIndex + 1,
    ),
  );

  return (
    <div className="flex flex-col h-full w-full">
      <div className="pb-[18px]">
        <p className="text-[17px] font-extrabold text-[#111] text-center tracking-[0.3em]">
          객 관 식 답 안
        </p>
      </div>

      <div className="flex flex-1 border-t border-[#C9D6F8] pt-[16px]">
        {columns.map((questions, columnIndex) => (
          <div
            key={`objective-col-${columnIndex}`}
            className="flex flex-col flex-1 px-[10px] min-w-0"
          >
            <div
              className={
                columnIndex < columns.length - 1
                  ? "flex flex-col flex-1 border-r border-[#C9D6F8] pr-[10px]"
                  : "flex flex-col flex-1"
              }
            >
              {questions.map((questionNumber, rowIndex) => (
                <div key={questionNumber} className="flex flex-col">
                  <ObjectiveRow
                    questionNumber={questionNumber}
                    selectedChoice={answers[questionNumber]}
                    choices={OBJECTIVE_CHOICES}
                    onSelect={onSelect}
                    disabled={disabled}
                  />
                  {rowIndex === 4 && (
                    <div className="border-b-[1.5px] border-dotted border-[#C9D6F8] mt-[2px] mb-[8px] mx-[-10px]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ObjectiveRow = memo(function ObjectiveRow({
  questionNumber,
  selectedChoice,
  choices,
  onSelect,
  disabled,
}: {
  questionNumber: number;
  selectedChoice: number | undefined;
  choices: readonly number[];
  onSelect: (qNum: number, choice: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-[6px] mb-[8px]">
      <span className="w-[24px] h-[28px] rounded-[6px] bg-[#EAF2FF] text-center text-[13px] leading-[28px] font-bold text-[#5D7FE6] shrink-0">
        {questionNumber}
      </span>
      {choices.map((choice) => (
        <OmrBubble
          key={choice}
          number={choice as 1 | 2 | 3 | 4 | 5}
          selected={selectedChoice === choice}
          onSelect={() => onSelect(questionNumber, choice)}
          disabled={disabled}
        />
      ))}
    </div>
  );
});
