import { memo } from "react";
import { OmrBubble } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  OBJECTIVE_CHOICES,
  OBJECTIVE_COLUMN_COUNT,
  OBJECTIVE_PER_COLUMN,
} from "@/lib/constants/exam";
import {
  OMR_BORDER_B,
  OMR_BORDER_L,
  OMR_BORDER_R,
  OMR_BORDER_T,
  OMR_BUBBLE_COLUMN_GAP,
  OMR_LINE,
  OMR_NUMBER_STRIP_GRID,
  OMR_SECTION_BG,
  OMR_STRIP_BG,
  OMR_TEXT,
  OMR_TITLE_TEXT,
} from "./omrStyles";

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
    <div className="grid h-full w-full grid-rows-[40px_1fr]">
      <div className={cn("flex items-center justify-center", OMR_BORDER_B, OMR_LINE)}>
        <p className={cn(OMR_TITLE_TEXT, OMR_TEXT)}>객 관 식 답 안</p>
      </div>

      <div className="grid min-h-0 grid-cols-3">
        {columns.map((questions, columnIndex) => (
          <ObjectiveColumn
            key={`objective-col-${columnIndex}`}
            questions={questions}
            answers={answers}
            onSelect={onSelect}
            disabled={disabled}
            hasLeftDivider={columnIndex > 0}
            highlightTop={columnIndex === 1}
            highlightBottom={columnIndex !== 1}
          />
        ))}
      </div>
    </div>
  );
}

function ObjectiveColumn({
  questions,
  answers,
  onSelect,
  disabled,
  hasLeftDivider,
  highlightTop,
  highlightBottom,
}: {
  questions: number[];
  answers: Record<number, number>;
  onSelect: (questionNumber: number, choice: number) => void;
  disabled: boolean;
  hasLeftDivider: boolean;
  highlightTop: boolean;
  highlightBottom: boolean;
}) {
  const topQuestions = questions.slice(0, 5);
  const bottomQuestions = questions.slice(5);

  return (
    <div className={cn("grid min-w-0", OMR_NUMBER_STRIP_GRID, hasLeftDivider && OMR_BORDER_L, OMR_LINE)}>
      <div className={cn("grid h-full grid-rows-[1fr_11px_1fr]", OMR_BORDER_R, OMR_LINE, OMR_STRIP_BG)}>
        <QuestionNumberGroup questions={topQuestions} />
        <div />
        <QuestionNumberGroup questions={bottomQuestions} />
      </div>

      <div className="grid min-w-0 h-full grid-rows-[1fr_11px_1fr]">
        <div className={cn("min-w-0 px-[6px] py-[2px]", highlightTop && OMR_SECTION_BG)}>
          <ObjectiveGroup
            questions={topQuestions}
            answers={answers}
            onSelect={onSelect}
            disabled={disabled}
          />
        </div>
        <div className="flex items-center">
          <div className={cn("w-full border-dashed", OMR_BORDER_T, OMR_LINE)} />
        </div>
        <div className={cn("min-w-0 px-[6px] py-[2px]", highlightBottom && OMR_SECTION_BG)}>
          <ObjectiveGroup
            questions={bottomQuestions}
            answers={answers}
            onSelect={onSelect}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

function ObjectiveGroup({
  questions,
  answers,
  onSelect,
  disabled,
}: {
  questions: number[];
  answers: Record<number, number>;
  onSelect: (questionNumber: number, choice: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex h-full flex-col justify-between py-[2px]">
      {questions.map((questionNumber) => (
        <ObjectiveRow
          key={questionNumber}
          questionNumber={questionNumber}
          selectedChoice={answers[questionNumber]}
          choices={OBJECTIVE_CHOICES}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function QuestionNumberGroup({ questions }: { questions: number[] }) {
  return (
    <div className="flex h-full flex-col justify-between px-[1px] py-[2px]">
      {questions.map((questionNumber) => (
        <div
          key={`number-strip-${questionNumber}`}
          className="flex h-[36px] items-center justify-center"
        >
          <span className={cn("text-[12px] font-semibold", OMR_TEXT)}>{questionNumber}</span>
        </div>
      ))}
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
    <div className={cn("flex h-[36px] items-center justify-center", OMR_BUBBLE_COLUMN_GAP)}>
      {choices.map((choice) => (
        <OmrBubble
          key={`${questionNumber}-${choice}`}
          number={choice as 1 | 2 | 3 | 4 | 5}
          selected={selectedChoice === choice}
          onSelect={() => onSelect(questionNumber, choice)}
          disabled={disabled}
        />
      ))}
    </div>
  );
});
