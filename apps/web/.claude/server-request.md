# Server Request Guidelines

React + Vite 모의고사 웹앱에서 서버 통신을 처리하는 표준 패턴을 정의합니다.
백엔드(Fastify + Prisma + SQLite)는 `localhost:3001`에서 실행되며, 인증 없이 CORS를 통해 통신합니다.

## Related Guides

- `.claude/error-handling.md`: Query/Mutation 실패 처리와 사용자 피드백 흐름을 함께 맞출 때 참고
- `.claude/state-management.md`: Query 결과를 클라이언트 상태와 연동할 때 참고
- `.claude/form-handling.md`: 답안 제출 폼과 useMutation 연동 시 참고

---

## Tech Stack

| 도구 | 버전 | 역할 |
| :--- | :--- | :--- |
| React + Vite | - | SPA 프론트엔드 |
| TanStack Query | v5 | 서버 상태 관리 (캐싱, 자동 refetch, 에러 핸들링) |
| fetch API | 네이티브 | HTTP 클라이언트 (별도 라이브러리 불필요) |

> **axios 대신 fetch를 사용하는 이유:** 이 프로젝트는 API 2개(시험 정보 조회, 답안 제출)로 통신이 단순합니다. 인터셉터나 인스턴스 설정이 불필요하므로 네이티브 fetch로 충분합니다.

---

## 1. API 엔드포인트 정의

### 1.1 서버 응답 형식

모든 API 응답은 다음 구조를 따릅니다:

```typescript
// 성공 응답
{
  "message": "string",
  "data": { ... }
}

// 에러 응답
{
  "message": "에러 설명 문자열"
}
```

### 1.2 엔드포인트 목록

| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/exams` | 시험 정보 조회 (제목, 설명, 감독관, 문항 수, 총점) |
| `POST` | `/api/exams/submit` | 답안 제출 및 채점 결과 수신 |

### 1.3 타입 정의

```typescript
// lib/types/exam.ts

/** GET /api/exams 응답 데이터 */
export interface ExamInfo {
  title: string;
  description: string;
  supervisorName: string;
  totalQuestions: number;
  totalScore: number;
}

/** POST /api/exams/submit 요청 본문의 개별 답안 */
export interface AnswerItem {
  answerType: string;
  number: number;
  answer: string;
}

/** POST /api/exams/submit 요청 본문 */
export interface ExamSubmitRequest {
  name: string;
  school: string;
  grade: string;
  studentNumber: string;
  seatNumber: string;
  answers: AnswerItem[];
}

/** POST /api/exams/submit 응답 데이터의 개별 결과 */
export interface ExamResultItem {
  number: number;
  correct: boolean;
  submitted: string;
  expected: string;
}

/** POST /api/exams/submit 응답 데이터 */
export interface ExamSubmitResult {
  title: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  results: ExamResultItem[];
}
```

---

## 2. API 클라이언트 설정

### 2.1 Base URL 설정

```typescript
// lib/api/client.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * 공통 fetch wrapper.
 * - JSON 응답을 파싱하고 data 필드를 추출한다.
 * - HTTP 에러 시 message를 포함한 Error를 throw한다.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? `요청 실패 (${response.status})`);
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}
```

**설계 포인트:**
- `apiFetch`는 응답에서 `data` 필드를 추출하여 반환한다. 호출 측에서 `response.data`를 꺼내지 않아도 된다.
- 에러 시 서버의 `message` 필드를 Error에 담아 throw한다.
- CORS 요청이므로 별도 credentials 설정은 불필요하다 (인증 없음).

### 2.2 API 서비스 함수

```typescript
// lib/api/examService.ts

import { apiFetch } from "./client";
import type { ExamInfo, ExamSubmitRequest, ExamSubmitResult } from "../types/exam";

