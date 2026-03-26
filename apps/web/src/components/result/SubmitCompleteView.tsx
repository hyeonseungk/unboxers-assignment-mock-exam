import type { ResultPreviewSnapshot } from "@/lib/types/exam";
import { ResultOmrPreview } from "./ResultOmrPreview";

interface SubmitCompleteViewProps {
  previewSnapshot: ResultPreviewSnapshot | null;
  onShowResult: () => void;
}

export function SubmitCompleteView({
  previewSnapshot,
  onShowResult,
}: SubmitCompleteViewProps) {
  return (
    <div className="relative h-full overflow-hidden bg-[#fcfcfb]">
      <div className="flex h-full flex-col items-center px-6 pt-[132px]">
        {previewSnapshot && (
          <ResultOmrPreview
            studentInfo={previewSnapshot.studentInfo}
            objectiveAnswers={previewSnapshot.objectiveAnswers}
            subjectiveAnswers={previewSnapshot.subjectiveAnswers}
            muted
            scale={0.64}
          />
        )}

        <div className="mt-[42px] flex flex-col items-center text-center">
          <p className="text-[23px] font-black leading-[1.16] tracking-[-0.06em] text-[#111111]">
            제출 완료!
          </p>
          <p className="mt-[8px] text-[23px] font-black leading-[1.16] tracking-[-0.06em] text-[#111111]">
            고생 많았어요. 결과를 바로 확인해볼까요?
          </p>
          <button
            type="button"
            onClick={onShowResult}
            className="mt-[56px] inline-flex h-[52px] min-w-[174px] items-center justify-center rounded-[14px]
                       bg-[linear-gradient(180deg,#5b5b5b_0%,#434343_100%)] px-7
                       text-[15px] font-semibold tracking-[-0.03em] text-white
                       shadow-[0_14px_28px_rgba(31,31,31,0.14),0_3px_8px_rgba(31,31,31,0.08)]
                       transition-transform duration-150 active:scale-[0.98]"
          >
            결과 보기
          </button>
        </div>
      </div>
    </div>
  );
}
