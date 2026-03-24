# State Management Guidelines

모의고사 웹앱의 상태 관리 가이드라인입니다.

**핵심 원칙:** 서버 상태는 TanStack Query, 클라이언트 상태는 useState/Context로 명확히 분리합니다. 전역 상태 라이브러리(Zustand 등)는 필요에 따라 선택적으로 도입합니다.

## Related Guides

- `.claude/server-request.md`: API 호출 패턴, TanStack Query 사용법, 서버 응답 타입 참고
- `.claude/form-handling.md`: 답안 마킹 등 폼 상태 관리 패턴 참고
- `.claude/navigation.md`: 단계별 라우팅(튜토리얼 → OMR → 결과) 흐름 참고
- `.claude/testing.md`: 상태 관리 관련 테스트 패턴 참고

---

## 1. Tech Stack

| 역할 | 도구 | 비고 |
| --- | --- | --- |
| 서버 상태 | TanStack Query | 시험 정보, 문제 데이터, 채점 결과 등 API 데이터 |
| 로컬 UI 상태 | `useState` | 컴포넌트 내부 토글, 모달 열림/닫힘 등 |
| 크로스 컴포넌트 상태 | React Context | 시험 세션(단계, 학생 정보, 답안, 타이머) |
| 전역 상태 (선택) | Zustand | Context 성능 이슈 발생 시 선택적 도입 |
| 라우팅 | React Router | 페이지 간 이동, URL 파라미터 |

> **Vite 환경 참고:** React + Vite 프로젝트이므로 Server Component, `"use client"` 지시어, Server Actions 등 Next.js 전용 개념은 해당하지 않습니다. 모든 컴포넌트는 클라이언트에서 실행됩니다.

---

## 2. 상태 분류

### Server State vs Client State

| 구분 | 관리 도구 | 모의고사 앱 예시 |
| --- | --- | --- |
| **Server State** | TanStack Query | 시험 목록, 문제 데이터, 정답 데이터, 채점 결과 |
| **Client State (세션)** | React Context | 현재 단계, 선택된 학생 정보, 답안 배열, 타이머 상태 |
| **Client State (로컬)** | useState | 현재 보고 있는 문제 번호, 모달 열림/닫힘, 입력 포커스 |
| **Client State (URL)** | React Router | 시험 ID(`/exam/:examId`), 현재 페이지 경로 |

```typescript
// ❌ Bad - 서버 데이터를 useState로 관리
const [examData, setExamData] = useState(null);
useEffect(() => {
  fetchExamData(examId).then(setExamData);
}, [examId]);

// ✅ Good - 서버 데이터는 TanStack Query
const { data: examData, isLoading } = useQuery({
  queryKey: ["exam", examId],
  queryFn: () => examApi.getExam(examId),
});

// ✅ Good - 클라이언트 상태는 useState 또는 Context
const [answers, setAnswers] = useState<Record<number, number>>({});
const [currentStep, setCurrentStep] = useState<ExamStep>("tutorial");
```

### Context vs useState vs Zustand 사용 기준

| 상황 | 권장 | 모의고사 앱 예시 |
| --- | --- | --- |
| 단일 컴포넌트 내 상태 | useState | 현재 문제 번호, 모달 토글 |
| 여러 컴포넌트가 공유하는 세션 상태 | React Context | 시험 단계, 학생 정보, 답안 데이터, 타이머 |
| prop drilling 해결 (변경 빈도 낮음) | React Context | 시험 설정(문제 수, 시간 제한) |
| 빈번한 업데이트 + 성능 이슈 발생 시 | Zustand (선택) | 답안 마킹(개별 문제 답안 변경이 전체 리렌더 유발 시) |
| 서버 데이터 | TanStack Query | 시험 문제, 정답, 채점 결과 |

---

## 3. 모의고사 앱 상태 구조

### 3.1 시험 세션 상태 (React Context)

시험 진행 중 여러 컴포넌트가 공유해야 하는 핵심 상태입니다.