export const examService = {
  /** 시험 정보 조회 */
  getExamInfo(): Promise<ExamInfo> {
    return apiFetch<ExamInfo>("/api/exams");
  },

  /** 답안 제출 */
  submitAnswers(data: ExamSubmitRequest): Promise<ExamSubmitResult> {
    return apiFetch<ExamSubmitResult>("/api/exams/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
```

---

## 3. Query Key 관리

모든 query key는 **Query Key Factory** 패턴으로 중앙 관리한다. 문자열 리터럴이 코드베이스에 흩어지는 것을 방지한다.

```typescript
// lib/query-keys/examKeys.ts

export const examKeys = {
  all: ["exams"] as const,
  info: () => [...examKeys.all, "info"] as const,
};
```

### Query Key 규칙

```typescript
// --- 직렬화 가능한 값만 사용 ---

// BAD
queryKey: ["exams", new Date()]
queryKey: ["exams", () => someValue]

// GOOD
queryKey: examKeys.info()
queryKey: ["exams", "info"] // factory 사용 권장
```

> **이 프로젝트의 특수성:** API가 2개뿐이고 파라미터 기반 분기가 없으므로 key factory가 단순합니다. `lists()` / `detail(id)` 같은 계층 분리는 불필요합니다.

---

## 4. TanStack Query 패턴

### 4.1 QueryClient 설정

```typescript
// providers/QueryProvider.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분: 시험 정보는 자주 바뀌지 않음
            gcTime: 1000 * 60 * 10,   // 10분 후 캐시 제거
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // 4xx 에러는 재시도하지 않음 (클라이언트 오류)
              if (error instanceof Error && error.message.includes("4")) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### 4.2 useQuery - 시험 정보 조회

데이터 조회(GET)에는 항상 `useQuery`를 사용한다.

```typescript
// hooks/useExamInfoQuery.ts

import { useQuery } from "@tanstack/react-query";
import { examKeys } from "../lib/query-keys/examKeys";
import { examService } from "../lib/api/examService";

export const useExamInfoQuery = () => {
  return useQuery({
    queryKey: examKeys.info(),
    queryFn: () => examService.getExamInfo(),
  });
};
```

**컴포넌트에서의 사용:**

```tsx
// components/ExamHeader.tsx

import { useExamInfoQuery } from "../hooks/useExamInfoQuery";

export function ExamHeader() {
  const { data: examInfo, isLoading, isError, error } = useExamInfoQuery();

  if (isLoading) return <div>시험 정보를 불러오는 중...</div>;
  if (isError) return <div>오류: {error.message}</div>;
  if (!examInfo) return null;

  return (
    <header>
      <h1>{examInfo.title}</h1>
      <p>{examInfo.description}</p>
      <p>감독관: {examInfo.supervisorName}</p>
      <p>총 {examInfo.totalQuestions}문항 / {examInfo.totalScore}점</p>
    </header>
  );
}
```

### 4.3 useMutation - 답안 제출

데이터 변경(POST/PUT/DELETE)에는 항상 `useMutation`을 사용한다.

```typescript
// hooks/useSubmitExamMutation.ts

import { useMutation } from "@tanstack/react-query";
import { examService } from "../lib/api/examService";
import type { ExamSubmitRequest, ExamSubmitResult } from "../lib/types/exam";

export const useSubmitExamMutation = () => {
  return useMutation<ExamSubmitResult, Error, ExamSubmitRequest>({
    mutationFn: (data) => examService.submitAnswers(data),
  });
};
```

**컴포넌트에서의 사용:**

```tsx
// components/ExamForm.tsx

import { useSubmitExamMutation } from "../hooks/useSubmitExamMutation";

export function ExamForm() {
  const submitMutation = useSubmitExamMutation();

  const handleSubmit = () => {
    const payload: ExamSubmitRequest = {
      name: "홍길동",
      school: "베이스중학교",
      grade: "3",
      studentNumber: "12",
      seatNumber: "A3",
      answers: [
        { answerType: "multiple_choice", number: 1, answer: "3" },
        { answerType: "short_answer", number: 2, answer: "42" },
        // ...
      ],
    };

    submitMutation.mutate(payload, {
      onSuccess: (result) => {
        // result: ExamSubmitResult
        // 채점 결과 화면으로 전환 등
        console.log(`점수: ${result.score}, 정답: ${result.correctCount}문항`);
      },
      onError: (error) => {
        alert(`제출 실패: ${error.message}`);
      },
    });
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={submitMutation.isPending}
    >
      {submitMutation.isPending ? "제출 중..." : "답안 제출"}
    </button>
  );
}
```

### 4.4 Mutation 상태 활용

`useMutation`이 반환하는 상태값을 UI에 적극 활용한다:

| 상태 | 용도 |
| :--- | :--- |
| `isPending` | 제출 버튼 비활성화, 로딩 스피너 표시 |
| `isError` | 에러 메시지 표시 |
| `isSuccess` | 결과 화면 전환 트리거 |
| `data` | 채점 결과 데이터 접근 |
| `error` | 에러 상세 정보 접근 |
| `reset()` | 상태 초기화 (재시도 전) |

---

## 5. 에러 처리

### 5.1 에러 처리 계층

```
fetch 실패 (네트워크)
    -> apiFetch에서 Error throw
        -> TanStack Query가 catch
            -> retry 정책에 따라 재시도 또는 isError 상태 전환

HTTP 4xx/5xx
    -> apiFetch에서 서버 message를 포함한 Error throw
        -> TanStack Query가 catch
            -> 4xx는 재시도 없이 즉시 에러 상태
            -> 5xx는 최대 2회 재시도
```

### 5.2 컴포넌트에서의 에러 처리

```tsx
// useQuery 에러 처리
const { data, isLoading, isError, error } = useExamInfoQuery();

if (isError) {
  return (
    <div role="alert">
      <p>시험 정보를 불러올 수 없습니다.</p>
      <p>{error.message}</p>
    </div>
  );
}

// useMutation 에러 처리 (콜백 방식)
submitMutation.mutate(payload, {
  onError: (error) => {
    // 사용자에게 에러 피드백
    alert(`제출 실패: ${error.message}`);
  },
});

// useMutation 에러 처리 (선언적 방식)
{submitMutation.isError && (
  <p className="text-red-500">
    제출에 실패했습니다: {submitMutation.error.message}
  </p>
)}
```

### 5.3 네트워크 에러 대응

터치스크린 키오스크 환경 특성상 네트워크 불안정에 대비한다:

```tsx
const { isError, error, refetch } = useExamInfoQuery();

if (isError) {
  return (
    <div>
      <p>서버에 연결할 수 없습니다.</p>
      <button onClick={() => refetch()}>다시 시도</button>
    </div>
  );
}
```

---

## 6. Anti-Patterns

### BAD: 컴포넌트에서 직접 fetch 호출

```typescript
// BAD - useEffect + fetch 직접 호출
const [data, setData] = useState(null);

useEffect(() => {
  fetch("/api/exams")
    .then((res) => res.json())
    .then((json) => setData(json.data));
}, []);
```

**이유:** 로딩/에러 상태, 캐싱, 재시도, 언마운트 시 메모리 릭 등을 직접 관리해야 한다. TanStack Query가 모두 처리한다.

### BAD: useMutation으로 GET 요청

```typescript
// BAD - 조회인데 useMutation 사용
const examInfoMutation = useMutation({
  mutationFn: () => examService.getExamInfo(),
});
```

**이유:** 캐싱, 자동 refetch, staleTime 등 useQuery의 이점을 모두 잃는다. 조회는 반드시 useQuery를 사용한다.

### BAD: Query Key를 문자열 리터럴로 분산

```typescript
// BAD - 하드코딩된 key가 여러 파일에 흩어짐
useQuery({ queryKey: ["exam", "info"] });
useQuery({ queryKey: ["exams", "info"] }); // 오타로 캐시 불일치
```

**이유:** factory 패턴(`examKeys.info()`)으로 중앙 관리하면 오타와 불일치를 방지할 수 있다.

### BAD: mutation 콜백에서 async/await 없이 비동기 처리

```typescript
// BAD - onSuccess 안에서 await 없이 비동기 작업
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: examKeys.info() }); // Promise 반환하지만 무시됨
}

// GOOD
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: examKeys.info() });
}
```

### BAD: isPending을 무시한 중복 제출

```typescript
// BAD - 중복 제출 방지 없음
<button onClick={() => submitMutation.mutate(payload)}>
  제출
</button>

// GOOD - isPending으로 중복 제출 방지
<button
  onClick={() => submitMutation.mutate(payload)}
  disabled={submitMutation.isPending}
>
  {submitMutation.isPending ? "제출 중..." : "답안 제출"}
</button>
```

---

## 7. Quick Reference

### 판단 기준

```
시험 정보 조회 → useQuery + examKeys.info()
답안 제출     → useMutation + examService.submitAnswers()
```

### 파일 구조

```
lib/
  api/
    client.ts           # apiFetch 공통 wrapper
    examService.ts      # API 서비스 함수
  types/
    exam.ts             # 타입 정의
  query-keys/
    examKeys.ts         # Query Key Factory

hooks/
  useExamInfoQuery.ts       # 시험 정보 조회 훅
  useSubmitExamMutation.ts  # 답안 제출 훅

providers/
  QueryProvider.tsx     # QueryClient 설정 + Provider
```

### 명명 규칙

| 유형 | 패턴 | 예시 |
| :--- | :--- | :--- |
| Query Hook | `use[Target]Query` | `useExamInfoQuery` |
| Mutation Hook | `use[Action]Mutation` | `useSubmitExamMutation` |
| Query Keys | `[feature]Keys` | `examKeys` |
| Service | `[feature]Service` | `examService` |
| 타입 | PascalCase | `ExamInfo`, `ExamSubmitRequest` |

---

## 8. PR Checklist

- [ ] 서버 호출이 `useQuery` 또는 `useMutation`으로 래핑되어 있는가?
- [ ] Query Key가 factory 패턴(`examKeys`)을 사용하는가?
- [ ] Query Key 값이 직렬화 가능한 primitive인가?
- [ ] Mutation에서 `isPending`을 활용하여 중복 제출을 방지하는가?
- [ ] 에러 상태(`isError`, `error`)에 대한 사용자 피드백이 존재하는가?
- [ ] 로딩 상태(`isLoading`, `isPending`)에 대한 UI 처리가 되어 있는가?
- [ ] Hook 네이밍이 규칙(`use[Target]Query`, `use[Action]Mutation`)을 따르는가?
- [ ] `apiFetch`를 통해 요청하고, 컴포넌트에서 직접 fetch를 호출하지 않는가?
- [ ] API base URL이 환경변수(`VITE_API_BASE_URL`)로 관리되는가?
- [ ] CORS 관련 이슈가 없는가? (백엔드 `localhost:3001` 설정 확인)
