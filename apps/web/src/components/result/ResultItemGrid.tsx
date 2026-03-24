import { Card } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { ExamResultItem, GradeResult } from "@/lib/types/exam";

const OBJECTIVE_COUNT = 14;
const SUBJECTIVE_COUNT = 11;
const SUBJECTIVE_DISPLAY_START = 15;

interface ResultItemGridProps {
  results: ExamResultItem[];
}

function buildResultMap(results: ExamResultItem[]) {
  const map = new Map<string, GradeResult>();
  for (const r of results) {
    map.set(`${r.answerType}-${r.number}`, r.result);
  }
  return map;
}

const cellStyles: Record<GradeResult, string> = {
  correct: "bg-exam-correct text-white",
  wrong: "bg-exam-wrong text-white",
  unanswered: "bg-surface-secondary text-fg-muted border border-line",
};

const resultLabels: Record<GradeResult, string> = {
  correct: "O",
  wrong: "X",
  unanswered: "\u2014",
};

const resultA11yLabels: Record<GradeResult, string> = {
  correct: "정답",
  wrong: "오답",
  unanswered: "미답",
};

function QuestionCell({
  displayNumber,
  result,
  delay,
}: {
  displayNumber: number;
  result: GradeResult;
  delay: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "w-14 h-14 rounded-xl text-base font-semibold",
        "animate-fade-in-up",
        cellStyles[result],
      )}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`${displayNumber}번: ${resultA11yLabels[result]}`}
    >
      <span className="text-base leading-none">{displayNumber}</span>
      <span className="text-base leading-none mt-0.5">
        {resultLabels[result]}
      </span>
    </div>
  );
}

export function ResultItemGrid({ results }: ResultItemGridProps) {
  const resultMap = buildResultMap(results);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Objective */}
      <Card>
        <p className="text-lg font-bold text-fg-primary mb-4">
          객관식{" "}
          <span className="text-fg-muted font-normal">
            ({OBJECTIVE_COUNT}문항)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: OBJECTIVE_COUNT }, (_, i) => {
            const qNum = i + 1;
            const result =
              resultMap.get(`objective-${qNum}`) ?? "unanswered";
            return (
              <QuestionCell
                key={`obj-${qNum}`}
                displayNumber={qNum}
                result={result}
                delay={i * 50}
              />
            );
          })}
        </div>
      </Card>

      {/* Subjective */}
      <Card>
        <p className="text-lg font-bold text-fg-primary mb-4">
          주관식{" "}
          <span className="text-fg-muted font-normal">
            ({SUBJECTIVE_COUNT}문항)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: SUBJECTIVE_COUNT }, (_, i) => {
            const serverNum = i + 1;
            const displayNum = SUBJECTIVE_DISPLAY_START + i;
            const result =
              resultMap.get(`subjective-${serverNum}`) ?? "unanswered";
            return (
              <QuestionCell
                key={`subj-${serverNum}`}
                displayNumber={displayNum}
                result={result}
                delay={(OBJECTIVE_COUNT + i) * 50}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}
