import type { ComponentType } from "react";
import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ExamResultItem, GradeResult } from "@/lib/types/exam";
import {
  OBJECTIVE_COUNT,
  SUBJECTIVE_COUNT,
  SUBJECTIVE_DISPLAY_START,
} from "@/lib/constants/exam";

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

const resultA11yLabels: Record<GradeResult, string> = {
  correct: "정답",
  wrong: "오답",
  unanswered: "미답",
};

const resultStyles: Record<
  GradeResult,
  {
    icon: ComponentType<{ className?: string }>;
    cellClassName: string;
    iconWrapClassName: string;
    valueClassName: string;
    numberClassName: string;
  }
> = {
  correct: {
    icon: Check,
    cellClassName: "border-[#c9eadc] bg-[#f4fcf8]",
    iconWrapClassName: "border-[#bfe6d5] bg-white text-[#148e64]",
    valueClassName: "text-[#117f59]",
    numberClassName: "text-[#6b8c80]",
  },
  wrong: {
    icon: X,
    cellClassName: "border-[#f1d2ce] bg-[#fff7f6]",
    iconWrapClassName: "border-[#efcfca] bg-white text-[#ce5349]",
    valueClassName: "text-[#bb473d]",
    numberClassName: "text-[#9e7b77]",
  },
  unanswered: {
    icon: Minus,
    cellClassName: "border-[#eee3d5] bg-[#fbf8f2]",
    iconWrapClassName: "border-[#eadfce] bg-white text-[#918370]",
    valueClassName: "text-[#837866]",
    numberClassName: "text-[#938876]",
  },
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
  const { icon: Icon, cellClassName, iconWrapClassName, numberClassName } =
    resultStyles[result];

  return (
    <div
      className={cn(
        "flex h-[92px] flex-col justify-between rounded-[20px] border px-3 py-3 shadow-[0_10px_24px_rgba(17,17,17,0.04)]",
        "animate-fade-in-up",
        cellClassName,
      )}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`${displayNumber}번: ${resultA11yLabels[result]}`}
    >
      <span
        className={cn(
          "whitespace-nowrap text-[13px] font-semibold leading-none tabular-nums",
          numberClassName,
        )}
      >
        {displayNumber}번
      </span>
      <div className="flex justify-start">
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-full border",
            iconWrapClassName,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  );
}

export function ResultItemGrid({ results }: ResultItemGridProps) {
  const resultMap = buildResultMap(results);
  const objectiveItems = Array.from({ length: OBJECTIVE_COUNT }, (_, i) => {
    const qNum = i + 1;
    return {
      displayNumber: qNum,
      result: resultMap.get(`objective-${qNum}`) ?? "unanswered",
    };
  });
  const subjectiveItems = Array.from({ length: SUBJECTIVE_COUNT }, (_, i) => {
    const serverNum = i + 1;
    const displayNum = SUBJECTIVE_DISPLAY_START + i;
    return {
      displayNumber: displayNum,
      result: resultMap.get(`subjective-${serverNum}`) ?? "unanswered",
    };
  });
  const totalCounts = [...objectiveItems, ...subjectiveItems].reduce(
    (acc, item) => {
      acc[item.result] += 1;
      return acc;
    },
    { correct: 0, wrong: 0, unanswered: 0 },
  );

  return (
    <section className="rounded-[34px] border border-[#ebe4d9] bg-white/92 p-5 shadow-[0_18px_44px_rgba(23,23,23,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[28px] font-black leading-[1.15] tracking-[-0.05em] text-[#111111]">
            문항별 채점 결과
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#67635b]">
            객관식과 주관식 채점 결과를 번호별로 빠르게 확인할 수 있어요.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["correct", "wrong", "unanswered"] as const).map((result) => (
            <LegendPill key={result} result={result} value={totalCounts[result]} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <ResultBoard
          title="객관식"
          subtitle={`${OBJECTIVE_COUNT}문항`}
          items={objectiveItems}
          baseDelay={0}
          gridClassName="grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10"
        />
        <ResultBoard
          title="주관식"
          subtitle={`${SUBJECTIVE_COUNT}문항`}
          items={subjectiveItems}
          baseDelay={OBJECTIVE_COUNT * 28}
          gridClassName="grid-cols-3 sm:grid-cols-4 xl:grid-cols-4"
        />
      </div>
    </section>
  );
}

function ResultBoard({
  title,
  subtitle,
  items,
  baseDelay,
  gridClassName,
}: {
  title: string;
  subtitle: string;
  items: Array<{ displayNumber: number; result: GradeResult }>;
  baseDelay: number;
  gridClassName: string;
}) {
  const counts = items.reduce(
    (acc, item) => {
      acc[item.result] += 1;
      return acc;
    },
    { correct: 0, wrong: 0, unanswered: 0 },
  );

  return (
    <div className="rounded-[28px] border border-[#eee6da] bg-[linear-gradient(180deg,#fffdfa_0%,#fffaf5_100%)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-[22px] font-black tracking-[-0.04em] text-[#111111]">
            {title}
          </h3>
          <p className="mt-1 text-[14px] font-medium text-[#8b857a]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SummaryPill value={counts.correct} tone="correct" />
          <SummaryPill value={counts.wrong} tone="wrong" />
          <SummaryPill value={counts.unanswered} tone="unanswered" />
        </div>
      </div>

      <div className={cn("mt-5 grid gap-3", gridClassName)}>
        {items.map((item, index) => (
          <QuestionCell
            key={`${title}-${item.displayNumber}`}
            displayNumber={item.displayNumber}
            result={item.result}
            delay={baseDelay + index * 28}
          />
        ))}
      </div>
    </div>
  );
}

function LegendPill({
  result,
  value,
}: {
  result: GradeResult;
  value: number;
}) {
  const { icon: Icon, iconWrapClassName, valueClassName } = resultStyles[result];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-[#ece5da] bg-[#fcfbf8] px-3 py-1.5 text-[13px] font-semibold text-[#625f58]"
      aria-label={`${resultA11yLabels[result]} ${value}개`}
      title={resultA11yLabels[result]}
    >
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full border",
          iconWrapClassName,
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span>{resultA11yLabels[result]}</span>
      <span className={cn("tabular-nums", valueClassName)}>{value}개</span>
    </span>
  );
}

function SummaryPill({
  value,
  tone,
}: {
  value: number;
  tone: GradeResult;
}) {
  const { icon: Icon, iconWrapClassName, valueClassName } = resultStyles[tone];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-[#ece4d7] bg-white/90 px-3 py-1.5 text-[13px] font-semibold text-[#6b665e]"
      aria-label={`${resultA11yLabels[tone]} ${value}개`}
      title={resultA11yLabels[tone]}
    >
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full border",
          iconWrapClassName,
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span className={cn("tabular-nums", valueClassName)}>{value}</span>
    </span>
  );
}
