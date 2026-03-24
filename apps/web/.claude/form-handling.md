# Form Handling Guidelines

React + Vite 모의고사 웹앱에서 폼 상태 관리, 유효성 검사, 제출 패턴에 대한 가이드라인입니다.

> **스코프**: 학생 정보 입력 폼과 OMR 답안 마킹 폼을 다룹니다. 터치스크린(18-27인치) 환경에서의 입력 최적화를 고려합니다.

## Related Guides

- `.claude/server-request.md`: 답안 제출 Mutation, API 응답 처리를 다룰 때 참고
- `.claude/error-handling.md`: 제출 실패 처리, 사용자 피드백을 맞출 때 참고
- `.claude/ui-component.md`: 입력 컴포넌트 사용 시 참고
- `.claude/keyboard-handling.md`: 터치스크린 포커스 이동, 접근성 속성을 맞출 때 참고

---

## Tech Stack

| Library | Purpose |
| ------- | ------- |
| `useState` | React 내장 상태 관리 (폼 입력, 답안 마킹) |
| `TanStack Query` | 시험 정보 조회 (`useQuery`), 답안 제출 (`useMutation`) |
| `React Router` | 페이지 간 이동 (튜토리얼 → OMR → 결과) |
| `Tailwind CSS v4` | 스타일링 |

> **Why useState?**
>
> - 단순하고 직관적인 패턴
> - 추가 라이브러리 불필요 (`react-hook-form`, `formik` 미사용)
> - 컴포넌트 간 상태 전달이 명확
> - `useReducer`, `zustand` 미사용 -- `useState`로 모든 폼 상태를 관리

> **사용하지 않는 것들**
>
> - Zod: 서비스 레이어 없음. API 응답 검증은 TypeScript 타입으로 처리
> - Radix UI: 모달/다이얼로그 없음. 모든 UI를 인라인으로 구성
> - i18n: 다국어 지원 없음. 한국어 문자열을 직접 사용
> - `react-hook-form` / `formik`: 폼 라이브러리 미사용

---

## 1. 도메인 타입 & API 데이터 구조

### 1.1 학생 정보 타입

```typescript
interface StudentInfo {
  name: string;           // 학생 이름
  school: string;         // 학교명
  grade: number;          // 학년 (1, 2, 3)
  studentNumber: number;  // 번호
  seatNumber: number;     // 좌석 번호
}
```

### 1.2 답안 타입

```typescript
type AnswerType = "objective" | "subjective";

interface Answer {
  answerType: AnswerType;
  number: number;         // 문항 번호
  answer: number;         // 객관식: 1-5, 주관식: 숫자 입력값
}
```

### 1.3 API 제출 요청 (POST /api/exams/submit)

```typescript
interface SubmitRequest {
  name: string;
  school: string;
  grade: number;
  studentNumber: number;
  seatNumber: number;
  answers: Answer[];
}
```

### 1.4 API 응답 (채점 결과)

```typescript
type GradeResult = "correct" | "wrong" | "unanswered";

interface SubmitResponse {
  message: string;
  data: {
    title: string;
    score: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    results: Array<{
      answerType: AnswerType;
      number: number;
      result: GradeResult;
    }>;
  };
}
```

### 1.5 시험 정보 조회 (GET /api/exams)

```typescript
interface ExamResponse {
  message: string;
  data: {
    title: string;
    description: string | null;
    supervisorName: string;
    totalQuestions: number;
    totalScore: number;
  };
}
```

---

## 2. useState 기반 폼 패턴

### 2.1 학생 정보 폼 -- 개별 useState 패턴

각 필드를 개별 `useState`로 관리하는 패턴입니다. 필드 수가 적고 독립적인 검증이 필요한 경우에 적합합니다.

```tsx
import { useState } from "react";

function StudentInfoForm({ onSubmit }: { onSubmit: (info: StudentInfo) => void }) {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState<number>(1);
  const [studentNumber, setStudentNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!school.trim()) {
      alert("학교를 입력해주세요.");
      return;
    }
    if (!studentNumber) {
      alert("번호를 입력해주세요.");
      return;
    }
    if (!seatNumber) {
      alert("좌석 번호를 입력해주세요.");
      return;
    }

    onSubmit({
      name: name.trim(),
      school: school.trim(),
      grade,
      studentNumber: Number(studentNumber),
      seatNumber: Number(seatNumber),
    });
  };

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
      />
      <input
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        placeholder="학교"
      />
      <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
        <option value={1}>1학년</option>
        <option value={2}>2학년</option>
        <option value={3}>3학년</option>
      </select>
      <input
        type="number"
        value={studentNumber}
        onChange={(e) => setStudentNumber(e.target.value)}
        placeholder="번호"
      />
      <input
        type="number"
        value={seatNumber}
        onChange={(e) => setSeatNumber(e.target.value)}
        placeholder="좌석 번호"
      />
      <button onClick={handleSubmit}>시작</button>
    </div>
  );
}
```

