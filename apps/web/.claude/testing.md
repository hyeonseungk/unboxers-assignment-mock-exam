# Testing Guidelines

Vitest + React Testing Library 기반 모의고사 웹앱 테스트 가이드라인입니다.

> **현재 상태:** 테스트 인프라는 아직 구성되지 않았습니다. 아래 내용은 React + Vite 환경에서의 **권장 패턴**입니다.

## Related Guides

- `.claude/form-handling.md`: 학생 정보 폼, OMR 답안 입력 등 폼 컴포넌트 테스트 시 참고
- `.claude/server-request.md`: TanStack Query 기반 API 호출 테스트, MSW 모킹 전략 수립 시 참고
- `.claude/state-management.md`: Zustand store 테스트 패턴, 상태 초기화 전략 참고
- `.claude/error-handling.md`: 에러 상태 테스트, 사용자 피드백 검증 시 참고
- `.claude/navigation.md`: React Router 기반 라우팅 테스트, 네비게이션 모킹 참고

---

## 1. Tech Stack

| Library | Purpose | 상태 |
| --- | --- | --- |
| `vitest` | 테스트 러너 및 assertion | **권장** |
| `@testing-library/react` | 컴포넌트 및 Hook 테스트 | **권장** |
| `@testing-library/jest-dom` | DOM matchers 확장 | **권장** |
| `@testing-library/user-event` | 사용자 인터랙션 시뮬레이션 | **권장** |
| `jsdom` | 브라우저 DOM 시뮬레이션 (Vitest 환경) | **권장** |
| `msw` | API 모킹 (Mock Service Worker) | **선택** |

### 설치 커맨드

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
# MSW가 필요한 경우
pnpm add -D msw
```

---

## 2. 테스트 설정

### 2.1 Vite 설정에 Vitest 통합

```typescript
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
    },
  },
});
```

### 2.2 테스트 Setup 파일

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 매 테스트 후 DOM 정리
afterEach(() => {
  cleanup();
});
```

### 2.3 TypeScript 설정

```json
// tsconfig.json - compilerOptions에 추가
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### 2.4 package.json 스크립트

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## 3. 디렉토리 구조

```
src/
├── test/
│   ├── setup.ts                    # 글로벌 테스트 설정
│   ├── test-utils.tsx              # 커스텀 render, wrapper
│   ├── mocks/
│   │   ├── handlers.ts             # MSW 핸들러 (선택)
│   │   └── server.ts               # MSW 서버 설정 (선택)
│   └── fixtures/
│       ├── exam.ts                 # 모의고사 목 데이터
│       └── student.ts              # 학생 정보 목 데이터
├── features/
│   └── exam/
│       ├── components/
│       │   ├── OmrSheet.tsx
│       │   └── OmrSheet.test.tsx   # 컴포넌트 옆에 테스트 파일 배치
│       └── hooks/
│           ├── useExamTimer.ts
│           └── useExamTimer.test.ts
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx
└── lib/
    └── utils/
        ├── scoring.ts
        └── scoring.test.ts
```

> 테스트 파일은 소스 파일과 같은 디렉토리에 `*.test.{ts,tsx}` 형식으로 배치한다. `__tests__/` 디렉토리는 사용하지 않는다.

---

## 4. 테스트 유틸리티

### 4.1 커스텀 render (Provider Wrapper)

TanStack Query, React Router 등 전역 Provider가 필요한 컴포넌트 테스트를 위한 커스텀 render 함수.

```tsx
// src/test/test-utils.tsx
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, type MemoryRouterProps } from "react-router";
import type { ReactElement, ReactNode } from "react";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AllProviders({
  children,
  queryClient,
  routerProps,
}: {
  children: ReactNode;
  queryClient: QueryClient;
  routerProps?: MemoryRouterProps;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter {...routerProps}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const {
    queryClient = createTestQueryClient(),
    routerProps,
    ...renderOptions
  } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} routerProps={routerProps}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}

// re-export everything
export * from "@testing-library/react";
export { customRender as render, createTestQueryClient };
```

### 4.2 Fixture 데이터

```typescript
// src/test/fixtures/exam.ts
import type { Exam, Answer } from "@/types";