```typescript
// contexts/ExamSessionContext.tsx
import { createContext, useContext, useState, useCallback } from "react";

type ExamStep = "tutorial" | "answering" | "result";

interface StudentInfo {
  name: string;
  grade: string;
  classId: string;
}

interface ExamSession {
  // 상태
  step: ExamStep;
  studentInfo: StudentInfo | null;
  answers: Record<number, number>; // { 문제번호: 선택한 답 }
  examId: string | null;
  startedAt: number | null; // 타이머 시작 시각 (timestamp)

  // 액션
  setStep: (step: ExamStep) => void;
  setStudentInfo: (info: StudentInfo) => void;
  markAnswer: (questionNumber: number, answer: number) => void;
  clearAnswer: (questionNumber: number) => void;
  startExam: (examId: string) => void;
  resetSession: () => void;
}

const ExamSessionContext = createContext<ExamSession | null>(null);

const initialState = {
  step: "tutorial" as ExamStep,
  studentInfo: null as StudentInfo | null,
  answers: {} as Record<number, number>,
  examId: null as string | null,
  startedAt: null as number | null,
};

export function ExamSessionProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<ExamStep>(initialState.step);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(initialState.studentInfo);
  const [answers, setAnswers] = useState<Record<number, number>>(initialState.answers);
  const [examId, setExamId] = useState<string | null>(initialState.examId);
  const [startedAt, setStartedAt] = useState<number | null>(initialState.startedAt);

  const markAnswer = useCallback((questionNumber: number, answer: number) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: answer }));
  }, []);

  const clearAnswer = useCallback((questionNumber: number) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionNumber];
      return next;
    });
  }, []);

  const startExam = useCallback((id: string) => {
    setExamId(id);
    setStep("answering");
    setStartedAt(Date.now());
  }, []);

  const resetSession = useCallback(() => {
    setStep(initialState.step);
    setStudentInfo(initialState.studentInfo);
    setAnswers(initialState.answers);
    setExamId(initialState.examId);
    setStartedAt(initialState.startedAt);
  }, []);

  return (
    <ExamSessionContext.Provider
      value={{
        step,
        studentInfo,
        answers,
        examId,
        startedAt,
        setStep,
        setStudentInfo,
        markAnswer,
        clearAnswer,
        startExam,
        resetSession,
      }}
    >
      {children}
    </ExamSessionContext.Provider>
  );
}

export function useExamSession() {
  const context = useContext(ExamSessionContext);
  if (!context) {
    throw new Error("useExamSession must be used within ExamSessionProvider");
  }
  return context;
}
```

### 3.2 타이머 상태 (Custom Hook)

타이머는 시험 세션의 `startedAt`을 기반으로 동작하며, 별도 hook으로 분리합니다.

```typescript
// hooks/useExamTimer.ts
import { useState, useEffect, useCallback } from "react";
import { useExamSession } from "../contexts/ExamSessionContext";

interface UseExamTimerReturn {
  remainingSeconds: number;
  isExpired: boolean;
  formattedTime: string; // "MM:SS"
}

export function useExamTimer(timeLimitMinutes: number): UseExamTimerReturn {
  const { startedAt } = useExamSession();
  const [remainingSeconds, setRemainingSeconds] = useState(timeLimitMinutes * 60);

  useEffect(() => {
    if (!startedAt) {
      setRemainingSeconds(timeLimitMinutes * 60);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, timeLimitMinutes * 60 - elapsed);
      setRemainingSeconds(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes]);

  const isExpired = remainingSeconds <= 0;

  const formattedTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  return { remainingSeconds, isExpired, formattedTime };
}
```

### 3.3 서버 상태 (TanStack Query)

시험 데이터, 문제, 채점 결과 등 서버에서 가져오는 데이터입니다.

