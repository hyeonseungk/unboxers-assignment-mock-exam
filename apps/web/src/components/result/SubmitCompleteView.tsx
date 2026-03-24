import { useExamStore } from "@/stores/useExamStore";
import { OmrCard } from "@/components/exam/OmrCard";
import { Button } from "@/components/ui";

interface SubmitCompleteViewProps {
  onShowResult: () => void;
}

const noop = () => {};

export function SubmitCompleteView({ onShowResult }: SubmitCompleteViewProps) {
  const studentInfo = useExamStore((s) => s.studentInfo);
  const objectiveAnswers = useExamStore((s) => s.objectiveAnswers);
  const subjectiveAnswers = useExamStore((s) => s.subjectiveAnswers);

  return (
    <div className="h-full flex flex-col items-center pt-8 px-6">
      {/* OMR Card (blurred background) */}
      {studentInfo && (
        <div className="w-full max-w-[840px] h-[340px] shrink-0 opacity-40 blur-[2px] pointer-events-none select-none">
          <OmrCard
            studentInfo={studentInfo}
            objectiveAnswers={objectiveAnswers}
            subjectiveAnswers={subjectiveAnswers}
            selectedSubjective={null}
            onObjectiveSelect={noop}
            onSubjectiveSelect={noop}
            disabled
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-fg-primary">제출 완료!</p>
          <p className="text-xl text-fg-secondary mt-3">
            고생 많았어요. 결과를 바로 확인해볼까요?
          </p>
        </div>
        <Button variant="dark" size="lg" onClick={onShowResult}>
          결과 보기
        </Button>
      </div>
    </div>
  );
}