export function createMockExam(overrides?: Partial<Exam>): Exam {
  return {
    id: 1,
    title: "2024 수능 모의고사",
    subject: "수학",
    totalQuestions: 30,
    timeLimit: 100, // 분
    ...overrides,
  };
}

export function createMockAnswers(count: number): Answer[] {
  return Array.from({ length: count }, (_, i) => ({
    questionNumber: i + 1,
    selectedOption: null,
  }));
}
```

```typescript
// src/test/fixtures/student.ts
import type { Student } from "@/types";

export function createMockStudent(overrides?: Partial<Student>): Student {
  return {
    name: "홍길동",
    schoolName: "한국고등학교",
    grade: 3,
    classNumber: 2,
    studentNumber: 15,
    ...overrides,
  };
}
```

---

## 5. 테스트 네이밍 규칙

### 5.1 Arrange-Act-Assert 패턴

```typescript
it("5번 문항의 3번 선택지를 클릭하면 해당 답이 선택된다", async () => {
  // Arrange
  const user = userEvent.setup();
  render(<OmrSheet totalQuestions={30} />);

  // Act
  await user.click(screen.getByTestId("question-5-option-3"));

  // Assert
  expect(screen.getByTestId("question-5-option-3")).toHaveAttribute(
    "aria-checked",
    "true",
  );
});
```

### 5.2 테스트 설명 작성 규칙

```typescript
// Good - 행동과 결과를 명확히 기술 (한국어)
it("답안을 모두 입력하지 않고 제출하면 미입력 문항 수를 표시한다", () => {});
it("시험 시간이 종료되면 자동으로 답안을 제출한다", () => {});
it("학생 이름을 입력하지 않으면 에러 메시지를 표시한다", () => {});

// Bad - 모호하거나 구현 세부사항에 의존
it("테스트", () => {});
it("동작한다", () => {});
it("setState가 호출된다", () => {});
```

### 5.3 data-testid 네이밍 컨벤션

```tsx
// 패턴: {component}-{role} 또는 {feature}-{component}-{role}
// kebab-case 사용

// OMR 관련
data-testid="omr-sheet"
data-testid={`question-${number}-option-${option}`}
data-testid="answer-submit-button"

// 학생 정보 폼
data-testid="student-name-input"
data-testid="student-form-submit"

// 타이머
data-testid="exam-timer"
data-testid="timer-remaining"

// 채점 결과
data-testid="score-result"
data-testid={`result-question-${number}`}
```

---

## 6. 컴포넌트 테스트 패턴

### 6.1 OMR 답안 입력 컴포넌트

```tsx
// features/exam/components/OmrSheet.test.tsx
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { OmrSheet } from "./OmrSheet";

describe("OmrSheet", () => {
  it("지정된 문항 수만큼 행을 렌더링한다", () => {
    render(<OmrSheet totalQuestions={30} />);

    // 1번부터 30번까지 문항이 모두 렌더링되는지 확인
    for (let i = 1; i <= 30; i++) {
      expect(screen.getByText(`${i}`)).toBeInTheDocument();
    }
  });

  it("선택지를 클릭하면 답이 선택된다", async () => {
    const onAnswerChange = vi.fn();
    const user = userEvent.setup();

    render(
      <OmrSheet totalQuestions={30} onAnswerChange={onAnswerChange} />,
    );

    await user.click(screen.getByTestId("question-1-option-3"));

    expect(onAnswerChange).toHaveBeenCalledWith(1, 3);
  });

  it("이미 선택된 답을 다시 클릭하면 선택이 해제된다", async () => {
    const onAnswerChange = vi.fn();
    const user = userEvent.setup();

    render(
      <OmrSheet
        totalQuestions={30}
        answers={{ 1: 3 }}
        onAnswerChange={onAnswerChange}
      />,
    );

    await user.click(screen.getByTestId("question-1-option-3"));

    expect(onAnswerChange).toHaveBeenCalledWith(1, null);
  });

  it("다른 선택지를 클릭하면 답이 변경된다", async () => {
    const onAnswerChange = vi.fn();
    const user = userEvent.setup();

    render(
      <OmrSheet
        totalQuestions={30}
        answers={{ 1: 3 }}
        onAnswerChange={onAnswerChange}
      />,
    );

    await user.click(screen.getByTestId("question-1-option-5"));

    expect(onAnswerChange).toHaveBeenCalledWith(1, 5);
  });
});
```

### 6.2 학생 정보 폼

```tsx
// features/exam/components/StudentInfoForm.test.tsx
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { StudentInfoForm } from "./StudentInfoForm";

