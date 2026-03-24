# Performance Optimization Guidelines

React + Vite 모의고사 웹앱의 성능 최적화 가이드라인입니다.
18-27인치 터치스크린 환경에서의 빠른 반응 속도와 안정적인 렌더링을 목표로 합니다.

## Related Guides

- `.agents/list-rendering.md`: OMR 카드 등 대량 리스트, 가상화, 리렌더링 최적화를 다룰 때 참고
- `.agents/image.md`: 이미지 로딩과 LCP 최적화를 다룰 때 참고
- `.agents/server-request.md`: 캐시 전략, lazy fetch, staleTime 조정을 다룰 때 참고
- `.agents/animation-gesture.md`: 터치 인터랙션, 애니메이션 성능과 interaction cost를 같이 검토할 때 참고

---

## 1. 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **Measure First** | 최적화 전 반드시 측정 (추측하지 않기) |
| **Minimize Re-renders** | 불필요한 리렌더링 최소화 — OMR 카드, 타이머 등 빈번히 업데이트되는 영역 주의 |
| **Touch-First** | 터치 입력 지연 50ms 이내 목표, `touch-action` CSS 활용 |
| **Lazy Loading** | 필요할 때만 로드 — `React.lazy` + `Suspense` 기반 코드 스플리팅 |
| **Core Web Vitals** | LCP < 2.5s, INP < 200ms, CLS < 0.1 |

---

## 2. 터치스크린 앱 성능 고려사항

본 프로젝트는 18-27인치 터치스크린에서 동작하는 모의고사 앱입니다. 일반 웹앱과 다른 성능 특성을 갖습니다.

### 2.1 터치 반응 속도

```css
/* ✅ 터치 반응 최적화 — 300ms 딜레이 제거 */
html {
  touch-action: manipulation;
}

/* ✅ OMR 버튼 등 빈번한 터치 영역 — 탭 하이라이트 제거 */
.omr-button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}
```

### 2.2 OMR 카드 렌더링 성능

OMR 카드는 수십 개의 문항 버튼이 동시에 렌더링되므로 리렌더링 최적화가 핵심입니다.

```tsx
// ✅ Good — 개별 문항 상태 변경이 전체 OMR을 리렌더링하지 않도록 분리
const OMRItem = React.memo(({ questionNumber, selectedAnswer, onSelect }: OMRItemProps) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((choice) => (
        <button
          key={choice}
          className={selectedAnswer === choice ? "bg-accent" : "bg-surface"}
          onClick={() => onSelect(questionNumber, choice)}
        >
          {choice}
        </button>
      ))}
    </div>
  );
});

// 부모 컴포넌트에서 핸들러 안정화
const handleSelect = useCallback((questionNumber: number, choice: number) => {
  setAnswers((prev) => ({ ...prev, [questionNumber]: choice }));
}, []);
```

### 2.3 타이머 정확도

모의고사 타이머는 시각적 업데이트와 실제 시간 계산을 분리합니다.

```tsx
// ✅ Good — 기준 시간(ref)과 표시용 상태를 분리
const startTimeRef = useRef(Date.now());
const [displayTime, setDisplayTime] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setDisplayTime(Date.now() - startTimeRef.current);
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ❌ Bad — 매 tick마다 누적 계산 (드리프트 발생)
useEffect(() => {
  const interval = setInterval(() => {
    setTime((prev) => prev + 1);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

**타이머 컴포넌트 격리:** 타이머의 1초 간격 리렌더링이 주변 컴포넌트로 전파되지 않도록 별도 컴포넌트로 격리합니다.

```tsx
// ✅ 타이머를 독립 컴포넌트로 분리하여 리렌더링 범위 제한
const ExamTimer = React.memo(() => {
  const [displayTime, setDisplayTime] = useState(0);
  // ... 타이머 로직
  return <span className="font-mono text-lg">{formatTime(displayTime)}</span>;
});
```

---

## 3. React 최적화

### 3.1 React.memo

본 프로젝트에서는 OMR 카드 문항, 타이머 등 **빈번히 업데이트되는 영역에서 측정된 성능 이슈가 있을 때** React.memo를 적용합니다.

```tsx
// 성능 이슈가 측정된 경우에만 적용
const QuestionCard = React.memo(({ question, onAnswer }: QuestionCardProps) => {
  return <div>...</div>;
});

