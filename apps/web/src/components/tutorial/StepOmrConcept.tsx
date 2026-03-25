import { OmrCard } from "@/components/exam/OmrCard";
import type { StudentInfo } from "@/lib/types/exam";

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
        {/* Exam paper (여러 장 겹친 모습) */}
        <div className="relative w-[280px] h-[360px]">
          {/* 뒷장들 */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white border border-line rounded-xl shadow-sm"
              style={{
                top: `${(4 - i) * 6}px`,
                left: `${(4 - i) * 6}px`,
                width: "256px",
                height: "330px",
                zIndex: i,
              }}
            />
          ))}
          {/* 맨 앞장 */}
          <div className="absolute top-0 left-0 w-[256px] h-[330px] bg-white border border-line rounded-xl p-6 shadow-md z-10 flex flex-col items-center">
            <p className="text-[15px] font-bold text-fg-secondary mt-4">실전 모의고사</p>
            <p className="text-[28px] font-bold text-fg-primary mt-1 mb-8">공통수학2</p>
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-6 px-2">
              <div className="h-[46px] bg-surface-secondary rounded" />
              <div className="h-[80px] bg-surface-secondary rounded" />
              <div className="h-[60px] bg-surface-secondary rounded" />
              <div className="h-[46px] bg-surface-secondary rounded" />
              <div className="h-[46px] bg-surface-secondary rounded" />
            </div>
          </div>
        </div>

        {/* OMR card (실제 컴포넌트를 스케일다운) */}
        <div className="relative w-[520px] h-[336px] flex items-center justify-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 origin-center"
            style={{
              width: "960px",
              height: "610px",
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