describe("StudentInfoForm", () => {
  it("필수 입력 필드를 렌더링한다", () => {
    render(<StudentInfoForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText("이름")).toBeInTheDocument();
    expect(screen.getByLabelText("학교")).toBeInTheDocument();
    expect(screen.getByLabelText("학년")).toBeInTheDocument();
  });

  it("유효한 정보 입력 후 제출하면 onSubmit이 호출된다", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<StudentInfoForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("이름"), "홍길동");
    await user.type(screen.getByLabelText("학교"), "한국고등학교");
    await user.click(screen.getByRole("button", { name: "시작" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "홍길동",
        schoolName: "한국고등학교",
      }),
    );
  });

  it("이름을 입력하지 않으면 에러 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    render(<StudentInfoForm onSubmit={vi.fn()} />);

    // 이름을 비워둔 채 제출
    await user.click(screen.getByRole("button", { name: "시작" }));

    expect(screen.getByText(/이름을 입력/)).toBeInTheDocument();
  });
});
```

### 6.3 채점 결과 표시

```tsx
// features/exam/components/ScoreResult.test.tsx
import { render, screen } from "@/test/test-utils";
import { ScoreResult } from "./ScoreResult";

const mockResult = {
  totalQuestions: 30,
  correctCount: 25,
  score: 83,
  answers: [
    { questionNumber: 1, selected: 3, correct: 3, isCorrect: true },
    { questionNumber: 2, selected: 2, correct: 4, isCorrect: false },
  ],
};