```typescript
// hooks/queries/useExamQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query Key 팩토리
export const examKeys = {
  all: () => ["exams"] as const,
  detail: (examId: string) => ["exams", examId] as const,
  questions: (examId: string) => ["exams", examId, "questions"] as const,
  result: (examId: string, submissionId: string) =>
    ["exams", examId, "result", submissionId] as const,
};

// 시험 정보 조회
export function useExamQuery(examId: string) {
  return useQuery({
    queryKey: examKeys.detail(examId),
    queryFn: () => examApi.getExam(examId),
    enabled: !!examId,
  });
}

// 시험 문제 조회
export function useExamQuestionsQuery(examId: string) {
  return useQuery({
    queryKey: examKeys.questions(examId),
    queryFn: () => examApi.getQuestions(examId),
    enabled: !!examId,
    staleTime: Infinity, // 시험 중 문제 데이터는 변하지 않음
  });
}

// 답안 제출 (Mutation)
export function useSubmitAnswersMutation(examId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: Record<number, number>) =>
      examApi.submitAnswers(examId, answers),
    onSuccess: (result) => {
      // 채점 결과를 캐시에 저장
      queryClient.setQueryData(
        examKeys.result(examId, result.submissionId),
        result,
      );
    },
  });
}

// 채점 결과 조회
export function useExamResultQuery(examId: string, submissionId: string) {
  return useQuery({
    queryKey: examKeys.result(examId, submissionId),
    queryFn: () => examApi.getResult(examId, submissionId),
    enabled: !!examId && !!submissionId,
  });
}
```

---

## 4. 상태 흐름: 시험 3단계

```
[튜토리얼] ──→ [답안 마킹 (OMR)] ──→ [채점/결과]
   step="tutorial"    step="answering"      step="result"
   studentInfo 입력    answers 업데이트      submitMutation 호출
                      timer 시작             결과 표시
```

### 4.1 튜토리얼 단계

```typescript
// pages/TutorialPage.tsx
function TutorialPage() {
  const { setStudentInfo, setStep } = useExamSession();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");

  const handleStart = () => {
    setStudentInfo({ name, grade, classId: "A" });
    setStep("answering");
  };

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleStart}>시험 시작</button>
    </div>
  );
}
```

### 4.2 답안 마킹 단계 (OMR)

```typescript
// pages/AnsweringPage.tsx
function AnsweringPage() {
  const { answers, markAnswer, clearAnswer, examId } = useExamSession();
  const { formattedTime, isExpired } = useExamTimer(60); // 60분 제한
  const { data: questions } = useExamQuestionsQuery(examId!);

  // 로컬 상태: 현재 보고 있는 문제 (다른 컴포넌트와 공유 불필요)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleMarkAnswer = (questionNumber: number, choice: number) => {
    markAnswer(questionNumber, choice); // Context 업데이트
  };

  return (
    <div>
      <Timer time={formattedTime} />
      <OMRCard
        questions={questions}
        answers={answers}
        onMark={handleMarkAnswer}
        onClear={clearAnswer}
      />
    </div>
  );
}
```

### 4.3 채점/결과 단계

```typescript
// pages/ResultPage.tsx
function ResultPage() {
  const { answers, examId, studentInfo, resetSession } = useExamSession();
  const submitMutation = useSubmitAnswersMutation(examId!);

  useEffect(() => {
    if (examId && Object.keys(answers).length > 0) {
      submitMutation.mutate(answers);
    }
  }, []); // 페이지 진입 시 1회 제출

  const handleRetake = () => {
    resetSession(); // 세션 초기화
  };

  if (submitMutation.isPending) return <Loading />;
  if (submitMutation.isError) return <Error />;

  return (
    <div>
      <ScoreDisplay result={submitMutation.data} />
      <button onClick={handleRetake}>다시 시작</button>
    </div>
  );
}
```

---

## 5. Context 성능 최적화

### 5.1 Context 분리

하나의 거대한 Context 대신, 업데이트 빈도가 다른 상태는 분리합니다.

```typescript
// ❌ Bad - 답안 마킹 시 타이머, 학생 정보를 구독하는 컴포넌트도 리렌더링
<ExamSessionContext.Provider value={{ step, studentInfo, answers, timer, ... }}>

// ✅ Good - 빈도별로 Context 분리
<ExamStepContext.Provider value={{ step, setStep }}>        {/* 변경 빈도: 낮음 */}
  <StudentInfoContext.Provider value={{ studentInfo }}>     {/* 변경 빈도: 거의 없음 */}
    <AnswersContext.Provider value={{ answers, markAnswer }}> {/* 변경 빈도: 높음 */}
      {children}
    </AnswersContext.Provider>
  </StudentInfoContext.Provider>
</ExamStepContext.Provider>
```

