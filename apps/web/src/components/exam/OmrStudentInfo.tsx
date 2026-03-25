import type { StudentInfo } from "@/lib/types/exam";
import { cn } from "@/lib/utils/cn";

interface OmrStudentInfoProps {
  studentInfo: StudentInfo;
}

export function OmrStudentInfo({ studentInfo }: OmrStudentInfoProps) {
  const studentNumStr = String(studentInfo.studentNumber).padStart(2, "0");
  const num1 = parseInt(studentNumStr[0], 10);
  const num2 = parseInt(studentNumStr[1], 10);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-1 min-w-0">
        {/* 왼쪽 정보 테이블 + 로고 영역 */}
        <div className="flex flex-col flex-1 min-w-0 justify-between pr-[12px] border-r-[1.5px] border-dotted border-[#C9D6F8]">
          {/* Table */}
          <div className="flex flex-col min-w-0 border border-[#8EABF2] bg-[#FFFBEF] overflow-hidden">
            <InfoRow label="시 험" value="TEN-UP 모의고사" isBold />
            <InfoRow label="과 목" value="공통수학2" isBold />
            <InfoRow label="성 명" value={studentInfo.name} isBold />
            <InfoRow label="학 교" value={studentInfo.school} isBold />
            <InfoRow label="좌 석" value={`${studentInfo.seatNumber}번`} isBold />
            <InfoRow label="감 독" value="신희철" isBold isLast />
          </div>

          {/* 로고 & 설명 */}
          <div className="flex flex-col items-center text-center mt-3 pb-2">
            <div className="w-[54px] h-[54px] rounded-[18px] border-[3px] border-[#3B66DE] flex items-center justify-center mb-2">
              <div className="w-[22px] h-[22px] rounded-full bg-[#3B66DE]" />
            </div>
            <p className="font-bold text-[#3B66DE] text-[12px] mb-1 tracking-tight">베이스 수학학원</p>
            <p className="font-extrabold text-[#365CC8] text-[15px] leading-snug mb-4 tracking-tight">
              학생답안 입력용<br />OMR 카드
            </p>
            <p className="w-[140px] text-[10px] text-[#6E86D8] leading-[1.6] text-left break-keep">
              객관식 답안은 터치해서 칠하고, 주관식 답안은 터치한 뒤 키패드로 입력해요.
              <br /><br />
              답안을 작성하지 않고 제출하면 별도의 경고 없이 오답으로 처리되니 주의하세요.
            </p>
          </div>
        </div>

        {/* 오른쪽 마킹 영역 (학년, 번호) */}
        <div className="w-[114px] shrink-0 flex flex-col pl-[16px] pr-[4px]">
          <div className="grid grid-cols-[20px_1px_51px] gap-x-[10px] items-end mb-3 pt-3 h-[32px]">
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-bold text-[#3B66DE] leading-[1.2]">학</span>
              <span className="text-[13px] font-bold text-[#3B66DE] leading-[1.2]">년</span>
            </div>
            <div className="w-px h-5 bg-[#C9D6F8] mb-[2px]" />
            <div className="flex items-center justify-center pb-[2px]">
              <span className="text-[13px] font-bold text-[#3B66DE] whitespace-nowrap tracking-[0.2em] ml-[3px]">번 호</span>
            </div>
          </div>

          <div className="grid grid-cols-[20px_1px_51px] gap-x-[10px] flex-1 mt-1">
            {/* 학년 열 */}
            <div className="flex flex-col gap-[3px] items-center">
              {[1, 2, 3].map((g) => (
                <MarkBubble key={`grade-${g}`} number={g} selected={studentInfo.grade === g} />
              ))}
            </div>

            <div className="w-px bg-[#C9D6F8] h-full" />

            <div className="grid grid-cols-2 gap-x-[7px] gap-y-[3px] content-start justify-items-center">
              {/* 번호 10의 자리 열 */}
              <div className="flex flex-col gap-[3px] items-center">
                {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                  <MarkBubble key={`num1-${n}`} number={n} selected={num1 === n} />
                ))}
              </div>

              {/* 번호 1의 자리 열 */}
              <div className="flex flex-col gap-[3px] items-center">
                {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                  <MarkBubble key={`num2-${n}`} number={n} selected={num2 === n} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isBold = false,
  isLast = false,
}: {
  label: string;
  value: string;
  isBold?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={cn("flex min-h-[38px] bg-[#FFFBEF]", !isLast && "border-b border-[#8EABF2]")}>
      <div className="w-[46px] shrink-0 border-r border-[#8EABF2] flex items-center justify-center bg-[#F4F8FF]">
        <span className="text-[13px] font-bold text-[#3B66DE] tracking-[0.2em] ml-[2px]">{label}</span>
      </div>
      <div className="flex-1 flex items-center justify-center px-1">
        <span className={cn("text-[14px] text-[#111] text-center truncate", isBold && "font-bold")}>{value}</span>
      </div>
    </div>
  );
}

function MarkBubble({ number, selected }: { number: number; selected: boolean }) {
  return (
    <div
      className={cn(
        "w-[18px] h-[34px] rounded-[999px] flex items-center justify-center text-[11px] font-bold select-none",
        selected
          ? "bg-[#1A1A1A] text-white"
          : "bg-[#989FA6] text-white"
      )}
    >
      {number}
    </div>
  );
}