// 커스텀 비교 함수 (필요 시)
const QuestionCard = React.memo(
  ({ question, onAnswer }: QuestionCardProps) => {
    return <div>...</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.question.id === nextProps.question.id
      && prevProps.question.selectedAnswer === nextProps.question.selectedAnswer;
  },
);
```

### 3.2 useMemo

```tsx
// ✅ Good — 비용이 큰 계산 (O(n log n) 정렬, 필터링, 점수 집계 등)
const sortedQuestions = useMemo(
  () => questions.sort((a, b) => a.number - b.number),
  [questions],
);

const examScore = useMemo(
  () => calculateScore(answers, correctAnswers),
  [answers, correctAnswers],
);
```

**useMemo가 불필요한 경우:**
- 단순 boolean 비교 (`a !== null && !b`)
- Date 생성, 문자열 포맷팅 등 극히 저렴한 연산
- 단순 객체 리터럴 (React.memo 자식에 전달하지 않을 때)
- 간단한 산술 연산

### 3.3 useCallback

```tsx
// ✅ useEffect/useMemo 의존성 배열에 들어가는 함수
const fetchExamData = useCallback(async () => {
  const result = await examApi.getQuestions(examId);
  setQuestions(result);
}, [examId]);

useEffect(() => {
  fetchExamData();
}, [fetchExamData]);

// ✅ React.memo된 OMR 아이템에 전달하는 핸들러
const handleAnswerSelect = useCallback((questionId: number, answer: number) => {
  setAnswers((prev) => ({ ...prev, [questionId]: answer }));
}, []);
```

### 3.4 사용 기준

| Hook | 사용 시점 |
|------|----------|
| `React.memo` | OMR 카드 문항 등 빈번한 업데이트 영역에서 성능 이슈가 측정된 경우 |
| `useMemo` | 비용이 큰 계산 (O(n log n) 이상 정렬, 점수 계산, 결과 집계). 단순 연산에는 불필요 |
| `useCallback` | 의존성 배열에 들어가는 함수, React.memo된 자식에 전달하는 핸들러 |

---

## 4. Vite 빌드 최적화

### 4.1 코드 스플리팅 — React.lazy + Suspense

Vite는 동적 `import()`를 자동으로 별도 청크로 분리합니다. `React.lazy`와 `Suspense`를 조합하여 라우트 수준 코드 스플리팅을 적용합니다.

```tsx
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// ✅ 라우트 수준 코드 스플리팅
const ExamPage = lazy(() => import("./pages/ExamPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const OMRCardPage = lazy(() => import("./pages/OMRCardPage"));

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/exam/:id" element={<ExamPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/omr/:id" element={<OMRCardPage />} />
      </Routes>
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
    </div>
  );
}
```

### 4.2 vite.config.ts — 번들 최적화

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // 청크 사이즈 경고 임계값 (KB)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 벤더 라이브러리를 별도 청크로 분리
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "tanstack-query": ["@tanstack/react-query"],
        },
      },
    },
    // 프로덕션 빌드에서 sourcemap 비활성화 (번들 크기 감소)
    sourcemap: false,
    // minify 옵션 (esbuild가 기본값, terser는 더 작은 번들)
    minify: "esbuild",
  },
});
```

### 4.3 번들 분석 — rollup-plugin-visualizer

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
    }),
  ],
});
```

```bash
# 번들 분석 실행
npm run build
# dist/stats.html 파일이 생성됨
```

### 4.4 Dynamic Import — 대형 라이브러리

> **중요:** xlsx 등 대형 라이브러리(~1MB 이상)는 사용 시점에 동적 import하여 초기 번들 크기를 줄입니다. Vite가 자동으로 별도 청크로 분리합니다.

```tsx
// ❌ Bad — 대형 라이브러리를 정적 import (~1MB가 메인 번들에 포함)
import * as XLSX from "xlsx";