### 2.2 단일 객체 formData 패턴

필드가 한꺼번에 제출되어야 하는 경우 단일 객체로 관리합니다.

```tsx
const [formData, setFormData] = useState<StudentInfo>({
  name: "",
  school: "",
  grade: 1,
  studentNumber: 0,
  seatNumber: 0,
});

// spread로 개별 필드 업데이트
<input
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>
```

### 2.3 OMR 답안 마킹 -- Map/객체 패턴

다수의 동적 필드(25문항)를 관리할 때는 키-값 구조를 사용합니다.

```tsx
// 객관식 답안: { [문항번호]: 선택번호 } (1-5 중 택1)
const [objectiveAnswers, setObjectiveAnswers] = useState<Record<number, number>>({});

// 주관식 답안: { [문항번호]: 입력값 문자열 }
const [subjectiveAnswers, setSubjectiveAnswers] = useState<Record<number, string>>({});

// 객관식 선택 핸들러 (토글: 같은 번호 클릭 시 해제)
const handleObjectiveSelect = (questionNumber: number, choice: number) => {
  setObjectiveAnswers((prev) => {
    if (prev[questionNumber] === choice) {
      const next = { ...prev };
      delete next[questionNumber];
      return next;
    }
    return { ...prev, [questionNumber]: choice };
  });
};

// 주관식 입력 핸들러
const handleSubjectiveInput = (questionNumber: number, value: string) => {
  setSubjectiveAnswers((prev) => ({ ...prev, [questionNumber]: value }));
};

// 답안 배열로 변환 (제출 시)
const buildAnswersPayload = (): Answer[] => {
  const answers: Answer[] = [];

  for (const [num, choice] of Object.entries(objectiveAnswers)) {
    answers.push({
      answerType: "objective",
      number: Number(num),
      answer: choice,
    });
  }

  for (const [num, value] of Object.entries(subjectiveAnswers)) {
    if (value !== "") {
      answers.push({
        answerType: "subjective",
        number: Number(num),
        answer: Number(value),
      });
    }
  }

  return answers;
};
```

### 2.4 객관식 OMR 버튼 렌더링

```tsx
// 객관식 1문항 렌더링 (1-5번 선택 버튼)
function ObjectiveQuestion({
  questionNumber,
  selectedChoice,
  onSelect,
}: {
  questionNumber: number;
  selectedChoice: number | undefined;
  onSelect: (questionNumber: number, choice: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span>{questionNumber}</span>
      {[1, 2, 3, 4, 5].map((choice) => (
        <button
          key={choice}
          className={selectedChoice === choice ? "bg-blue-500 text-white" : "bg-gray-100"}
          onClick={() => onSelect(questionNumber, choice)}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}

// 사용
{Array.from({ length: 14 }, (_, i) => i + 1).map((num) => (
  <ObjectiveQuestion
    key={num}
    questionNumber={num}
    selectedChoice={objectiveAnswers[num]}
    onSelect={handleObjectiveSelect}
  />
))}
```

### 2.5 주관식 숫자 입력 렌더링

```tsx
function SubjectiveQuestion({
  questionNumber,
  value,
  onInput,
}: {
  questionNumber: number;
  value: string;
  onInput: (questionNumber: number, value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span>{questionNumber}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onInput(questionNumber, e.target.value)}
        placeholder="답 입력"
      />
    </div>
  );
}

// 사용
{Array.from({ length: 11 }, (_, i) => i + 1).map((num) => (
  <SubjectiveQuestion
    key={num}
    questionNumber={num}
    value={subjectiveAnswers[num] ?? ""}
    onInput={handleSubjectiveInput}
  />
))}
```

---

## 3. 폼 검증 패턴

### 3.1 제출 시 검증 (주요 패턴)

클라이언트 사이드 폼 검증은 **단순 if 체크**를 사용합니다. 별도 검증 라이브러리를 사용하지 않습니다.

```tsx
const handleSubmit = () => {
  // 필수 필드 검증
  if (!name.trim()) {
    alert("이름을 입력해주세요.");
    return;
  }
  if (!school.trim()) {
    alert("학교를 입력해주세요.");
    return;
  }
  // ... 나머지 필드 검증

  onSubmit({ name: name.trim(), school: school.trim(), grade, studentNumber, seatNumber });
};
```

