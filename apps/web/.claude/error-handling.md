# Error Handling Guidelines (Defense in Depth)

모의고사 웹앱(React + Vite)에서의 에러 처리 전략을 정의합니다. **계층적 방어 전략**을 적용하여 에러를 포착합니다.

- **Layer 1:** 데이터 및 로직 (Validation, API, Mutations)
- **Layer 2:** 네트워크 (fetch wrapper)
- **Layer 3:** 렌더링 (React Error Boundary)

## Related Guides

- `.claude/server-request.md`: API 응답 검증, Query/Mutation 에러 흐름을 함께 다룰 때 참고
- `.claude/logging.md`: 에러 로깅 수준과 민감 정보 처리 기준을 맞출 때 참고
- `.claude/modal-dialog.md`: Alert/Toast 등 사용자 피드백 UI를 연결할 때 참고

---

## 에러 분류

모의고사 웹앱에서 발생할 수 있는 에러를 세 가지로 분류합니다.

### 1. 네트워크 에러

서버에 도달하지 못하거나 응답을 받지 못하는 경우입니다.

| 상황 | 원인 | 처리 전략 |
| --- | --- | --- |
| 시험 데이터 로드 실패 | 인터넷 연결 끊김, 서버 다운 | 재시도 버튼이 있는 에러 UI 표시 |
| 답안 제출 중 네트워크 끊김 | Wi-Fi 불안정, 모바일 환경 | 제출 실패 안내 + 재시도 유도 |
| 요청 타임아웃 | 서버 과부하, 느린 네트워크 | 일정 횟수 자동 재시도 후 수동 재시도 안내 |

### 2. API 에러

서버에 도달했으나 비정상 응답(4xx, 5xx)을 받은 경우입니다.

| 상황 | 원인 | 처리 전략 |
| --- | --- | --- |
| `GET /api/exams` 실패 (404) | 잘못된 엔드포인트, 시험 미존재 | 에러 메시지 표시, 목록으로 이동 안내 |
| `GET /api/exams` 실패 (500) | 서버 내부 오류 | 재시도 버튼 표시 |
| `POST /api/exams/submit` 실패 (400) | 유효하지 않은 답안 데이터 | 입력값 재확인 안내 |
| `POST /api/exams/submit` 실패 (500) | 서버 처리 오류 | 재시도 안내 + 답안 데이터 보존 |

### 3. 클라이언트 에러

브라우저에서 발생하는 JavaScript 런타임 에러입니다.

| 상황 | 원인 | 처리 전략 |
| --- | --- | --- |
| 렌더링 에러 | 컴포넌트 내 예외 발생 | Error Boundary로 포착, 폴백 UI 표시 |
| 상태 관리 오류 | 잘못된 상태 업데이트 | 콘솔 로깅 + 안전한 기본값 폴백 |
| JSON 파싱 실패 | 비정상 응답 형식 | try-catch로 포착, 에러 메시지 표시 |

---

## Layer 1: 데이터 및 로직 (Predictable Errors)

### Validation

서버 응답은 서비스 레이어에서 `zod`를 통해 검증합니다.

- 스키마 위치: `features/[feature]/model/schema.ts`
- 검증 실패 시: `throw new Error("응답 데이터 형식이 올바르지 않습니다")`

### API Errors (Query)

컴포넌트 내에서 query fetcher에 `try-catch`를 사용하지 않습니다. TanStack Query가 에러 상태(`isError`, `error`)를 관리합니다.

```typescript
// 시험 데이터 조회 - Query가 에러 상태를 관리
const { data, isError, error, refetch } = useQuery({
  queryKey: ['exams'],
  queryFn: () => api.get<Exam[]>('/api/exams'),
});

if (isError) {
  return <ErrorFallback error={error} onRetry={refetch} />;
}
```

### Mutations

`useMutation`의 `onError` 콜백에서 사용자 피드백(Toast/Alert)을 제공합니다.

```typescript
// 답안 제출 - Mutation 에러 처리
const submitMutation = useMutation({
  mutationFn: (answers: SubmitPayload) =>
    api.post('/api/exams/submit', answers),
  onSuccess: () => {
    showSuccess('답안이 제출되었습니다.');
  },
  onError: (error) => {
    showError('답안 제출에 실패했습니다. 다시 시도해주세요.');
    console.error('SubmitFailed', error);
  },
});
```

---

## Layer 2: 네트워크 에러 (Fetch Wrapper)

`lib/remote/api.ts`의 fetch wrapper에서 서버 응답을 검증하고 에러를 throw합니다.

### 구현

> 아래는 핵심 로직만 보여주는 단순화된 예시입니다. 실제 코드에서는 추가적인 에러 변환 로직이 포함됩니다.

```typescript
// lib/remote/api.ts (단순화된 예시)
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError({
      status: res.status,
      message: body.message || 'UNKNOWN_ERROR',
    });
  }

  const json = await res.json();
  return json.data;
}
```

### Retry 전략 (QueryClient 설정)