### 5.2 useMemo로 Context Value 안정화

```typescript
// ❌ Bad - 매 렌더마다 새 객체 생성
<ExamStepContext.Provider value={{ step, setStep }}>

// ✅ Good - useMemo로 참조 안정화
const stepValue = useMemo(() => ({ step, setStep }), [step]);
<ExamStepContext.Provider value={stepValue}>
```

### 5.3 답안 상태에서 성능 이슈가 발생하는 경우

답안 마킹이 빈번하고 OMR 카드 전체가 리렌더링되는 성능 문제가 발생하면, 아래 전략을 순서대로 검토합니다.

```typescript
// 전략 1: React.memo로 개별 OMR 셀 메모이제이션
const OMRCell = React.memo(function OMRCell({
  questionNumber,
  selectedAnswer,
  onMark,
}: OMRCellProps) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((choice) => (
        <button
          key={choice}
          className={selectedAnswer === choice ? "selected" : ""}
          onClick={() => onMark(questionNumber, choice)}
        >
          {choice}
        </button>
      ))}
    </div>
  );
});

// 전략 2: useReducer로 상태 업데이트 로직 통합
type AnswerAction =
  | { type: "mark"; questionNumber: number; answer: number }
  | { type: "clear"; questionNumber: number }
  | { type: "reset" };

function answerReducer(
  state: Record<number, number>,
  action: AnswerAction,
): Record<number, number> {
  switch (action.type) {
    case "mark":
      return { ...state, [action.questionNumber]: action.answer };
    case "clear": {
      const next = { ...state };
      delete next[action.questionNumber];
      return next;
    }
    case "reset":
      return {};
  }
}

// 전략 3 (선택): Zustand로 답안 상태 분리 — 아래 Section 6 참고
```

---

## 6. Zustand 도입 가이드 (선택사항)

> **주의:** Zustand는 필수가 아닙니다. useState + Context로 충분한 경우가 대부분이며, Context 분리와 React.memo로 해결되지 않는 성능 문제가 발생할 때만 도입을 검토합니다.

### 도입 판단 기준

| 조건 | Context 유지 | Zustand 도입 검토 |
| --- | --- | --- |
| 상태를 공유하는 컴포넌트 수 | 5개 미만 | 10개 이상 |
| 상태 업데이트 빈도 | 낮음 (단계 전환 등) | 높음 (답안 마킹 등) |
| Context 분리 + memo로 해결 | 가능 | 불가능 |
| 컴포넌트 외부에서 상태 접근 필요 | 불필요 | 필요 (타이머 만료 시 자동 제출 등) |

### Zustand 도입 시 답안 Store 예시

```typescript
// store/answerStore.ts
import { create } from "zustand";

interface AnswerState {
  answers: Record<number, number>;
  markAnswer: (questionNumber: number, answer: number) => void;
  clearAnswer: (questionNumber: number) => void;
  resetAnswers: () => void;
  getAnswerCount: () => number;
}

export const useAnswerStore = create<AnswerState>((set, get) => ({
  answers: {},

  markAnswer: (questionNumber, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionNumber]: answer },
    })),

  clearAnswer: (questionNumber) =>
    set((state) => {
      const next = { ...state.answers };
      delete next[questionNumber];
      return { answers: next };
    }),

  resetAnswers: () => set({ answers: {} }),

  getAnswerCount: () => Object.keys(get().answers).length,
}));

// 컴포넌트에서 사용 - 필요한 상태만 구독
const answer = useAnswerStore((state) => state.answers[questionNumber]);
const markAnswer = useAnswerStore((state) => state.markAnswer);

// 컴포넌트 외부에서 사용 (타이머 만료 시 자동 제출)
const answers = useAnswerStore.getState().answers;
submitAnswers(answers);
```

### Zustand 사용 시 TypeScript 패턴