### 3.2 숫자 입력 검증

학번, 좌석 번호, 주관식 답안처럼 숫자만 입력받는 필드의 검증입니다.

```tsx
// 양의 정수만 허용
const handleNumberInput = (value: string, setter: (v: string) => void) => {
  if (value === "" || /^\d+$/.test(value)) {
    setter(value);
  }
};

<input
  type="number"
  value={studentNumber}
  onChange={(e) => handleNumberInput(e.target.value, setStudentNumber)}
  inputMode="numeric"  // 모바일/터치스크린에서 숫자 키패드 표시
/>
```

### 3.3 빈 답안 허용 (미응답 처리)

서버에서 미응답을 `unanswered`로 채점합니다. 클라이언트에서는 빈 답안 제출을 허용합니다.

```tsx
// 답안이 하나도 없어도 제출 가능 (서버가 unanswered로 처리)
const handleExamSubmit = () => {
  const answers = buildAnswersPayload();
  // answers가 빈 배열이어도 OK
  submitMutation.mutate({
    ...studentInfo,
    answers,
  });
};
```

---

## 4. TanStack Query 통합

### 4.1 시험 정보 조회

```tsx
import { useQuery } from "@tanstack/react-query";

const { data: exam, isLoading, isError } = useQuery({
  queryKey: ["exam"],
  queryFn: async () => {
    const response = await fetch("/api/exams");
    if (!response.ok) throw new Error("시험 정보를 불러오지 못했습니다.");
    return response.json() as Promise<ExamResponse>;
  },
});
```

### 4.2 답안 제출 Mutation

```tsx
import { useMutation } from "@tanstack/react-query";

const submitMutation = useMutation({
  mutationFn: async (payload: SubmitRequest) => {
    const response = await fetch("/api/exams/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("제출에 실패했습니다.");
    return response.json() as Promise<SubmitResponse>;
  },
  onSuccess: (data) => {
    // 결과 페이지로 이동하거나 결과 상태 업데이트
    navigate("/result", { state: data.data });
  },
});
```

### 4.3 제출 핸들러 (학생 정보 + 답안 결합)

```tsx
const handleFinalSubmit = () => {
  const answers = buildAnswersPayload();

  submitMutation.mutate({
    name: studentInfo.name,
    school: studentInfo.school,
    grade: studentInfo.grade,
    studentNumber: studentInfo.studentNumber,
    seatNumber: studentInfo.seatNumber,
    answers,
  });
};

// 제출 버튼에 로딩 상태 반영
<button
  onClick={handleFinalSubmit}
  disabled={submitMutation.isPending}
>
  {submitMutation.isPending ? "제출 중..." : "제출"}
</button>
```

### 4.4 로딩 상태

```tsx
// 버튼 disabled + 텍스트 변경 패턴
<button disabled={isPending}>
  {isPending ? "제출 중..." : "제출하기"}
</button>

// 또는 스피너 표시
{isPending && <div className="animate-spin">...</div>}
```

---

## 5. 페이지 간 상태 전달 패턴

### 5.1 React Router state를 통한 전달

```tsx
import { useNavigate, useLocation } from "react-router-dom";

// 튜토리얼 → OMR 페이지: 학생 정보 전달
const navigate = useNavigate();
navigate("/omr", { state: { studentInfo } });

// OMR 페이지에서 학생 정보 수신
const location = useLocation();
const studentInfo = location.state?.studentInfo as StudentInfo;
```

### 5.2 부모-자식 Controlled 패턴

단일 페이지 내에서 여러 단계를 관리할 때는 부모가 상태를 소유하고 자식에게 전달합니다.

```tsx
// 부모: ExamPage
function ExamPage() {
  const [step, setStep] = useState<"info" | "omr" | "result">("info");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  return (
    <>
      {step === "info" && (
        <StudentInfoForm
          onSubmit={(info) => {
            setStudentInfo(info);
            setStep("omr");
          }}
        />
      )}
      {step === "omr" && studentInfo && (
        <OmrForm studentInfo={studentInfo} />
      )}
    </>
  );
}
```

---

## 6. Anti-Patterns

### (X) 중첩된 객체를 직접 수정

```tsx
// Bad - 불변성 위반
answers[questionNumber] = choice;
setAnswers(answers);

// Good - 새 객체 생성
setAnswers({ ...answers, [questionNumber]: choice });
// 또는 함수형 업데이트 (이전 상태 참조)
setAnswers((prev) => ({ ...prev, [questionNumber]: choice }));
```

