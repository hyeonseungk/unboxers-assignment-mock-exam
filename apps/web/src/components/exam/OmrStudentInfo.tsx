import type { StudentInfo } from "@/lib/types/exam";

interface OmrStudentInfoProps {
  studentInfo: StudentInfo;
}

export function OmrStudentInfo({ studentInfo }: OmrStudentInfoProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 시험 제목 */}
      <div className="border-b border-line-secondary pb-3 mb-3">
        <p className="text-base font-bold text-fg-primary">TEN-UP 모의고사</p>
      </div>

      {/* 학생 정보 필드 */}
      <div className="flex flex-col gap-2">
        <InfoField label="학교" value={studentInfo.school} />
        <InfoField label="이름" value={studentInfo.name} />
        <InfoField
          label="학년"
          value={`${studentInfo.grade}학년`}
        />
        <InfoField label="번호" value={String(studentInfo.studentNumber)} />
        <InfoField label="좌석" value={String(studentInfo.seatNumber)} />
      </div>

      {/* 하단 로고 영역 */}
      <div className="mt-auto pt-4 border-t border-line-secondary">
        <p className="text-base font-bold text-accent">베이스 수학학원</p>
        <p className="text-base text-fg-secondary mt-1">
          학생답안 입력용
          <br />
          OMR 카드
        </p>
        <p className="text-base text-fg-muted mt-2 leading-relaxed">
          이 카드는 시험 답안을 기록하기 위한 용도입니다.
        </p>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-fg-muted w-10 shrink-0">{label}</span>
      <span className="text-base font-medium text-fg-primary bg-surface-secondary rounded-lg px-3 py-1.5 flex-1 min-h-9 flex items-center">
        {value}
      </span>
    </div>
  );
}
