import { OmrCard } from "@/components/exam/OmrCard";
import type { StudentInfo } from "@/lib/types/exam";
import { cn } from "@/lib/utils/cn";

interface ResultOmrPreviewProps {
  studentInfo: StudentInfo;
  objectiveAnswers: Record<number, number>;
  subjectiveAnswers: Record<number, string>;
  muted?: boolean;
  showScanRig?: boolean;
  scale?: number;
}

const noop = () => {};
const PREVIEW_BASE_WIDTH = 960;
const PREVIEW_BASE_HEIGHT = 520;
const DEFAULT_PREVIEW_SCALE = 0.7;

export function ResultOmrPreview({
  studentInfo,
  objectiveAnswers,
  subjectiveAnswers,
  muted = false,
  showScanRig = false,
  scale = DEFAULT_PREVIEW_SCALE,
}: ResultOmrPreviewProps) {
  const previewWidth = PREVIEW_BASE_WIDTH * scale;
  const previewHeight = PREVIEW_BASE_HEIGHT * scale;

  return (
    <div
      className="relative shrink-0 overflow-visible pointer-events-none select-none"
      style={{
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left overflow-visible"
        style={{
          width: `${PREVIEW_BASE_WIDTH}px`,
          height: `${PREVIEW_BASE_HEIGHT}px`,
          transform: `scale(${scale})`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[28px]">
          <OmrCard
            studentInfo={studentInfo}
            objectiveAnswers={objectiveAnswers}
            subjectiveAnswers={subjectiveAnswers}
            selectedSubjective={null}
            onObjectiveSelect={noop}
            onSubjectiveSelect={noop}
            disabled
            className={cn(muted && "opacity-[0.44] shadow-none")}
          />
          {muted && <div className="absolute inset-0 bg-white/28" />}
        </div>

        {showScanRig && <ScanRigOverlay />}
      </div>
    </div>
  );
}

function ScanRigOverlay() {
  return (
    <div className="pointer-events-none absolute left-[16px] right-[16px] top-[-24px] bottom-[-30px] overflow-visible">
      <div className="absolute inset-y-0 w-[42px] animate-scan-rig">
        <div className="absolute left-1/2 top-[22px] bottom-[24px] w-[34px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,213,213,0.18)_16%,rgba(255,141,141,0.38)_32%,rgba(255,97,97,0.56)_50%,rgba(255,141,141,0.38)_68%,rgba(255,213,213,0.18)_84%,rgba(255,255,255,0)_100%)] blur-[4px]" />
        <div className="absolute left-1/2 top-[19px] bottom-[21px] w-[24px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,245,245,0)_0%,rgba(255,191,191,0.36)_14%,rgba(255,108,108,0.82)_34%,rgba(248,66,66,0.96)_50%,rgba(255,108,108,0.82)_66%,rgba(255,191,191,0.36)_86%,rgba(255,245,245,0)_100%)] shadow-[0_0_14px_rgba(241,84,84,0.28)]" />
        <div className="absolute left-1/2 top-[17px] bottom-[19px] w-[8px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,219,219,0.55)_0%,rgba(198,15,15,0.98)_42%,rgba(123,0,0,1)_50%,rgba(198,15,15,0.98)_58%,rgba(255,219,219,0.55)_100%)]" />
        <div className="absolute left-1/2 top-[14px] bottom-[16px] w-[2px] -translate-x-1/2 rounded-full bg-[#7f0000]" />
        <div className="absolute left-1/2 top-0 h-[10px] w-[36px] -translate-x-1/2 rounded-[4px] bg-[linear-gradient(180deg,#515151_0%,#2d2d2d_100%)] shadow-[0_3px_8px_rgba(0,0,0,0.22)]" />
        <div className="absolute left-1/2 bottom-0 h-[10px] w-[36px] -translate-x-1/2 rounded-[4px] bg-[linear-gradient(180deg,#515151_0%,#2d2d2d_100%)] shadow-[0_-3px_8px_rgba(0,0,0,0.14)]" />
      </div>
    </div>
  );
}