```typescript
// providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 4xx 에러는 재시도하지 않음 (클라이언트 잘못)
        if (error instanceof ApiError && error.status < 500) {
          return false;
        }
        // 5xx, 네트워크 에러는 최대 2회 재시도
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});
```

---

## Layer 3: React Error Boundary (렌더링 에러)

React + Vite 환경에서는 `react-error-boundary` 라이브러리를 사용하여 컴포넌트 렌더링 에러를 포착합니다.

### 전역 Error Boundary

앱 최상위에 배치하여 예상치 못한 렌더링 에러를 포착합니다.

```tsx
// components/AppErrorBoundary.tsx
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-lg font-semibold">
        문제가 발생했습니다
      </h2>
      <p className="text-sm text-gray-600">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={(error, info) => {
        console.error('ErrorBoundary caught:', error, info.componentStack);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### App 진입점 적용

```tsx
// App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { AppErrorBoundary } from './components/AppErrorBoundary';

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* 라우터 또는 메인 컴포넌트 */}
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
```

### Feature별 Error Boundary

특정 영역의 에러가 전체 앱을 다운시키지 않도록 세분화된 Error Boundary를 적용합니다.

```tsx
// 시험 화면에서 부분적 에러 격리
import { ErrorBoundary } from 'react-error-boundary';

function ExamPage() {
  return (
    <div>
      <h1>모의고사</h1>
      <ErrorBoundary
        fallback={<div className="p-4 text-red-600">문제 목록을 표시할 수 없습니다.</div>}
      >
        <QuestionList />
      </ErrorBoundary>
      <ErrorBoundary
        fallback={<div className="p-4 text-red-600">타이머를 표시할 수 없습니다.</div>}
      >
        <ExamTimer />
      </ErrorBoundary>
    </div>
  );
}
```

---

## TanStack Query 에러 처리

### Query 에러 처리 패턴

```tsx
// 시험 목록 조회 컴포넌트
function ExamList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.get<Exam[]>('/api/exams'),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 p-6">
        <p className="text-red-600">시험 목록을 불러오지 못했습니다.</p>
        <button onClick={() => refetch()} className="text-blue-600 underline">
          다시 시도
        </button>
      </div>
    );
  }

  return <ExamCards exams={data} />;
}
```

### Mutation 에러 처리 패턴

```tsx
// 답안 제출 컴포넌트
function SubmitButton({ answers }: { answers: AnswerMap }) {
  const submitMutation = useMutation({
    mutationFn: (payload: SubmitPayload) =>
      api.post('/api/exams/submit', payload),
    onSuccess: (result) => {
      showSuccess('답안이 제출되었습니다.');
      // 결과 페이지로 이동
    },
    onError: (error) => {
      showError('답안 제출에 실패했습니다. 다시 시도해주세요.');
      console.error('SubmitExamFailed', error);
    },
  });

  return (
    <button
      onClick={() => submitMutation.mutate({ answers })}
      disabled={submitMutation.isPending}
    >
      {submitMutation.isPending ? '제출 중...' : '답안 제출'}
    </button>
  );
}
```

### QueryProvider 전역 에러 처리

`QueryProvider`에서 전역 mutation 에러를 처리합니다.

```typescript
// providers/QueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error) => {
        if (error instanceof ApiError) {
          showError(getErrorMessage(error));
        } else {
          showError('알 수 없는 오류가 발생했습니다.');
          console.error('UnknownMutationError', error);
        }
      },
    },
  },
});
```

---

## 사용자 친화적 에러 UI 가이드라인

### 에러 메시지 작성 원칙

| 원칙 | 나쁜 예 | 좋은 예 |
| --- | --- | --- |
| 기술 용어 배제 | "500 Internal Server Error" | "일시적인 오류가 발생했습니다" |
| 해결 방법 제시 | "네트워크 에러" | "인터넷 연결을 확인하고 다시 시도해주세요" |
| 구체적 상황 안내 | "오류 발생" | "시험 목록을 불러오지 못했습니다" |
| 에러 코드 노출 금지 | "EXAM_NOT_FOUND" | "요청한 시험을 찾을 수 없습니다" |

### 에러 UI 컴포넌트 구성

```tsx
// components/ErrorFallback.tsx
interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

