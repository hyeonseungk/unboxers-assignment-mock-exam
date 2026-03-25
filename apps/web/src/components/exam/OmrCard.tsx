import type { StudentInfo } from "@/lib/types/exam";
import { OmrStudentInfo } from "./OmrStudentInfo";
import { OmrObjectiveGrid } from "./OmrObjectiveGrid";
import { OmrSubjectiveList } from "./OmrSubjectiveList";

const FOOTER_BAR_GROUPS = [
  [22, 14, 22, 14, 22],
  [22, 14, 22, 14, 22],
  [22, 14, 22, 14, 22],
] as const;

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
    <div className="bg-[#FFFBEF] border-[1.5px] border-[#5D7FE6] rounded-2xl shadow-sm overflow-hidden h-full w-full flex flex-col p-4">
      <div className="flex flex-1 min-h-0">
        {/* 좌측: 학생 정보 */}
        <div className="shrink-0 flex flex-col w-[258px]">
          <OmrStudentInfo studentInfo={studentInfo} />
        </div>

        <div className="w-px bg-[#C9D6F8] mx-4 my-1" />

        {/* 중앙: 객관식 답안 */}
        <div className="flex-1 flex min-w-0">
          <OmrObjectiveGrid
            answers={objectiveAnswers}
            onSelect={onObjectiveSelect}
            disabled={disabled}
          />
        </div>

        <div className="w-px bg-[#C9D6F8] mx-4 my-1" />

        {/* 우측: 주관식 답안 */}
        <div className="w-[260px] shrink-0 flex">
          <OmrSubjectiveList
            answers={subjectiveAnswers}
            selectedQuestion={selectedSubjective}
            onSelectQuestion={onSubjectiveSelect}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="flex items-end pt-[8px]">
        <div className="w-[258px] shrink-0" />
        <div className="w-px mx-4 opacity-0" />

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 w-full">
            {FOOTER_BAR_GROUPS.map((group, groupIndex) => (
              <div
                key={`footer-group-${groupIndex}`}
                className="flex items-end justify-center gap-[10px]"
              >
                {group.map((height, barIndex) => (
                  <span
                    key={`footer-group-${groupIndex}-bar-${barIndex}`}
                    className="w-[6px] rounded-[1px] bg-[#111]"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="w-px mx-4 opacity-0" />

        <div className="w-[260px] shrink-0 flex justify-end">
          <p className="text-[11px] font-semibold tracking-tight text-[#6A6A6A]">
            선 아래부분은 절대 칠하지 말 것.
          </p>
        </div>
      </div>
    </div>
  );
}
