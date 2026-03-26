import {
  OBJECTIVE_CHOICES,
  OBJECTIVE_COLUMN_COUNT,
  OBJECTIVE_PER_COLUMN,
} from "@/lib/constants/exam";
import { cn } from "@/lib/utils/cn";

interface TutorialObjectiveAnswerPreviewProps {
  answers: Record<number, number>;
  onSelect: (questionNumber: number, choice: number) => void;
  disabled?: boolean;
}

const QUESTION_COLUMNS = Array.from(
  { length: OBJECTIVE_COLUMN_COUNT },
  (_, columnIndex) =>
    Array.from(
      { length: OBJECTIVE_PER_COLUMN },
      (_, rowIndex) => columnIndex * OBJECTIVE_PER_COLUMN + rowIndex + 1,
    ),
);

export function TutorialObjectiveAnswerPreview({
  answers,
  onSelect,
  disabled = false,
}: TutorialObjectiveAnswerPreviewProps) {
  return (
    <div className="flex h-[410px] w-[409px] justify-center">
      <div className="origin-top scale-[0.92]">
        <div className="h-[446px] w-[444px] [filter:drop-shadow(0_8px_22px_rgba(29,33,48,0.12))]">
          <div className="h-full w-full overflow-hidden rounded-b-[28px]">
            <div className="-translate-y-[52px]">
              <div className="flex h-[498px] w-[444px] flex-col bg-[#FCF8EA] p-[12px]">
                <div className="h-[450px] border-x-[1.5px] border-y-[1.5px] border-[#86A6F3]">
                  <div className="flex h-[40px] items-center justify-center border-b-[1.5px] border-[#86A6F3]">
                    <p className="text-[15px] font-bold tracking-[0.45em] text-[#4E6FBE]">
                      객 관 식 답 안
                    </p>
                  </div>

                  <div className="grid h-[408px] min-h-0 grid-cols-3">
                    {QUESTION_COLUMNS.map((questions, columnIndex) => (
                      <ObjectiveColumn
                        key={`tutorial-objective-col-${columnIndex}`}
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

                <PreviewFooterBars />
              </div>
            </div>
          </div>
        </div>
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
    <div
      className={cn(
        "grid min-w-0 grid-cols-[24px_minmax(0,1fr)]",
        hasLeftDivider && "border-l-[1.5px] border-[#86A6F3]",
      )}
    >
      <div className="grid h-full grid-rows-[1fr_11px_1fr] border-r-[1.5px] border-[#86A6F3] bg-[#E6EEFF]">
        <QuestionNumberGroup questions={topQuestions} />
        <div />
        <QuestionNumberGroup questions={bottomQuestions} />
      </div>

      <div className="grid min-w-0 h-full grid-rows-[1fr_11px_1fr]">
        <div className={cn("min-w-0 px-[6px] py-[2px]", highlightTop && "bg-[#EEF6FF]")}>
          <ObjectiveGroup
            questions={topQuestions}
            answers={answers}
            onSelect={onSelect}
            disabled={disabled}
          />
        </div>

        <div className="relative h-[11px]">
          {highlightTop && <div className="absolute inset-x-0 top-0 h-1/2 bg-[#EEF6FF]" />}
          {highlightBottom && (
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#EEF6FF]" />
          )}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            <div className="w-full border-t-[1.5px] border-dashed border-[#86A6F3]" />
          </div>
        </div>

        <div
          className={cn("min-w-0 px-[6px] py-[2px]", highlightBottom && "bg-[#EEF6FF]")}
        >
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

function QuestionNumberGroup({ questions }: { questions: number[] }) {
  return (
    <div className="flex h-full flex-col justify-between px-[1px] py-[2px]">
      {questions.map((questionNumber) => (
        <div
          key={`tutorial-number-strip-${questionNumber}`}
          className="flex h-[36px] items-center justify-center"
        >
          <span className="text-[12px] font-semibold text-[#4E6FBE]">
            {questionNumber}
          </span>
        </div>
      ))}
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
        <div
          key={`tutorial-objective-row-${questionNumber}`}
          className="flex h-[36px] items-center justify-center gap-[4px]"
        >
          {OBJECTIVE_CHOICES.map((choice) => {
            const selected = answers[questionNumber] === choice;

            return (
              <button
                key={`${questionNumber}-${choice}`}
                type="button"
                onClick={() => onSelect(questionNumber, choice)}
                disabled={disabled}
                aria-label={`${questionNumber}번 문제 ${choice}번 선택지`}
                aria-pressed={selected}
                className={cn(
                  "flex h-[36px] w-[17px] items-center justify-center rounded-[999px]",
                  "text-[11px] font-bold text-white transition-all duration-150",
                  "active:scale-95 select-none touch-manipulation",
                  selected
                    ? "bg-[#1A1A1A] shadow-[0_1px_2px_rgba(17,17,17,0.12)]"
                    : "bg-[#A9A9A9]",
                  disabled && "pointer-events-none",
                )}
              >
                {choice}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function PreviewFooterBars() {
  return (
    <div className="grid grid-cols-3 items-end pt-[2px]">
      {Array.from({ length: 3 }, (_, columnIndex) => (
        <div
          key={`tutorial-footer-col-${columnIndex}`}
          className={cn(
            "grid min-w-0 grid-cols-[24px_minmax(0,1fr)]",
            columnIndex > 0 && "border-l-[1.5px] border-transparent",
          )}
        >
          <div />
          <div className="px-[6px]">
            <div className="flex items-end justify-center gap-[4px]">
              {OBJECTIVE_CHOICES.map((choice) => (
                <div
                  key={`tutorial-footer-bar-${columnIndex}-${choice}`}
                  className="flex w-[17px] justify-center"
                >
                  <span className="h-[22px] w-[6px] rounded-[1px] bg-[#111111]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
