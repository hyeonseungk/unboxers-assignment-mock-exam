import { cn } from "@/lib/utils/cn";

type GradingResult = "correct" | "wrong" | "unanswered";

interface OmrBubbleProps {
  /** 선택지 번호 (1-5) */
  number: 1 | 2 | 3 | 4 | 5;
  /** 선택 여부 */
  selected: boolean;
  /** 선택 핸들러 */
  onSelect: () => void;
  /** 비활성화 (시험 종료 후) */
  disabled?: boolean;
  /** 채점 결과 모드 */
  result?: GradingResult;
  /** 이 번호가 정답인지 (결과 화면에서 정답 표시용) */
  isCorrectAnswer?: boolean;
}

export function OmrBubble({
  number,
  selected,
  onSelect,
  disabled = false,
  result,
  isCorrectAnswer,
}: OmrBubbleProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={`${number}번 선택지`}
      aria-pressed={selected}
      className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center",
        "text-lg font-semibold border-2",
        "transition-all duration-150 select-none touch-manipulation",
        "active:scale-95",

        // 기본 상태 (시험 중, 미선택)
        !selected && !result && [
          "bg-omr-default border-omr-default-border text-fg-secondary",
        ],

        // 선택 상태 (시험 중)
        selected && !result && [
          "bg-omr-selected border-omr-selected-border text-omr-selected-text",
          "shadow-sm",
        ],

        // 채점 결과: 정답 + 내가 선택
        result === "correct" && selected &&
          "bg-exam-correct border-exam-correct text-white",

        // 채점 결과: 오답 (내가 선택했지만 틀림)
        result === "wrong" && selected &&
          "bg-exam-wrong border-exam-wrong text-white",

        // 채점 결과: 미응답 상태 + 정답 표시
        result === "unanswered" && isCorrectAnswer &&
          "bg-exam-correct-light border-exam-correct text-exam-correct",

        // 채점 결과: 오답 상태에서 정답 위치 표시
        result === "wrong" && !selected && isCorrectAnswer &&
          "bg-exam-correct-light border-exam-correct text-exam-correct",

        // 채점 후 비활성 (결과도 아니고 선택도 아닌 버블)
        result && !selected && !isCorrectAnswer &&
          "bg-omr-disabled border-line text-omr-disabled-text",

        // 비활성화
        disabled && "pointer-events-none",
      )}
    >
      {number}
    </button>
  );
}
