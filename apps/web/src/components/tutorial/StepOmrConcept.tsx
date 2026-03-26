import {
  OMR_CARD_BASE_HEIGHT,
  OMR_CARD_BASE_WIDTH,
  OmrCard,
} from "@/components/exam/OmrCard";
import type { StudentInfo } from "@/lib/types/exam";
import { TutorialExamPaperIllustration } from "./TutorialExamPaperIllustration";

const MOCK_STUDENT: StudentInfo = {
  name: "권성민",
  school: "배방고등학교",
  grade: 1,
  studentNumber: 21,
  seatNumber: 21,
};

export function StepOmrConcept() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-[60px] px-8">
      {/* 두 일러스트(시험지 + OMR) 나란히 */}
      <div className="flex items-center gap-12">
        <TutorialExamPaperIllustration variant="concept" />

        {/* OMR card (실제 컴포넌트를 스케일다운) */}
        <div className="relative w-[520px] h-[336px] flex items-center justify-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 origin-center"
            style={{
              width: `${OMR_CARD_BASE_WIDTH}px`,
              height: `${OMR_CARD_BASE_HEIGHT}px`,
              transform: "translate(-50%, -50%) scale(0.52)",
            }}
          >
            <OmrCard
              studentInfo={MOCK_STUDENT}
              objectiveAnswers={{}}
              subjectiveAnswers={{}}
              selectedSubjective={null}
              onObjectiveSelect={() => {}}
              onSubjectiveSelect={() => {}}
              disabled={true}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[26px] font-bold text-fg-primary text-center leading-relaxed max-w-2xl">
        실제 시험지 크기에 인쇄된 시험지에 문제를 풀고<br />화면에 표시된 OMR카드에 답을 마킹해요
      </p>
    </div>
  );
}
