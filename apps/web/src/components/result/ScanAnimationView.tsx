import type { ResultPreviewSnapshot } from "@/lib/types/exam";
import { ResultOmrPreview } from "./ResultOmrPreview";

interface ScanAnimationViewProps {
  previewSnapshot: ResultPreviewSnapshot | null;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function ScanAnimationView({
  previewSnapshot,
  errorMessage,
  onRetry,
}: ScanAnimationViewProps) {
  return (
    <div className="flex h-full flex-col items-center bg-[#fcfcfb] px-6 pt-[132px]">
      {previewSnapshot && (
        <ResultOmrPreview
          studentInfo={previewSnapshot.studentInfo}
          objectiveAnswers={previewSnapshot.objectiveAnswers}
          subjectiveAnswers={previewSnapshot.subjectiveAnswers}
          showScanRig
        />
      )}

      <div className="mt-[42px] flex flex-col items-center text-center">
        <p className="text-[23px] font-black leading-[1.16] tracking-[-0.06em] text-[#111111]">
          OMR 카드 스캔중...
        </p>
        <p className="mt-[8px] text-[23px] font-black leading-[1.16] tracking-[-0.06em] text-[#111111]">
          곧 결과가 나와요
        </p>

        <div className="mt-[28px] inline-flex h-[38px] min-w-[174px] items-center justify-center rounded-[12px] bg-white px-6 text-[13px] font-semibold tracking-[-0.03em] text-[#8f8f8f] shadow-[0_12px_26px_rgba(26,26,26,0.06),0_2px_6px_rgba(26,26,26,0.03)]">
          과연 몇 점일까요?
        </div>

        {errorMessage && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
              {errorMessage}
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-[42px] items-center justify-center rounded-[12px] bg-[#2f2f2f] px-5 text-[14px] font-semibold tracking-[-0.03em] text-white transition-transform duration-150 active:scale-[0.98]"
              >
                다시 시도
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
