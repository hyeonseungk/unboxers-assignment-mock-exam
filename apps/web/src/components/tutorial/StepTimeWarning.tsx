import { ProgressBar } from "@/components/ui";

export function StepTimeWarning() {
  return (
    <div className="h-full flex flex-col bg-error-50">
      {/* Timer bar mockup */}
      <div className="shrink-0 px-8 pt-8">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base text-fg-secondary">
                시험 종료까지 남은 시간
              </p>
              <p className="text-4xl font-bold text-timer-danger font-mono tabular-nums mt-1">
                5초
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-base text-fg-muted">시험 시간 60분</p>
              <button
                type="button"
                className="text-base text-fg-secondary border border-line rounded-xl px-4 py-2 select-none touch-manipulation active:bg-background-secondary transition-colors"
              >
                문제가 생겼나요?
              </button>
            </div>
          </div>
          <ProgressBar percent={8} variant="danger" className="mt-4" />
        </div>
      </div>

      {/* Warning text */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
        <p className="text-2xl font-bold text-fg-primary leading-relaxed">
          시간이 모두 지나면 시험은 종료되고
          <br />
          OMR카드는 자동으로 제출돼요
        </p>
        <p className="text-xl font-semibold text-timer-danger">
          마킹하지 못한 답안은 모두 오답 처리되니 미리 마킹하세요
        </p>
      </div>
    </div>
  );
}