```typescript
// 미들웨어 없을 때 - 단일 괄호
const useStore = create<State>((set) => ({ ... }));

// 미들웨어 있을 때 - 이중 괄호 (타입 추론을 위해)
const useStore = create<State>()(
  persist(
    (set) => ({ ... }),
    { name: "storage-key" }
  )
);
```

### Zustand Selector 패턴

```typescript
// ❌ Bad - 전체 상태 구독 (모든 변경에 리렌더링)
const { answers, markAnswer, clearAnswer } = useAnswerStore();

// ✅ Good - 필요한 상태만 구독
const answer = useAnswerStore((state) => state.answers[questionNumber]);

// ✅ Good - 여러 값을 객체로 선택 시 useShallow
import { useShallow } from "zustand/react/shallow";
const { markAnswer, clearAnswer } = useAnswerStore(
  useShallow((state) => ({
    markAnswer: state.markAnswer,
    clearAnswer: state.clearAnswer,
  }))
);
```

---

## 7. TanStack Query와 클라이언트 상태 동기화

서버 데이터를 기반으로 클라이언트 상태를 초기화하는 패턴입니다.

```typescript
// 시험 데이터 로드 후 세션 초기화
function ExamLoader({ examId }: { examId: string }) {
  const { startExam } = useExamSession();
  const { data: exam, isLoading } = useExamQuery(examId);

  useEffect(() => {
    if (exam) {
      startExam(exam.id); // TanStack Query → Context 동기화
    }
  }, [exam, startExam]);

  if (isLoading) return <Loading />;
  return <AnsweringPage />;
}
```

> **원칙:** 동기화 로직은 한 곳에서만 수행합니다. 여러 컴포넌트에서 중복 동기화 코드를 작성하지 않습니다.

---

## 8. 상태 초기화 패턴

### 8.1 세션 초기화 (시험 종료/재시작)

```typescript
// Context 사용 시
const { resetSession } = useExamSession();
resetSession(); // 모든 세션 상태 초기값으로

// Zustand 사용 시 (선택적 도입 후)
useAnswerStore.getState().resetAnswers();

// TanStack Query 캐시도 필요 시 초기화
const queryClient = useQueryClient();
queryClient.removeQueries({ queryKey: examKeys.all() });
```

### 8.2 단계 전환 시 부분 초기화

```typescript
// 답안 마킹 → 결과 단계로 전환 시: 답안은 유지, 타이머만 정지
const handleSubmit = () => {
  setStep("result"); // 단계만 변경, answers는 유지
};

// 결과 → 튜토리얼로 복귀 시: 전체 초기화
const handleRetake = () => {
  resetSession(); // 전체 초기화
};
```

---

## 9. 터치스크린 환경 고려사항

18-27인치 터치스크린 환경에서의 상태 관리 유의점입니다.

```typescript
// 터치 이벤트로 인한 빠른 연속 상태 업데이트 방지
const handleMark = useCallback((questionNumber: number, answer: number) => {
  // 동일한 답 재선택 시 무시 (불필요한 상태 업데이트 방지)
  if (answers[questionNumber] === answer) return;
  markAnswer(questionNumber, answer);
}, [answers, markAnswer]);

// 세션 유지: 터치스크린 키오스크 환경에서는 브라우저 새로고침 대비
// sessionStorage에 답안 백업 (선택적)
useEffect(() => {
  sessionStorage.setItem("exam-answers-backup", JSON.stringify(answers));
}, [answers]);

useEffect(() => {
  const backup = sessionStorage.getItem("exam-answers-backup");
  if (backup) {
    // 복원 로직 (필요 시)
  }
}, []);
```

---

## 10. Anti-Patterns

### 서버 상태를 useState/Zustand로 관리

```typescript
// ❌ Bad - 서버 데이터를 직접 fetch하여 로컬 상태로 관리
const [questions, setQuestions] = useState([]);
useEffect(() => {
  examApi.getQuestions(examId).then(setQuestions);
}, [examId]);

// ✅ Good - TanStack Query 사용
const { data: questions } = useExamQuestionsQuery(examId);
```

