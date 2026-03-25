import type { StudentInfo } from "@/lib/types/exam";
import { cn } from "@/lib/utils/cn";
import {
  OMR_BORDER_B,
  OMR_BORDER_L,
  OMR_BORDER_R,
  OMR_BORDER_T,
  OMR_BORDER_Y,
  OMR_BRAND_TEXT,
  OMR_BUBBLE_BG,
  OMR_BUBBLE_SIZE,
  OMR_DIVIDER_W,
  OMR_GUIDE_TEXT,
  OMR_LINE,
  OMR_LINE_BG,
  OMR_TEXT,
  OMR_TITLE_BLUE,
} from "./omrStyles";

interface OmrStudentInfoProps {
  studentInfo: StudentInfo;
}

const INFO_ROWS = [
  { label: "시험", value: "TEN-UP 모의고사" },
  { label: "과목", value: "공통수학2" },
  { label: "성명", value: "" },
  { label: "학교", value: "" },
  { label: "좌석", value: "" },
  { label: "감독", value: "신희철" },
] as const;

export function OmrStudentInfo({ studentInfo }: OmrStudentInfoProps) {
  const studentNumStr = String(studentInfo.studentNumber).padStart(2, "0");
  const num1 = Number(studentNumStr[0]);
  const num2 = Number(studentNumStr[1]);
  const infoValues = [
    "TEN-UP 모의고사",
    "공통수학2",
    studentInfo.name,
    studentInfo.school,
    `${studentInfo.seatNumber}번`,
    "신희철",
  ];

  return (
    <div className="grid h-full w-full grid-cols-[minmax(0,1fr)_80px]">
      <div className={cn("flex min-w-0 flex-col", OMR_BORDER_R, OMR_BORDER_T, OMR_LINE)}>
        <div className={cn("overflow-hidden", OMR_BORDER_L, OMR_LINE)}>
          {INFO_ROWS.map((row, index) => (
            <InfoRow
              key={row.label}
              label={row.label}
              value={infoValues[index]}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-[12px] py-[16px] text-center">
          <BaseMathLogo />

          <div className="mt-[10px] flex flex-col items-center">
            <p className={cn("text-[18px] font-black tracking-[-0.08em]", OMR_BRAND_TEXT)}>
              베이스 수학학원
            </p>
            <p
              className={cn(
                "mt-[4px] text-[18px] font-black leading-[1.02] tracking-[-0.08em]",
                OMR_TITLE_BLUE,
              )}
            >
              학생답안 입력용
              <br />
              OMR 카드
            </p>
          </div>

          <p
            className={cn(
              "mt-[14px] max-w-[132px] text-left text-[9px] font-bold leading-[1.55] break-keep",
              OMR_GUIDE_TEXT,
            )}
          >
            객관식 답안은 터치해서 칠하고, 주관식 답안은 터치한 뒤 키패드로 입력해요.
            <br />
            <br />
            답안을 작성하지 않고 제출하면 별도의 경고 없이 오답으로 처리되니 주의하세요.
          </p>
        </div>
      </div>

      <div className={cn("grid min-h-0 grid-rows-[34px_1fr]", OMR_BORDER_Y, OMR_LINE)}>
        <div className={cn("grid grid-cols-[26px_1.5px_minmax(0,1fr)]", OMR_BORDER_B, OMR_LINE)}>
          <div className="flex items-center justify-center">
            <span className={cn("text-center text-[12px] font-bold leading-[1.1]", OMR_TEXT)}>
              학
              <br />
              년
            </span>
          </div>
          <div className={cn(OMR_DIVIDER_W, OMR_LINE_BG)} />
          <div className="flex items-center justify-center">
            <span className={cn("text-[12px] font-bold tracking-[0.16em]", OMR_TEXT)}>
              번호
            </span>
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-[26px_1.5px_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-[6px] pt-[6px]">
            {[1, 2, 3].map((grade) => (
              <MarkBubble
                key={`grade-${grade}`}
                number={grade}
                selected={studentInfo.grade === grade}
              />
            ))}
          </div>

          <div className={cn(OMR_DIVIDER_W, OMR_LINE_BG)} />

          <div className="grid min-h-0 grid-cols-2 gap-x-[6px] px-[6px] py-[2px]">
            <DigitColumn selectedNumber={num1} prefix="num1" />
            <DigitColumn selectedNumber={num2} prefix="num2" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [first, second] = label.split("");

  return (
    <div className={cn("grid min-h-[34px] grid-cols-[28px_minmax(0,1fr)]", OMR_BORDER_B, OMR_LINE)}>
      <div className={cn("flex items-center justify-center", OMR_BORDER_R, OMR_LINE)}>
        <span className={cn("text-center text-[11px] font-semibold leading-[1.12]", OMR_TEXT)}>
          {first}
          <br />
          {second}
        </span>
      </div>
      <div className="flex min-w-0 items-center justify-center px-2">
        <span className={cn("truncate text-[12px] font-extrabold", OMR_TEXT)}>{value}</span>
      </div>
    </div>
  );
}

function DigitColumn({
  selectedNumber,
  prefix,
}: {
  selectedNumber: number;
  prefix: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-between py-[2px]">
      {Array.from({ length: 10 }, (_, number) => (
        <MarkBubble
          key={`${prefix}-${number}`}
          number={number}
          selected={selectedNumber === number}
        />
      ))}
    </div>
  );
}

function MarkBubble({
  number,
  selected,
}: {
  number: number;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        `${OMR_BUBBLE_SIZE} flex items-center justify-center text-[11px] font-bold select-none`,
        selected ? "bg-[#111111] text-white" : `${OMR_BUBBLE_BG} text-white`,
      )}
    >
      {number}
    </div>
  );
}

function BaseMathLogo() {
  return (
    <img
      src="/logo-image.png"
      alt=""
      aria-hidden="true"
      className="h-[40px] w-[40px] object-contain"
    />
  );
}
