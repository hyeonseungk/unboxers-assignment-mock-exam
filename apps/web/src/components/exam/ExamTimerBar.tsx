import { ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface ExamTimerBarProps {
  formattedTime: string;
  percent: number;
  isWarning: boolean;
  examStarted: boolean;
  timeLimitLabel: string;
  onHelpClick: () => void;
}

export function ExamTimerBar({
  formattedTime,
  percent,
  isWarning,
  examStarted,
  timeLimitLabel,
  onHelpClick,
}: ExamTimerBarProps) {
  const variant = isWarning ? "danger" : "default";

  return (
    <footer
      className={cn(
        "shrink-0 px-6 py-3 transition-colors duration-300",
        isWarning ? "bg-error-50" : "bg-surface",
      )}
    >
      {/* 텍스트 행 */}
      <div className="flex items-center justify-between mb-2">
        <p
          className={cn(
            "text-base",
            isWarning ? "text-error-600" : "text-fg-secondary",
          )}
        >
          {examStarted
            ? "시험 종료까지 남은 시간"
            : "시험 시작을 기다리고 있습니다"}
        </p>

        <p
          className={cn(
            "font-mono tabular-nums text-2xl font-bold",
            isWarning
              ? "text-error-600 animate-timer-warning"
              : "text-fg-primary",
          )}
        >
          {examStarted ? formattedTime : "--:--"}
        </p>

        <p
          className={cn(
            "text-base",
            isWarning ? "text-error-500" : "text-fg-muted",
          )}
        >
          시험 시간 {timeLimitLabel}
        </p>

        <button
          type="button"
          onClick={onHelpClick}
          className={cn(
            "text-base font-medium min-h-10 px-4 rounded-lg",
            "select-none touch-manipulation active:scale-[0.98] transition-all duration-150",
            isWarning
              ? "text-error-600 bg-error-100 active:bg-error-200"
              : "text-fg-secondary bg-surface-secondary active:bg-background-secondary",
          )}
        >
          문제가 생겼나요?
        </button>
      </div>

      {/* 프로그레스 바 */}
      <ProgressBar percent={examStarted ? percent : 100} variant={variant} />
    </footer>
  );
}