### (X) 검증 없이 제출

```tsx
// Bad - 학생 정보 검증 없이 바로 제출
const handleSubmit = () => {
  submitMutation.mutate(formData);
};

// Good - 필수 필드 검증 후 제출
const handleSubmit = () => {
  if (!formData.name.trim()) {
    alert("이름을 입력해주세요.");
    return;
  }
  submitMutation.mutate(formData);
};
```

### (X) 불필요한 라이브러리 사용

```tsx
// Bad - 이 프로젝트에서 사용하지 않는 패턴
import { useForm } from "react-hook-form";        // X
import { z } from "zod";                           // X (클라이언트)
import * as Dialog from "@radix-ui/react-dialog";  // X
import { useTranslations } from "next-intl";       // X (Next.js 아님)
```

### (X) 숫자 필드를 문자열 타입으로 제출

```tsx
// Bad - 서버가 number를 기대하는데 string 전송
submitMutation.mutate({
  grade: studentNumber,   // "3" (string)
  answers: [{ answer: inputValue }],  // "42" (string)
});

// Good - Number()로 변환 후 제출
submitMutation.mutate({
  grade: Number(studentNumber),       // 3 (number)
  answers: [{ answer: Number(inputValue) }],  // 42 (number)
});
```

### (X) 제출 중 중복 클릭 허용

```tsx
// Bad - 로딩 중에도 버튼 활성화
<button onClick={handleSubmit}>제출</button>

// Good - isPending으로 중복 제출 방지
<button onClick={handleSubmit} disabled={submitMutation.isPending}>
  {submitMutation.isPending ? "제출 중..." : "제출"}
</button>
```

### (X) 답안 상태를 배열로 관리

```tsx
// Bad - 문항 번호 기반 조회가 O(n)
const [answers, setAnswers] = useState<Answer[]>([]);

// Good - Record로 O(1) 조회
const [objectiveAnswers, setObjectiveAnswers] = useState<Record<number, number>>({});
const [subjectiveAnswers, setSubjectiveAnswers] = useState<Record<number, string>>({});
```

---

## 7. Quick Reference

### 학생 정보 폼 초기화

```typescript
const [name, setName] = useState("");
const [school, setSchool] = useState("");
const [grade, setGrade] = useState<number>(1);
const [studentNumber, setStudentNumber] = useState("");
const [seatNumber, setSeatNumber] = useState("");
```

### OMR 답안 상태 초기화

```typescript
const [objectiveAnswers, setObjectiveAnswers] = useState<Record<number, number>>({});
const [subjectiveAnswers, setSubjectiveAnswers] = useState<Record<number, string>>({});
```

### 답안 → API 페이로드 변환

```typescript
const answers: Answer[] = [
  ...Object.entries(objectiveAnswers).map(([num, choice]) => ({
    answerType: "objective" as const,
    number: Number(num),
    answer: choice,
  })),
  ...Object.entries(subjectiveAnswers)
    .filter(([, value]) => value !== "")
    .map(([num, value]) => ({
      answerType: "subjective" as const,
      number: Number(num),
      answer: Number(value),
    })),
];
```

### 제출 패턴

```typescript
submitMutation.mutate({
  name: name.trim(),
  school: school.trim(),
  grade,
  studentNumber: Number(studentNumber),
  seatNumber: Number(seatNumber),
  answers,
});
```

### 검증 패턴

```typescript
if (!name.trim()) { alert("이름을 입력해주세요."); return; }
if (!school.trim()) { alert("학교를 입력해주세요."); return; }
```

---

## PR Checklist

- [ ] 폼 상태가 `useState`로 관리되는가?
- [ ] 상태 업데이트가 불변성을 유지하는가? (spread 또는 함수형 업데이트)
- [ ] 필수 필드에 대한 검증이 `handleSubmit` 내에 있는가?
- [ ] 숫자 필드가 제출 시 `Number()`로 변환되는가?
- [ ] 제출 중 중복 제출 방지가 되어 있는가? (`disabled={isPending}`)
- [ ] API 페이로드가 서버 스키마(`SubmitRequest`)와 일치하는가?
- [ ] 객관식 답안이 `Record<number, number>`, 주관식이 `Record<number, string>`으로 관리되는가?
- [ ] 불필요한 라이브러리(`react-hook-form`, `zod`, `radix-ui`, `next-intl`)를 import하지 않는가?
- [ ] 빈 답안 제출이 허용되는가? (서버가 `unanswered`로 처리)
- [ ] React Router의 `navigate`/`useLocation`으로 페이지 간 상태를 전달하는가?