// ✅ Good — 사용 시점에 동적 import (Vite가 별도 청크로 분리)
const handleExport = async () => {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  // ...
};
```

### 4.5 Import 최적화

```tsx
// ❌ Bad — lodash 사용 금지
import _ from "lodash";

// ✅ Good — es-toolkit 사용 (향후 도입 검토)
// import { debounce } from "es-toolkit";

// ✅ Good — date-fns named import + locale
import { format, parse, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";

format(new Date(), "yyyy-MM-dd");
format(date, "M월 d일 (EEE)", { locale: ko });
```

**Vite의 Tree-shaking:** Vite는 Rollup 기반으로 ES 모듈의 tree-shaking을 자동 수행합니다. named import를 사용하면 사용하지 않는 코드가 번들에서 제거됩니다.

### 4.6 Vite 개발 서버 최적화

```typescript
// vite.config.ts — 개발 서버 성능
export default defineConfig({
  server: {
    // HMR 웹소켓 설정 (터치스크린 디바이스 개발 시)
    hmr: true,
  },
  // 의존성 사전 번들링 — 자주 사용하는 라이브러리를 미리 번들링
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-query",
    ],
  },
});
```

---

## 5. 캐싱 전략 (TanStack Query)

### 5.1 글로벌 기본값 (QueryProvider.tsx)

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5분 — 데이터가 "신선"한 기간
      gcTime: 1000 * 60 * 10,        // 10분 — 미사용 캐시 가비지 컬렉션
      refetchOnWindowFocus: false,    // 터치스크린에서 불필요한 refetch 방지
      retry: (failureCount, error) => {
        if (error instanceof ServerError && error.status < 500) return false;
        return failureCount < 2;
      },
      throwOnError: (error, query) => {
        return query.meta?.critical === true;
      },
    },
    mutations: {
      onError: (error) => {
        // 글로벌 mutation 에러 핸들러 (i18n 기반 toast 표시)
      },
    },
  },
});
```

### 5.2 모의고사 데이터 캐싱 전략

```tsx
// ✅ 시험 문제 데이터 — 시험 중 변하지 않으므로 긴 캐시
useQuery({
  queryKey: examKeys.questions(examId),
  queryFn: () => examApi.getQuestions(examId),
  staleTime: 1000 * 60 * 60,  // 1시간 (시험 중 문제는 변하지 않음)
  gcTime: 1000 * 60 * 60,     // 1시간
});

// ✅ 시험 목록 — 기본값 사용
useQuery({
  queryKey: examKeys.list(),
  queryFn: () => examApi.getList(),
  // staleTime/gcTime: 글로벌 기본값(5분/10분) 사용
});
```

### 5.3 개별 쿼리 오버라이드

> 글로벌 기본값과 동일한 설정은 개별 쿼리에서 중복하지 않습니다. 데이터 특성에 맞게 오버라이드가 필요한 경우에만 설정합니다.

```tsx
// ❌ Bad — 글로벌 기본값과 동일한 설정 중복
useQuery({
  queryKey: examKeys.list(),
  queryFn: examApi.getList,
  staleTime: 1000 * 60 * 5,  // ← 글로벌과 동일, 제거해야 함
});
```

### 5.4 캐시 무효화 패턴

```tsx
const submitAnswerMutation = useMutation({
  mutationFn: (data) => examApi.submitAnswer(examId, data),
  onSuccess: (updatedData) => {
    // 결과 쿼리 무효화 (refetch 트리거)
    queryClient.invalidateQueries({ queryKey: examKeys.results() });
    // 상세 쿼리는 즉시 업데이트 (네트워크 요청 없음)
    queryClient.setQueryData(
      examKeys.detail(examId),
      updatedData,
    );
  },
});
```

### 5.5 Prefetch — 페이지 전환 최적화

터치스크린 앱에서 페이지 전환 시 로딩 지연을 줄이기 위해 `prefetchQuery`를 활용합니다.

```tsx
// ✅ 시험 목록에서 특정 시험 터치 시 문제 데이터 prefetch
const handleExamTouch = (examId: string) => {
  queryClient.prefetchQuery({
    queryKey: examKeys.questions(examId),
    queryFn: () => examApi.getQuestions(examId),
    staleTime: 1000 * 60 * 60,
  });
  navigate(`/exam/${examId}`);
};
```

