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
  const statusLabel = examStarted
    ? "시험 종료까지 남은 시간"
    : "시험 시작을 기다리고 있습니다";
  const displayedTime = examStarted ? formattedTime : "--:--";

  return (
    <footer
      className={cn(
        "shrink-0 px-6 pb-5 pt-4 transition-colors duration-300",
        isWarning ? "bg-error-50" : "bg-surface",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[14px] font-semibold tracking-[-0.02em] sm:text-[15px]",
                  isWarning ? "text-error-600" : "text-[#5a5a5a]",
                )}
              >
                {statusLabel}
              </p>
              <p
                className={cn(
                  "mt-1 font-mono tabular-nums text-[36px] font-bold leading-none tracking-[-0.05em] sm:text-[44px]",
                  isWarning
                    ? "text-error-600 animate-timer-warning"
                    : "text-[#2a2a2a]",
                )}
              >
                {displayedTime}
              </p>
            </div>

            <p
              className={cn(
                "shrink-0 pt-1 text-[14px] font-semibold tracking-[-0.02em] text-right sm:text-[15px]",
                isWarning ? "text-error-500" : "text-[#717171]",
              )}
            >
              시험 시간 {timeLimitLabel}
            </p>
          </div>

          <ProgressBar
            percent={examStarted ? percent : 100}
            variant={variant}
            className={cn(
              "mt-[10px] h-[6px] rounded-full",
              isWarning ? "bg-[#ffd9d5]" : "bg-[#e7e7e7]",
            )}
          />
        </div>

        <button
          type="button"
          onClick={onHelpClick}
          className={cn(
            "inline-flex h-[42px] shrink-0 items-center gap-2.5 rounded-[14px] px-[14px]",
            "border border-[#f2ede4] bg-[#fdfbf7] text-[14px] font-semibold tracking-[-0.02em] text-[#1b1b1b]",
            "shadow-[0_10px_24px_rgba(18,18,18,0.08),0_2px_6px_rgba(18,18,18,0.05)]",
            "select-none touch-manipulation transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98]",
            "active:bg-[#f8f4ec] active:shadow-[0_8px_20px_rgba(18,18,18,0.06),0_2px_6px_rgba(18,18,18,0.04)]",
          )}
        >
          <HelpButtonIcon />
          <span className="leading-none whitespace-nowrap">문제가 생겼나요?</span>
        </button>
      </div>
    </footer>
  );
}

function HelpButtonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px] shrink-0"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.6 3.5h10.8c2.265 0 4.1 1.836 4.1 4.1v6.32c0 2.264-1.835 4.1-4.1 4.1h-4.526l-4.245 3.314c-.76.593-1.88.05-1.88-.914V18.02H6.6c-2.264 0-4.1-1.836-4.1-4.1V7.6c0-2.264 1.836-4.1 4.1-4.1Z"
        fill="#171717"
      />
      <circle cx="9.05" cy="10.81" r="1.06" fill="white" />
      <circle cx="12" cy="10.81" r="1.06" fill="white" />
      <circle cx="14.95" cy="10.81" r="1.06" fill="white" />
    </svg>
  );
}
