import { useExamStore } from "@/stores/useExamStore";
import { OmrCard } from "@/components/exam/OmrCard";

const noop = () => {};

export function ScanAnimationView() {
  const studentInfo = useExamStore((s) => s.studentInfo);
  const objectiveAnswers = useExamStore((s) => s.objectiveAnswers);
  const subjectiveAnswers = useExamStore((s) => s.subjectiveAnswers);

  return (
    <div className="h-full flex flex-col items-center pt-8 px-6">
      {/* OMR Card with scan line overlay */}
      {studentInfo && (
        <div className="relative w-full max-w-[840px] h-[340px] shrink-0 pointer-events-none select-none">
          <OmrCard
            studentInfo={studentInfo}
            objectiveAnswers={objectiveAnswers}
            subjectiveAnswers={subjectiveAnswers}
            selectedSubjective={null}
            onObjectiveSelect={noop}
            onSubjectiveSelect={noop}
            disabled
          />

          {/* Scan line overlay */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-y-0 left-0 w-full animate-scan-line will-change-transform">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-error-600" />
              <div className="absolute -left-2 top-0 bottom-0 w-5 bg-gradient-to-r from-transparent via-error-500/20 to-transparent" />
              <div className="absolute left-1.5 top-0 bottom-0 w-px bg-error-500/40" />
            </div>
          </div>
        </div>
      )}

      {/* Text */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-fg-primary">
          OMR 카드 스캔중...
        </p>
        <p className="text-xl text-fg-secondary mt-2">곧 결과가 나와요</p>

        <p className="text-lg text-fg-muted mt-8">과연 몇 점일까요?</p>
      </div>
    </div>
  );
}