describe("ScoreResult", () => {
  it("총 점수를 표시한다", () => {
    render(<ScoreResult result={mockResult} />);

    expect(screen.getByTestId("score-result")).toHaveTextContent("83");
  });

  it("정답 수와 총 문항 수를 표시한다", () => {
    render(<ScoreResult result={mockResult} />);

    expect(screen.getByText(/25/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  it("오답 문항에 오답 표시를 렌더링한다", () => {
    render(<ScoreResult result={mockResult} />);

    const incorrectItem = screen.getByTestId("result-question-2");
    expect(incorrectItem).toHaveClass("incorrect");
  });
});
```

### 6.4 조건부 렌더링 및 빈 상태 테스트

```tsx
import { render, screen } from "@/test/test-utils";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("답안이 없을 때 안내 메시지를 표시한다", () => {
    render(<EmptyState message="아직 제출된 답안이 없습니다" />);

    expect(
      screen.getByText("아직 제출된 답안이 없습니다"),
    ).toBeInTheDocument();
  });

  it("action 버튼이 전달되면 렌더링한다", () => {
    render(
      <EmptyState
        message="결과가 없습니다"
        actionLabel="다시 시도"
        onAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  });
});
```

---

## 7. 훅 테스트 패턴

### 7.1 시험 타이머 훅

```typescript
// features/exam/hooks/useExamTimer.test.ts
import { renderHook, act } from "@testing-library/react";
import { useExamTimer } from "./useExamTimer";

describe("useExamTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("초기 시간을 올바르게 설정한다", () => {
    const { result } = renderHook(() => useExamTimer(100)); // 100분

    expect(result.current.remainingSeconds).toBe(6000);
    expect(result.current.isExpired).toBe(false);
  });

  it("매 초마다 남은 시간이 감소한다", () => {
    const { result } = renderHook(() => useExamTimer(100));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingSeconds).toBe(5999);
  });

  it("시간이 0이 되면 onExpire 콜백이 호출된다", () => {
    const onExpire = vi.fn();
    renderHook(() => useExamTimer(1, { onExpire })); // 1분

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("pause 호출 시 타이머가 멈춘다", () => {
    const { result } = renderHook(() => useExamTimer(100));

    act(() => {
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(6000);
  });

  it("남은 시간을 mm:ss 형식으로 포맷한다", () => {
    const { result } = renderHook(() => useExamTimer(100));

    expect(result.current.formattedTime).toBe("100:00");

    act(() => {
      vi.advanceTimersByTime(61_000); // 61초 경과
    });

    expect(result.current.formattedTime).toBe("98:59");
  });
});
```

### 7.2 TanStack Query 훅 테스트

```tsx
// features/exam/hooks/useExamQuery.test.tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useExamQuery } from "./useExamQuery";
import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useExamQuery", () => {
  it("모의고사 데이터를 성공적으로 조회한다", async () => {
    const { result } = renderHook(() => useExamQuery(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(
      expect.objectContaining({ id: 1 }),
    );
  });

  it("존재하지 않는 시험 ID로 조회 시 에러가 발생한다", async () => {
    const { result } = renderHook(() => useExamQuery(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

### 7.3 Mutation 훅 테스트

```tsx
// features/exam/hooks/useSubmitAnswers.test.tsx
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubmitAnswers } from "./useSubmitAnswers";
import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useSubmitAnswers", () => {
  it("답안 제출 성공 시 결과 데이터를 반환한다", async () => {
    const { result } = renderHook(() => useSubmitAnswers(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        examId: 1,
        answers: { 1: 3, 2: 4, 3: 1 },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(
      expect.objectContaining({ score: expect.any(Number) }),
    );
  });
});
```

---

## 8. 통합 테스트 패턴

### 8.1 모의고사 응시 플로우

```tsx
// features/exam/components/ExamPage.test.tsx
import { render, screen, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { ExamPage } from "./ExamPage";

describe("ExamPage 통합 테스트", () => {
  it("로딩 → 문제 표시 플로우가 동작한다", async () => {
    render(<ExamPage />, {
      routerProps: { initialEntries: ["/exam/1"] },
    });

    // 로딩 상태 확인
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // 데이터 로드 후 문제 표시 확인
    await waitFor(() => {
      expect(screen.getByTestId("omr-sheet")).toBeInTheDocument();
    });

    expect(screen.getByTestId("exam-timer")).toBeInTheDocument();
  });

  it("답안을 선택하고 제출하면 결과 페이지로 이동한다", async () => {
    const user = userEvent.setup();

    render(<ExamPage />, {
      routerProps: { initialEntries: ["/exam/1"] },
    });

    // 데이터 로드 대기
    await screen.findByTestId("omr-sheet");

    // 답안 선택
    await user.click(screen.getByTestId("question-1-option-3"));
    await user.click(screen.getByTestId("question-2-option-1"));

    // 제출
    await user.click(screen.getByRole("button", { name: /제출/ }));

    // 확인 다이얼로그
    await user.click(screen.getByRole("button", { name: /확인/ }));

    // 결과 표시 대기
    await waitFor(() => {
      expect(screen.getByTestId("score-result")).toBeInTheDocument();
    });
  });

  it("빈 답안 제출 시 경고를 표시한다", async () => {
    const user = userEvent.setup();

    render(<ExamPage />, {
      routerProps: { initialEntries: ["/exam/1"] },
    });

    await screen.findByTestId("omr-sheet");

    // 답안 선택 없이 바로 제출
    await user.click(screen.getByRole("button", { name: /제출/ }));

    expect(screen.getByText(/미입력 문항/)).toBeInTheDocument();
  });
});
```

### 8.2 React Router 통합 테스트

```tsx
// 특정 route에서 올바른 컴포넌트가 렌더링되는지 확인
import { render, screen } from "@/test/test-utils";

describe("라우팅", () => {
  it("/exam/:id 경로에서 ExamPage를 렌더링한다", () => {
    render(<App />, {
      routerProps: { initialEntries: ["/exam/1"] },
    });

    expect(screen.getByTestId("exam-page")).toBeInTheDocument();
  });

  it("존재하지 않는 경로에서 404 페이지를 표시한다", () => {
    render(<App />, {
      routerProps: { initialEntries: ["/nonexistent"] },
    });

    expect(screen.getByText(/페이지를 찾을 수 없습니다/)).toBeInTheDocument();
  });
});
```

---

## 9. 모킹 전략

### 9.1 Vitest 모킹 기본

```typescript
// vi.fn() - 함수 모킹
const mockSubmit = vi.fn();
const mockNavigate = vi.fn();

// vi.mock() - 모듈 모킹
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

// vi.spyOn() - 기존 메서드 감시
vi.spyOn(window, "confirm").mockReturnValue(true);
vi.spyOn(console, "error").mockImplementation(() => {});
```

### 9.2 React Router 모킹

```typescript
// 개별 테스트 파일에서 React Router 모킹
const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ examId: "1" }),
  };
});

describe("ExamHeader", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("뒤로가기 버튼 클릭 시 이전 페이지로 이동한다", async () => {
    const user = userEvent.setup();
    render(<ExamHeader />);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
```

### 9.3 타이머 모킹

```typescript
describe("타이머 관련 테스트", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("5분 경고를 표시한다", () => {
    render(<ExamTimer totalMinutes={10} />);

    // 5분 경과 (남은 5분)
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(screen.getByText(/5분 남았습니다/)).toBeInTheDocument();
  });
});
```

### 9.4 Zustand Store 모킹

```typescript
// 직접 store 상태 테스트 (모킹 불필요)
import { useExamStore } from "@/lib/store/examStore";

describe("examStore", () => {
  beforeEach(() => {
    // 매 테스트 전 초기 상태로 리셋
    useExamStore.setState({
      answers: {},
      currentQuestion: 1,
      isSubmitted: false,
    });
  });

  it("setAnswer가 답안을 저장한다", () => {
    useExamStore.getState().setAnswer(1, 3);

    expect(useExamStore.getState().answers).toEqual({ 1: 3 });
  });

  it("clearAnswers가 모든 답안을 초기화한다", () => {
    useExamStore.setState({ answers: { 1: 3, 2: 4 } });

    useExamStore.getState().clearAnswers();

    expect(useExamStore.getState().answers).toEqual({});
  });
});
```

### 9.5 MSW를 활용한 API 모킹 (선택)

MSW는 네트워크 수준에서 API를 모킹하여 실제 fetch/axios 호출을 인터셉트한다.
TanStack Query 훅 테스트나 통합 테스트에서 유용하다.

#### Handler 정의

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  // 모의고사 목록 조회
  http.get("/api/exams", () => {
    return HttpResponse.json({
      success: true,
      status: 200,
      data: [
        { id: 1, title: "2024 수능 모의고사", subject: "수학" },
        { id: 2, title: "2024 6월 모의고사", subject: "영어" },
      ],
    });
  }),

  // 모의고사 상세 조회
  http.get("/api/exams/:id", ({ params }) => {
    return HttpResponse.json({
      success: true,
      status: 200,
      data: {
        id: Number(params.id),
        title: "2024 수능 모의고사",
        subject: "수학",
        totalQuestions: 30,
        timeLimit: 100,
      },
    });
  }),

  // 답안 제출
  http.post("/api/exams/:id/submit", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      status: 200,
      data: {
        score: 83,
        correctCount: 25,
        totalQuestions: 30,
      },
    });
  }),
];
```

#### Server 설정

```typescript
// src/test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

#### Setup 파일에 MSW 통합

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

#### 개별 테스트에서 Handler 오버라이드

```typescript
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

it("서버 에러 발생 시 에러 메시지를 표시한다", async () => {
  // 이 테스트에서만 500 에러 반환
  server.use(
    http.get("/api/exams/:id", () => {
      return HttpResponse.json(
        { success: false, status: 500, message: "INTERNAL_ERROR" },
        { status: 500 },
      );
    }),
  );

  render(<ExamPage />, {
    routerProps: { initialEntries: ["/exam/1"] },
  });

  await waitFor(() => {
    expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
  });
});
```

---

## 10. Anti-Patterns

### 구현 세부사항 테스트 금지

```tsx
// Bad - 내부 상태를 직접 확인
expect(component.state.isOpen).toBe(true);

// Bad - 내부 메서드 호출 확인
expect(component.instance().handleClick).toHaveBeenCalled();

// Good - 사용자에게 보이는 결과를 확인
expect(screen.getByRole("dialog")).toBeInTheDocument();
```

### container.querySelector 사용 금지

```tsx
// Bad - CSS 셀렉터로 DOM 직접 접근
const button = container.querySelector(".submit-btn");

// Good - Testing Library 쿼리 사용
const button = screen.getByRole("button", { name: "제출" });
```

### 불필요한 waitFor 남용 금지

```tsx
// Bad - 동기적으로 존재하는 요소에 waitFor 사용
await waitFor(() => {
  expect(screen.getByText("제목")).toBeInTheDocument();
});

// Good - 이미 존재하는 요소는 바로 확인
expect(screen.getByText("제목")).toBeInTheDocument();

// Good - 비동기로 나타나는 요소에만 waitFor/findBy 사용
expect(await screen.findByText("로딩 완료")).toBeInTheDocument();
```

### act() 경고 올바르게 처리

```tsx
// Bad - act 경고 발생
it("데이터를 로드한다", () => {
  render(<DataComponent />);
  expect(screen.getByText("완료")).toBeInTheDocument(); // Warning!
});

// Good - waitFor로 비동기 상태 변경 대기
it("데이터를 로드한다", async () => {
  render(<DataComponent />);
  expect(await screen.findByText("완료")).toBeInTheDocument();
});

// Good - userEvent는 내부적으로 act 처리됨
it("클릭하면 상태가 변경된다", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole("button", { name: "증가" }));
  expect(screen.getByText("1")).toBeInTheDocument();
});
```

### fireEvent 대신 userEvent 사용

```tsx
// Bad - fireEvent는 실제 브라우저 동작을 시뮬레이션하지 않음
fireEvent.click(button);
fireEvent.change(input, { target: { value: "텍스트" } });

// Good - userEvent는 실제 사용자 동작에 가까움
const user = userEvent.setup();
await user.click(button);
await user.type(input, "텍스트");
```

### 스냅샷 테스트 남용 금지

```tsx
// Bad - 전체 컴포넌트 스냅샷 (변경에 취약, 의미 없는 diff)
expect(container).toMatchSnapshot();

// Good - 특정 동작과 결과를 명시적으로 검증
expect(screen.getByRole("button")).toBeDisabled();
expect(screen.getByText("점수: 83점")).toBeInTheDocument();
```

### 테스트 간 상태 누수 금지

```tsx
// Bad - 전역 상태가 다음 테스트에 영향
let sharedState = {};

// Good - 매 테스트 전 초기화
beforeEach(() => {
  useExamStore.setState({ answers: {}, isSubmitted: false });
});
```

---

## 11. Quick Reference

### Testing Library 쿼리 우선순위

```typescript
// 1순위 - Role 기반 (접근성, 가장 권장)
screen.getByRole("button", { name: "제출" });
screen.getByRole("textbox", { name: "이름" });
screen.getByRole("radio", { name: "3번" });

// 2순위 - Label 기반
screen.getByLabelText("이름");
screen.getByPlaceholderText("답을 입력하세요");

// 3순위 - 텍스트 기반
screen.getByText("시험 시작");
screen.getByDisplayValue("홍길동");

// 4순위 - data-testid (다른 방법이 없을 때만)
screen.getByTestId("omr-sheet");
```

### 쿼리 변형

```typescript
// getBy - 요소가 반드시 존재해야 함 (없으면 에러)
screen.getByText("제출");

// queryBy - 요소 부재를 확인할 때 (없으면 null)
expect(screen.queryByText("에러")).not.toBeInTheDocument();

// findBy - 비동기로 나타나는 요소 (Promise 반환)
await screen.findByText("완료");
```

### userEvent 주요 API

```typescript
const user = userEvent.setup();

await user.click(element);             // 클릭
await user.dblClick(element);          // 더블클릭
await user.type(input, "텍스트");       // 타이핑
await user.clear(input);              // 입력 초기화
await user.selectOptions(select, "A"); // 옵션 선택
await user.hover(element);            // 마우스 오버
await user.keyboard("{Enter}");        // 키보드 입력
await user.tab();                     // 탭 이동
```

### Vitest 주요 API

```typescript
// Assertion
expect(value).toBe(expected);
expect(value).toEqual(expected);           // 깊은 비교
expect(value).toBeTruthy();
expect(fn).toHaveBeenCalledWith(arg);
expect(fn).toHaveBeenCalledTimes(1);

// DOM Assertion (@testing-library/jest-dom)
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveTextContent("텍스트");
expect(element).toHaveAttribute("aria-checked", "true");
expect(element).toHaveClass("active");
expect(element).toHaveValue("입력값");

// Mock
const fn = vi.fn();
const spy = vi.spyOn(object, "method");
vi.mock("module-name");

// Timer
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

### 커맨드

```bash
pnpm test                              # watch 모드 실행
pnpm test:run                          # 단일 실행
pnpm test:coverage                     # 커버리지 리포트
pnpm vitest run src/features/exam      # 특정 디렉토리만
pnpm vitest run -t "OmrSheet"          # 특정 describe/it만
pnpm vitest --ui                       # 브라우저 UI 모드
```

---

## 12. PR Checklist

- [ ] 새 기능 또는 변경에 대한 테스트가 작성되었는가?
- [ ] 테스트가 사용자 관점에서 작성되었는가? (구현 세부사항이 아닌 동작 검증)
- [ ] `getByRole`, `getByLabelText` 등 접근성 기반 쿼리를 우선 사용했는가?
- [ ] 비동기 동작에 `waitFor` 또는 `findBy`를 올바르게 사용했는가?
- [ ] 에러 케이스와 엣지 케이스가 테스트되었는가?
- [ ] `act()` 경고가 없는가?
- [ ] 테스트 간 상태 격리가 보장되는가? (`beforeEach`에서 초기화)
- [ ] Mock이 테스트 종료 후 정리되는가?
- [ ] `fireEvent` 대신 `userEvent`를 사용했는가?
- [ ] 커버리지 목표(Statements/Branches/Functions 70% 이상)를 충족하는가?

---

## 13. 프로젝트 테스트 대상 및 우선순위

> 이 프로젝트에서 실제로 작성할 수 있는 테스트를 대상별로 정리한 섹션입니다.
> 위 섹션(6~9)의 일반 패턴을 참고하되, 아래 목록의 실제 컴포넌트·함수·흐름에 적용하세요.

### 13.1 단위 테스트 (Unit)

#### Zustand 스토어 (`useExamStore`)

| 대상 | 검증 내용 |
|------|----------|
| `setObjectiveAnswer` | 같은 답 재선택 시 토글(해제) 동작 |
| `setSubjectiveAnswer` | 값 저장 및 덮어쓰기 |
| `setStudentInfo` | 유효한 학생 정보 저장 |
| `resetExam` | 전체 상태(답안, 학생정보, 타이머 등) 초기화 |

#### API 클라이언트 (`httpRequester`)

| 대상 | 검증 내용 |
|------|----------|
| 정상 응답 | `ApiResponse.data` 필드만 추출하여 반환 |
| HTTP 에러 | 응답 body의 에러 메시지 파싱 |
| JSON 파싱 실패 | 폴백 에러 메시지(`요청 실패 (status)`) 반환 |

#### 답안 변환 로직 (`OmrPage.buildAnswers`)

| 대상 | 검증 내용 |
|------|----------|
| 객관식 변환 | `Record<number, number>` → `{ answerType: "objective", number, answer }[]` |
| 주관식 변환 | `Record<number, string>` → `{ answerType: "subjective", number, answer }[]` |
| 빈 답안 | 양쪽 모두 비어있을 때 빈 배열 반환 |
| 빈 문자열 제외 | 주관식에서 `""` 값은 배열에 포함되지 않음 |

### 13.2 컴포넌트 테스트 (Component)

#### OmrBubble

- 선택/미선택 상태 렌더링 (`aria-pressed`)
- 클릭 시 `onSelect` 호출
- `disabled` 시 클릭 무시 (`pointer-events-none`)
- 채점 결과 상태별 스타일 (`correct` / `wrong` / `unanswered`)

#### OmrObjectiveGrid

- `OBJECTIVE_COLUMN_COUNT` × `OBJECTIVE_PER_COLUMN` 만큼 문항 렌더링
- 버블 클릭 시 `onSelect(문항번호, 선택지)` 전달
- 5번째 문항 뒤 점선 구분선 존재

#### OmrSubjectiveList

- `SUBJECTIVE_COUNT`개 문항 렌더링
- 문항 선택 시 하이라이트 (`bg-[#F5F8FF]`)
- 입력된 답안 값 표시 vs 플레이스홀더 텍스트

#### StudentInfoModal

- 필수 필드 미입력 시 제출 불가
- 학년 버튼(1/2/3학년) 선택 동작
- 유효한 정보 입력 후 `onSubmit` 호출

#### ExamKeypadPanel

- 숫자 키(0-9) 입력 → 값 누적
- ⌫(백스페이스) → 마지막 글자 삭제
- 완료 버튼 → `onComplete` 호출
- 특수 키(√, /, -) 비활성화 상태
- 최대 3자리 입력 제한

### 13.3 통합 테스트 (Integration)

#### 튜토리얼 흐름

- 5단계 순차 이동 (이전/다음 버튼)
- 스텝 3 (객관식 연습): 15번 3번 마킹 → 해제 → "다음" 버튼 활성화
- 스텝 4 (주관식 연습): 4번 선택 → 숫자 입력 → 완료 → "다음" 버튼 활성화
- "튜토리얼 건너뛰기" → 학생정보 모달 → `/exam` 이동

#### 시험 응시 흐름

- 객관식 마킹 → 주관식 입력 → 종료하기 → 확인 다이얼로그 → 제출 → `/result` 이동
- 타이머 만료 → 자동 제출 (`useExamTimer.isExpired` → `handleSubmit`)
- `studentInfo` 없이 `/exam` 접근 시 `/`로 리다이렉트

#### 결과 화면

- 3단계 전환: 제출 완료 → 스캔 애니메이션(3초) → 결과 표시
- 점수·정답/오답/미답 수 정확히 표시
- "다시 풀기" / "홈으로" → `/` 이동

### 13.4 API 모킹 테스트 (MSW)

| 엔드포인트 | 검증 내용 |
|-----------|----------|
| `GET /api/exams` | 시험 정보(title, totalQuestions 등) 정상 조회 |
| `GET /api/exams` (에러) | 서버 에러 시 에러 메시지 처리 |
| `POST /api/exams/submit` | 요청 body 형식 검증 (`StudentInfo` + `AnswerItem[]`) |
| `POST /api/exams/submit` | 채점 결과 응답 파싱 (`score`, `results[]`) |
| `POST /api/exams/submit` | 빈 `answers` 배열 허용 (전체 `unanswered` 처리) |

### 13.5 우선순위

| 우선순위 | 대상 | 이유 |
|---------|------|------|
| **높음** | Zustand 스토어 | 앱 전체 상태의 핵심, 순수 로직이라 테스트 쉬움 |
| **높음** | 답안 변환 로직 | `Record` → API 형식 변환에 버그 가능성 높음 |
| **높음** | OmrBubble / 키패드 | 사용자 인터랙션의 핵심 단위 |
| **중간** | 튜토리얼 인터랙티브 스텝 | 조건부 "다음" 버튼 활성화 로직 검증 |
| **중간** | API 서비스 + MSW | 서버 통신 안정성 |
| **낮음** | 결과 화면 전환 | 타이머 기반 단순 전환 |
| **낮음** | 레이아웃/스타일 | 비주얼 검증은 E2E 또는 수동 확인이 더 적합 |
