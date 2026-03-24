import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Button } from "@/components/ui";
import type { StudentInfo } from "@/lib/types/exam";
import { cn } from "@/lib/utils/cn";

interface StudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: StudentInfo) => void;
}

interface FieldError {
  name?: string;
  school?: string;
  studentNumber?: string;
  seatNumber?: string;
}

export function StudentInfoModal({
  isOpen,
  onClose,
  onSubmit,
}: StudentInfoModalProps) {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState<number>(1);
  const [studentNumber, setStudentNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [errors, setErrors] = useState<FieldError>({});

  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (!name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!school.trim()) newErrors.school = "학교를 입력해주세요";
    if (!studentNumber) newErrors.studentNumber = "번호를 입력해주세요";
    if (!seatNumber) newErrors.seatNumber = "좌석번호를 입력해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      school: school.trim(),
      grade,
      studentNumber: Number(studentNumber),
      seatNumber: Number(seatNumber),
    });
  };

  const handleNumberInput = (
    value: string,
    setter: (v: string) => void,
  ) => {
    if (value === "" || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full min-h-14 px-4 py-3 rounded-xl border text-base text-fg-primary bg-surface",
      "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
      "placeholder:text-fg-muted",
      hasError ? "border-error-500" : "border-line",
    );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      preventOverlayClose
      ariaLabelledBy="student-info-title"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-8 w-[min(520px,92vw)] border border-line">
        <h2
          id="student-info-title"
          className="text-xl font-bold text-fg-primary"
        >
          학생 정보 입력
        </h2>
        <p className="mt-2 text-base text-fg-secondary">
          시험 응시를 위해 정보를 입력해주세요.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {/* 이름 */}
          <div>
            <label className="block text-base font-medium text-fg-primary mb-1">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <p className="mt-1 text-base text-error-500">{errors.name}</p>
            )}
          </div>

          {/* 학교 */}
          <div>
            <label className="block text-base font-medium text-fg-primary mb-1">
              학교
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="학교를 입력하세요"
              className={inputClass(!!errors.school)}
            />
            {errors.school && (
              <p className="mt-1 text-base text-error-500">{errors.school}</p>
            )}
          </div>

          {/* 학년 */}
          <div>
            <label className="block text-base font-medium text-fg-primary mb-1">
              학년
            </label>
            <div className="flex gap-3">
              {[1, 2, 3].map((g) => (
                <Button
                  key={g}
                  variant={grade === g ? "primary" : "secondary"}
                  size="lg"
                  className="flex-1"
                  onClick={() => setGrade(g)}
                >
                  {g}학년
                </Button>
              ))}
            </div>
          </div>

          {/* 번호 & 좌석번호 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-base font-medium text-fg-primary mb-1">
                번호
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={studentNumber}
                onChange={(e) =>
                  handleNumberInput(e.target.value, setStudentNumber)
                }
                placeholder="번호"
                className={inputClass(!!errors.studentNumber)}
              />
              {errors.studentNumber && (
                <p className="mt-1 text-base text-error-500">
                  {errors.studentNumber}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-base font-medium text-fg-primary mb-1">
                좌석번호
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={seatNumber}
                onChange={(e) =>
                  handleNumberInput(e.target.value, setSeatNumber)
                }
                placeholder="좌석번호"
                className={inputClass(!!errors.seatNumber)}
              />
              {errors.seatNumber && (
                <p className="mt-1 text-base text-error-500">
                  {errors.seatNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="dark"
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
          >
            시험 시작
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