function ErrorFallback({
  title = '문제가 발생했습니다',
  message = '잠시 후 다시 시도해주세요.',
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
```

### 시나리오별 에러 UI

| 시나리오 | UI 처리 |
| --- | --- |
| 시험 데이터 로드 실패 | 전체 화면 에러 + 재시도 버튼 |
| 개별 문항 렌더링 실패 | 해당 문항만 에러 표시, 나머지 정상 표시 |
| 답안 제출 실패 | Toast 알림 + 재시도 버튼 활성화 (답안 데이터 유지) |
| 네트워크 끊김 | 상단 배너로 오프라인 상태 안내 |

---

## Anti-Patterns

### 1. 빈 catch 블록

```typescript
// BAD: 에러를 삼킴
try {
  await submitAnswers(data);
} catch (e) {}

// GOOD: 최소한 로깅
try {
  await submitAnswers(data);
} catch (e) {
  console.error('SubmitFailed', e);
  showError('답안 제출에 실패했습니다.');
}
```

**예외**: localStorage 파싱, JSON.parse 등 의도적 폴백 패턴에서는 주석과 함께 빈 catch 허용:

```typescript
try {
  const saved = JSON.parse(localStorage.getItem('draft') ?? '');
  if (saved) return saved;
} catch { /* intentional fallback to default */ }
```

### 2. Query fetcher에 try-catch 감싸기

```typescript
// BAD: TanStack Query의 에러 관리를 방해
const fetchExams = async () => {
  try {
    return await api.get('/api/exams');
  } catch (e) {
    console.error(e);
    return []; // 빈 배열 반환으로 에러 은폐
  }
};

// GOOD: 에러를 그대로 throw하여 Query가 관리
const fetchExams = async () => {
  return api.get<Exam[]>('/api/exams');
};
```

### 3. 이중 에러 피드백

```typescript
// BAD: 전역 onError + 로컬 onError에서 각각 toast -> 이중 표시
const mutation = useMutation({
  mutationFn: submitAnswers,
  onError: () => {
    showError('제출 실패'); // QueryProvider 전역 onError도 toast 표시 -> 이중!
  },
});

// GOOD: 전역 핸들러에 위임하거나, 전역을 비활성화하고 로컬에서만 처리
const mutation = useMutation({
  mutationFn: submitAnswers,
  // onError를 지정하면 전역 onError는 호출되지 않음 (TanStack Query v5 동작)
  // 또는 전역에 위임하고 여기서는 상태 정리만 수행
});
```

### 4. 에러 코드 직접 노출

```typescript
// BAD: 서버 에러 코드를 사용자에게 그대로 노출
catch (e) {
  showError(e.message); // -> "EXAM_NOT_FOUND" 가 사용자에게 표시됨
}

// GOOD: 사용자 친화적 메시지로 변환
catch (e) {
  showError('요청한 시험을 찾을 수 없습니다.');
}
```

### 5. mutateAsync + try-catch에서 이중 토스트

`QueryProvider`의 전역 `mutations.onError`가 이미 에러 toast를 표시하는 경우, `mutateAsync` + `try-catch`의 catch 블록에서 추가로 `showError`를 호출하면 이중 토스트가 발생합니다.

```typescript
// BAD: 이중 토스트 발생
try {
  await submitMutation.mutateAsync(data);
  showSuccess('제출 완료');
} catch {
  showError('제출 실패'); // 전역 onError도 toast -> 이중!
}

// GOOD: catch에서는 상태 정리만, toast는 전역에 위임
try {
  await submitMutation.mutateAsync(data);
  showSuccess('제출 완료');
} catch (error) {
  console.error('SubmitFailed', error);
  // 전역 onError가 이미 toast를 표시하므로 showError 호출하지 않음
}
```

**`mutate()` vs `mutateAsync` 선택 기준:**
- **에러 후 추가 로직 불필요:** `mutate()` 사용 (전역 핸들러에 완전 위임, try-catch 불필요)
- **에러 후 상태 정리 필요:** `mutateAsync` + `try-catch` (catch에서 로깅 + 상태 정리만, `showError` 금지)

---

## Quick Reference

| Layer | 범위 | 핸들러 | 사용자 피드백 |
| --- | --- | --- | --- |
| 1 | Validation, API, Mutations | TanStack Query (`isError`, `onError`) | Toast, 인라인 에러 UI |
| 2 | 네트워크 에러 | fetch wrapper (`api.ts`) | 재시도 안내 |
| 3 | React 컴포넌트 렌더링 에러 | `react-error-boundary` | 폴백 UI + 재시도 버튼 |

### try-catch 사용 기준

```
Query fetcher 함수         -> try-catch 사용하지 않음 (Query가 관리)
mutateAsync 호출           -> try-catch 사용 (catch에서 상태 정리, toast는 전역 위임)
일반 async 함수            -> try-catch 필수
이벤트 핸들러 내 비동기    -> try-catch 필수
JSON.parse 등 파싱         -> try-catch (폴백 처리)
```

---

## PR Checklist

새로운 기능이나 에러 처리 코드를 PR에 포함할 때 아래 항목을 확인합니다.

- [ ] Query의 `isError` 상태에 대한 에러 UI가 구현되어 있는가
- [ ] Mutation에 `onError` 콜백 또는 전역 에러 핸들러가 적용되어 있는가
- [ ] 빈 catch 블록이 없는가 (의도적 폴백은 주석으로 명시)
- [ ] 에러 메시지가 사용자 친화적인가 (기술 용어, 에러 코드 노출 금지)
- [ ] 이중 토스트가 발생하지 않는가 (전역 onError + 로컬 onError 중복 확인)
- [ ] 네트워크 에러 시 재시도 방법이 제공되는가
- [ ] Error Boundary가 필요한 영역에 적용되어 있는가
- [ ] 에러 발생 시에도 사용자 데이터(작성 중인 답안 등)가 보존되는가
- [ ] 에러 상황에서 console.error로 디버깅에 필요한 정보가 로깅되는가