---

## 6. 리렌더링 디버깅

### 6.1 Chrome DevTools

```bash
# Chrome에서 React Developer Tools 확장 설치
# Components 탭 → Settings (톱니바퀴) → Highlight updates 활성화
```

### 6.2 React DevTools Profiler

```bash
# React Developer Tools → Profiler 탭
# 1. Record 버튼 클릭
# 2. 앱 인터랙션 수행 (OMR 선택, 페이지 전환 등)
# 3. Stop 버튼 클릭
# 4. 각 컴포넌트의 렌더링 시간 및 원인 분석
```

### 6.3 커스텀 Hook (참고용 코드)

> **Note:** 아래는 디버깅 참고용 코드입니다. 프로젝트에 포함되어 있지 않으며, 리렌더링 원인 분석이 필요할 때 임시로 사용할 수 있습니다.

```tsx
import { useEffect, useRef } from "react";

export const useWhyDidYouUpdate = (name: string, props: Record<string, any>) => {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, any> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log(`[WhyDidYouUpdate] ${name}`, changedProps);
      }
    }

    previousProps.current = props;
  });
};
```

---

## 7. 리스트 최적화

### 7.1 가상화 (@tanstack/react-virtual)

> **현재 프로젝트 현황:** 미설치. OMR 카드의 문항 수가 일반적으로 수십~수백 건이므로 가상화가 당장 필요하지 않을 수 있음. 대량 문항(200건 이상) 렌더링이 필요해지면 도입 검토.

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export function VirtualizedOMR({ questions }: { questions: Question[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <OMRItem question={questions[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 7.2 리스트 렌더링 패턴

**key prop 규칙:**

> **중요:** 리스트의 key에는 반드시 고유 식별자(id)를 사용합니다. `key={index}`는 아이템 추가/삭제/정렬 시 불필요한 리렌더링과 상태 버그를 유발하므로 금지합니다.

```tsx
// ❌ Bad — index를 key로 사용
{questions.map((question, index) => (
  <OMRItem key={index} question={question} />
))}

// ✅ Good — 고유 ID를 key로 사용
{questions.map((question) => (
  <OMRItem key={question.id} question={question} />
))}
```

> **예외:** Skeleton 로딩 UI 등 정적 리스트에서는 `key={i}`가 허용됩니다.

---

## 8. 측정 도구

| 도구 | 용도 | 현황 |
|------|------|------|
| **Chrome DevTools** | Performance 탭, Network 탭, Lighthouse | 사용 가능 |
| **React DevTools** | Components Profiler, 리렌더링 분석 | 사용 가능 |
| **rollup-plugin-visualizer** | Vite 번들 사이즈 분석 | 미설치 (필요 시 도입) |
| **Lighthouse** | Core Web Vitals 측정 | 사용 가능 |
| **Chrome Performance Monitor** | 실시간 FPS, CPU, DOM 노드 수 모니터링 | 사용 가능 — 터치 반응 속도 확인에 유용 |
| **vite-plugin-inspect** | Vite 플러그인 파이프라인 디버깅 | 미설치 (빌드 이슈 시 도입) |

### Chrome DevTools 사용법

```bash
# Performance 탭 — OMR 터치 반응 성능 측정
1. F12로 DevTools 열기
2. Performance 탭 선택
3. Record 버튼 클릭 후 OMR 버튼 연속 터치
4. Main 스레드의 Long Tasks (50ms 이상) 확인
5. Interaction 섹션에서 INP 확인

# Performance Monitor — 실시간 모니터링
1. F12 → Ctrl+Shift+P → "Show Performance Monitor"
2. FPS, CPU usage, DOM Nodes 실시간 확인
3. OMR 카드 스크롤 시 FPS 드롭 여부 확인
```

---

## 9. Anti-Patterns

### 9.1 상태 관리

```tsx
// ❌ 전체 답안을 하나의 상태로 관리하면서 개별 문항 변경 시 전체 리렌더링 유발
const [examState, setExamState] = useState({
  answers: {},
  timer: 0,
  currentPage: 0,
  // ... 모든 상태가 하나의 객체
});

// ✅ 관심사별로 상태 분리
const [answers, setAnswers] = useState<Record<number, number>>({});
const [currentPage, setCurrentPage] = useState(0);
// 타이머는 별도 컴포넌트로 격리
```

### 9.2 불필요한 리렌더링

```tsx
// ❌ 컴포넌트 내부에서 매 렌더마다 새 객체/배열 생성 후 자식에 전달
function ExamPage() {
  const config = { showTimer: true, allowSkip: false };  // 매번 새 참조
  return <ExamContent config={config} />;
}

// ✅ 상수는 컴포넌트 밖으로, 동적이면 useMemo
const DEFAULT_CONFIG = { showTimer: true, allowSkip: false };

function ExamPage() {
  return <ExamContent config={DEFAULT_CONFIG} />;
}
```

### 9.3 Vite 빌드

```tsx
// ❌ 모든 페이지를 정적 import — 초기 번들에 전부 포함
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";

// ✅ React.lazy로 라우트별 코드 스플리팅
const ExamPage = lazy(() => import("./pages/ExamPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
```

### 9.4 타이머

```tsx
// ❌ setInterval 누적 계산 — 탭 비활성화 시 드리프트
setInterval(() => setTime((t) => t + 1), 1000);

// ❌ requestAnimationFrame으로 1초 타이머 구현 — 불필요한 CPU 사용
function tick() {
  setTime(Date.now() - start);
  requestAnimationFrame(tick);
}

// ✅ setInterval + 기준 시간 비교 — 정확하고 효율적
const startRef = useRef(Date.now());
setInterval(() => setDisplayTime(Date.now() - startRef.current), 1000);
```

---

## Quick Reference

### 메모이제이션 체크리스트

```tsx
// React.memo — OMR 문항 등 빈번한 업데이트 영역에서 측정된 성능 이슈 시
export const OMRItem = React.memo(({ ... }) => { ... });

// useMemo — 비용이 큰 계산 (정렬, 점수 계산, 결과 집계)
const value = useMemo(() => calculateScore(answers, key), [answers, key]);

// useCallback — 의존성 배열 함수, React.memo 자식에 전달하는 핸들러
const handler = useCallback(() => { ... }, [deps]);
```

### Vite 코드 스플리팅

```tsx
// 라우트 수준 — React.lazy + Suspense
const Page = lazy(() => import("./pages/Page"));

// 대형 라이브러리 — 사용 시점 동적 import
const lib = await import("heavy-library");
```

### Core Web Vitals 목표

| 메트릭 | 좋음 | 개선 필요 |
|--------|------|----------|
| LCP | < 2.5s | > 4.0s |
| INP | < 200ms | > 500ms |
| CLS | < 0.1 | > 0.25 |

### 터치스크린 성능 목표

| 항목 | 목표 |
|------|------|
| 터치 응답 지연 | < 50ms |
| OMR 버튼 선택 피드백 | < 100ms |
| 페이지 전환 | < 300ms |
| 타이머 표시 오차 | < 1초 |

---

## PR Checklist

- [ ] 불필요한 리렌더링이 없는가? (특히 OMR 카드, 타이머 영역)
- [ ] 무거운 계산(점수 집계, 정렬 등)이 메모이제이션 되어 있는가?
- [ ] 리스트의 key에 고유 식별자(id)를 사용하고 있는가? (index 사용 금지)
- [ ] CLS를 유발하는 레이아웃 시프트가 없는가?
- [ ] React.lazy로 라우트 수준 코드 스플리팅이 적용되어 있는가?
- [ ] 대형 라이브러리(xlsx 등)가 사용 시점에 동적 import 되는가?
- [ ] 터치 반응 최적화가 적용되어 있는가? (`touch-action: manipulation`)
- [ ] 타이머가 기준 시간 비교 방식으로 구현되어 있는가? (누적 계산 금지)
- [ ] 대용량 리스트가 있다면 가상화를 검토했는가? (@tanstack/react-virtual)
- [ ] Vite 번들 분석을 실행하여 불필요한 청크가 없는가?
