import type { StudentInfo } from "@/lib/types/exam";
import { cn } from "@/lib/utils/cn";
import { OmrStudentInfo } from "./OmrStudentInfo";
import { OmrObjectiveFooterBars } from "./OmrObjectiveFooterBars";
import { OmrObjectiveGrid } from "./OmrObjectiveGrid";
import { OmrSubjectiveList } from "./OmrSubjectiveList";
import {
  OMR_BORDER_L,
  OMR_BORDER_R,
  OMR_BORDER_Y,
  OMR_CARD_BG,
  OMR_NOTE,
  OMR_NUMBER_STRIP_GRID,
} from "./omrStyles";

export const OMR_CARD_BASE_WIDTH = 960;
export const OMR_CARD_BASE_HEIGHT = 610;

interface OmrCardProps {
  studentInfo: StudentInfo;
  objectiveAnswers: Record<number, number>;
  subjectiveAnswers: Record<number, string>;
  selectedSubjective: number | null;
  onObjectiveSelect: (questionNumber: number, choice: number) => void;
  onSubjectiveSelect: (displayNumber: number) => void;
  disabled?: boolean;
  className?: string;
}

export function OmrCard({
  studentInfo,
  objectiveAnswers,
  subjectiveAnswers,
  selectedSubjective,
  onObjectiveSelect,
  onSubjectiveSelect,
  disabled = false,
  className,
}: OmrCardProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col rounded-[28px] bg-[#FCF8EA] p-[12px] shadow-[0_8px_22px_rgba(29,33,48,0.12)]",
        OMR_CARD_BG,
        className,
      )}
    >
      <div className="grid min-h-0 flex-1 grid-cols-[236px_minmax(0,1fr)_252px]">
        <div className="min-w-0">
          <OmrStudentInfo studentInfo={studentInfo} />
        </div>

        <div className={cn("min-w-0", OMR_BORDER_Y, OMR_BORDER_L, "border-[#86A6F3]")}>
          <OmrObjectiveGrid
            answers={objectiveAnswers}
            onSelect={onObjectiveSelect}
            disabled={disabled}
          />
        </div>

        <div className={cn("min-w-0", OMR_BORDER_Y, OMR_BORDER_L, OMR_BORDER_R, "border-[#86A6F3]")}>
          <OmrSubjectiveList
            answers={subjectiveAnswers}
            selectedQuestion={selectedSubjective}
            onSelectQuestion={onSubjectiveSelect}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-[236px_minmax(0,1fr)_252px] items-end pt-[2px]">
        <StudentFooterBars />

        <ObjectiveFooterBars />

        <div className={cn("grid", OMR_NUMBER_STRIP_GRID)}>
          <div />
          <div className="flex justify-center">
            <p className={cn("text-[11px] font-semibold tracking-[-0.01em]", OMR_NOTE)}>
              선 아래부분은 절대 칠하지 말 것.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentFooterBars() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_80px]">
      <div />
      <div className="grid grid-cols-[26px_1.5px_minmax(0,1fr)]">
        <div className="flex justify-center">
          <FooterBar />
        </div>
        <div />
        <div className="grid grid-cols-2 gap-x-[6px] px-[6px]">
          <div className="flex justify-center">
            <FooterBar />
          </div>
          <div className="flex justify-center">
            <FooterBar />
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectiveFooterBars() {
  return <OmrObjectiveFooterBars />;
}

function FooterBar() {
  return <span className="h-[22px] w-[6px] rounded-[1px] bg-[#111111]" />;
}
