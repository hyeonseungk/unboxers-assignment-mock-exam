import type { StudentInfo } from "@/lib/types/exam";
import { OmrStudentInfo } from "./OmrStudentInfo";
import { OmrObjectiveGrid } from "./OmrObjectiveGrid";
import { OmrSubjectiveList } from "./OmrSubjectiveList";

interface OmrCardProps {
  studentInfo: StudentInfo;
  objectiveAnswers: Record<number, number>;
  subjectiveAnswers: Record<number, string>;
  selectedSubjective: number | null;
  onObjectiveSelect: (questionNumber: number, choice: number) => void;
  onSubjectiveSelect: (displayNumber: number) => void;
  disabled?: boolean;
}

export function OmrCard({
  studentInfo,
  objectiveAnswers,
  subjectiveAnswers,
  selectedSubjective,
  onObjectiveSelect,
  onSubjectiveSelect,
  disabled = false,
}: OmrCardProps) {
  return (
    <div className="bg-surface border border-line rounded-2xl shadow-sm overflow-hidden h-full flex">
      {/* 좌측: 학생 정보 */}
      <div className="w-48 shrink-0 border-r border-line-secondary p-4 flex flex-col">
        <OmrStudentInfo studentInfo={studentInfo} />
      </div>

      {/* 중앙: 객관식 답안 */}
      <div className="flex-1 border-r border-line-secondary p-4 overflow-y-auto">
        <OmrObjectiveGrid
          answers={objectiveAnswers}
          onSelect={onObjectiveSelect}
          disabled={disabled}
        />
      </div>

      {/* 우측: 주관식 답안 */}
      <div className="w-52 shrink-0 p-4 overflow-y-auto">
        <OmrSubjectiveList
          answers={subjectiveAnswers}
          selectedQuestion={selectedSubjective}
          onSelectQuestion={onSubjectiveSelect}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