### 모든 상태를 하나의 Context에 몰아넣기

```typescript
// ❌ Bad - 거대한 단일 Context (답안 마킹 시 타이머 컴포넌트도 리렌더링)
const AppContext = createContext({
  step, studentInfo, answers, timer, theme, settings, ...
});

// ✅ Good - 업데이트 빈도별로 분리
// ExamStepContext (낮은 빈도)
// AnswersContext (높은 빈도)
// StudentInfoContext (거의 불변)
```

### 파생 상태를 별도 state로 관리

```typescript
// ❌ Bad - 파생 가능한 값을 별도 state로 관리
const [answers, setAnswers] = useState({});
const [answeredCount, setAnsweredCount] = useState(0); // answers에서 파생 가능!

const handleMark = (q: number, a: number) => {
  setAnswers((prev) => ({ ...prev, [q]: a }));
  setAnsweredCount((prev) => prev + 1); // 동기화 버그 위험
};

// ✅ Good - 파생 상태는 계산으로 도출
const [answers, setAnswers] = useState({});
const answeredCount = Object.keys(answers).length; // 항상 정확
```

### prop drilling 대신 무조건 전역 상태

```typescript
// ❌ Bad - 단순 1-2단계 prop 전달을 전역 상태로 처리
const useQuestionNumberStore = create((set) => ({
  currentQuestion: 0,
  setCurrentQuestion: (n: number) => set({ currentQuestion: n }),
}));

// ✅ Good - 1-2단계는 prop으로 충분
function OMRCard({ currentQuestion, onChangeQuestion }) {
  return <QuestionNav current={currentQuestion} onChange={onChangeQuestion} />;
}
```

### Action 내에서 state 직접 변경 (Zustand에서 Immer 없이)

```typescript
// ❌ Bad - 직접 변경
set((state) => {
  state.answers[questionNumber] = answer; // 직접 변경!
  return state;
});

// ✅ Good - 새 객체 반환
set((state) => ({
  answers: { ...state.answers, [questionNumber]: answer },
}));
```

---

## Quick Reference

### 상태 유형별 선택 가이드

```
서버에서 오는 데이터인가?
  ├── Yes → TanStack Query
  └── No → 여러 컴포넌트에서 공유하는가?
              ├── No → useState
              └── Yes → 업데이트가 빈번한가?
                          ├── No → React Context
                          └── Yes → Context 분리 + React.memo 시도
                                      ├── 해결됨 → Context 유지
                                      └── 미해결 → Zustand 도입 검토
```

### Provider 구성

```tsx
// App.tsx (또는 main.tsx)
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ExamSessionProvider } from "./contexts/ExamSessionContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ExamSessionProvider>
          <AppRoutes />
        </ExamSessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### 주요 상태 접근 패턴

```typescript
// 시험 세션 (Context)
const { step, answers, markAnswer } = useExamSession();

// 서버 데이터 (TanStack Query)
const { data, isLoading } = useExamQuery(examId);

// URL 파라미터 (React Router)
const { examId } = useParams<{ examId: string }>();

// 로컬 상태 (useState)
const [currentQuestion, setCurrentQuestion] = useState(0);
```

---

## PR Checklist

- [ ] 서버 상태와 클라이언트 상태가 올바르게 분리되어 있는가? (서버 데이터 → TanStack Query)
- [ ] Context value에 useMemo가 적용되어 불필요한 리렌더링을 방지하는가?
- [ ] Context Provider가 필요한 범위에만 적용되어 있는가?
- [ ] 파생 가능한 상태를 별도 state로 관리하지 않는가?
- [ ] 답안 마킹 등 빈번한 업데이트에 대한 성능 최적화가 되어 있는가? (memo, Context 분리)
- [ ] useEffect 내 동기화 로직이 한 곳에서만 수행되는가?
- [ ] 세션 초기화(resetSession)가 모든 관련 상태를 포함하는가?
- [ ] Zustand 사용 시 필요한 상태만 선택적으로 구독하고 있는가?
- [ ] 터치스크린 환경에서 빠른 연속 입력에 대한 방어 로직이 있는가?
