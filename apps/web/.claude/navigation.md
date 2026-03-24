# Navigation Guidelines

React Router v6 기반의 모의고사 웹앱 라우팅 및 네비게이션 가이드라인입니다.

## Related Guides

- `./screen-layout.md`: 페이지 구조, 레이아웃 컴포넌트, 전체 화면 배치 설계 시 참고
- `./error-handling.md`: ErrorBoundary, API 에러 처리 패턴을 다룰 때 참고
- `./state-management.md`: 페이지 간 상태 전달, 전역 상태 관리 패턴 참고
- `./server-request.md`: TanStack Query를 이용한 API 호출, 로딩/에러 상태 처리 참고

---

## 1. Tech Stack

| 기능 | 솔루션 |
| --- | --- |
| 라우팅 | React Router v6 (`createBrowserRouter`, `RouterProvider`) |
| 클라이언트 네비게이션 | `useNavigate`, `Link`, `NavLink` |
| URL 파라미터 | `useParams` |
| 쿼리 스트링 | `useSearchParams` |
| 현재 경로 확인 | `useLocation` |
| 라우트 데이터 로딩 | TanStack Query (`useQuery`, `useSuspenseQuery`) |
| 코드 분할 | `React.lazy` + `Suspense` |

---

## 2. Directory Structure

```
src/
├── main.tsx                    # ReactDOM.createRoot + RouterProvider
├── router.tsx                  # createBrowserRouter 정의
│
├── layouts/
│   └── RootLayout.tsx          # 공통 레이아웃 (QueryProvider 체인 + Outlet)
│
├── pages/
│   ├── TutorialPage.tsx        # / (튜토리얼 & 학생 정보 입력)
│   ├── ExamPage.tsx            # /exam (OMR 카드 답안 마킹)
│   └── ResultPage.tsx          # /result (채점 결과 확인)
│
├── components/                 # 재사용 가능한 UI 컴포넌트
│   ├── tutorial/               # 튜토리얼 관련 컴포넌트
│   ├── exam/                   # OMR 카드, 답안 마킹 관련 컴포넌트
│   └── result/                 # 결과 표시 관련 컴포넌트
│
├── hooks/                      # 커스텀 훅
├── lib/                        # 유틸리티, API 클라이언트
│   └── api.ts                  # fetch wrapper (GET /api/exams, POST /api/exams/submit)
│
└── providers/
    └── QueryProvider.tsx       # TanStack Query provider
```

> **Note:** 이 프로젝트는 인증/로그인이 없으며, 3단계 단방향 흐름(튜토리얼 -> 시험 -> 결과)을 따릅니다.

---

## 3. 라우트 정의

### 3.1 createBrowserRouter 패턴

```tsx
// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import TutorialPage from "./pages/TutorialPage";
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <TutorialPage />,
      },
      {
        path: "/exam",
        element: <ExamPage />,
      },
      {
        path: "/result",
        element: <ResultPage />,
      },
    ],
  },
]);
```

### 3.2 RouterProvider 마운트

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

> **Note:** `BrowserRouter` + `Routes` 패턴 대신 `createBrowserRouter` + `RouterProvider` 패턴을 사용합니다. 이 방식이 React Router v6의 권장 패턴이며, 레이아웃 라우트와 데이터 로딩 기능을 더 잘 지원합니다.

### 3.3 라우트 구조 요약

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | `TutorialPage` | 튜토리얼 안내 + 학생 정보 입력 (이름, 학교, 학년, 수험번호, 좌석번호) |
| `/exam` | `ExamPage` | OMR 카드 형태의 답안 마킹 (객관식 14문제, 주관식 11문제) |
| `/result` | `ResultPage` | 채점 결과 확인 (점수, 정답/오답/미응답 수, 문항별 결과) |

---

## 4. 레이아웃 라우트

### 4.1 RootLayout과 Outlet

레이아웃 라우트는 `path` 없이 `element`만 지정하여, 자식 라우트들이 공유하는 공통 UI를 정의합니다.

```tsx
// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import QueryProvider from "../providers/QueryProvider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <div className="min-h-screen">
        <main>
          <Outlet />
        </main>
      </div>
    </QueryProvider>
  );
}
```

> **Note:** `Outlet`은 현재 활성화된 자식 라우트의 컴포넌트를 렌더링합니다. Next.js의 `{children}`과 유사한 역할입니다.

### 4.2 중첩 레이아웃

특정 라우트 그룹에만 적용되는 레이아웃이 필요할 경우, 중첩 라우트를 활용합니다.

```tsx
// 예시: 시험 진행 중 전용 레이아웃이 필요한 경우
{
  element: <ExamLayout />,     // 시험 전용 레이아웃 (타이머, 진행률 등)
  children: [
    { path: "/exam", element: <ExamPage /> },
    { path: "/result", element: <ResultPage /> },
  ],
}
```

---

## 5. 네비게이션 패턴

### 5.1 useNavigate (프로그래매틱 네비게이션)

이 프로젝트의 핵심 네비게이션 패턴입니다. 각 단계 완료 시 다음 단계로 이동합니다.

```tsx
import { useNavigate } from "react-router-dom";

function TutorialPage() {
  const navigate = useNavigate();

  const handleStartExam = () => {
    // 튜토리얼 완료 후 시험 페이지로 이동
    navigate("/exam");
  };

  return <button onClick={handleStartExam}>시험 시작</button>;
}
```

#### useNavigate 주요 옵션

```tsx
const navigate = useNavigate();

// 기본 이동
navigate("/exam");

// 히스토리 대체 (뒤로가기 시 이전 페이지로 돌아가지 않음)
// 결과 페이지에서 시험 페이지로 돌아가는 것을 방지할 때 유용
navigate("/result", { replace: true });

// state 전달 (URL에 노출되지 않는 데이터)
navigate("/result", {
  state: { submittedAnswers: answers, studentInfo: info },
});

// 상대 경로 이동
navigate(-1); // 뒤로가기
navigate(1);  // 앞으로가기
```

### 5.2 Link 컴포넌트

```tsx
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/">튜토리얼</Link>
      <Link to="/exam">시험 응시</Link>

      {/* replace: 히스토리 대체 */}
      <Link to="/" replace>
        처음으로
      </Link>

      {/* state 전달 */}
      <Link to="/exam" state={{ fromTutorial: true }}>
        시험 시작
      </Link>
    </nav>
  );
}
```

### 5.3 useLocation (현재 경로 및 state 접근)

```tsx
import { useLocation } from "react-router-dom";

function ResultPage() {
  const location = useLocation();

  // navigate의 state로 전달된 데이터 접근
  const { submittedAnswers } = location.state ?? {};

  // location 객체 구조
  // location.pathname  -> "/result"
  // location.search    -> "?tab=detail"
  // location.hash      -> "#summary"
  // location.state     -> navigate에서 전달한 state
  // location.key       -> 고유 키
}
```

### 5.4 useSearchParams

결과 페이지에서 탭 전환 등 URL 기반 상태 관리가 필요할 때 사용할 수 있습니다.

```tsx
import { useSearchParams } from "react-router-dom";

function ResultPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "summary";

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  return (
    <div>
      <button onClick={() => handleTabChange("summary")}>요약</button>
      <button onClick={() => handleTabChange("detail")}>상세</button>
    </div>
  );
}
```

---

## 6. 단계 간 데이터 전달 패턴

모의고사 앱의 3단계 흐름에서 데이터를 전달하는 권장 패턴입니다.

### 6.1 navigate state 활용

```tsx
// TutorialPage -> ExamPage: 학생 정보 전달
function TutorialPage() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    school: "",
    grade: 0,
    studentNumber: 0,
    seatNumber: 0,
  });

  const handleStart = () => {
    navigate("/exam", { state: { studentInfo } });
  };
}

// ExamPage -> ResultPage: 제출 결과 전달
function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentInfo } = location.state ?? {};

  const handleSubmit = async (answers: Answer[]) => {
    const result = await submitExam({ ...studentInfo, answers });
    navigate("/result", { state: { result }, replace: true });
  };
}
```

### 6.2 state 유효성 검사

페이지 새로고침 시 `location.state`는 유지되지만, URL 직접 접근 시에는 `null`입니다. 반드시 유효성 검사를 수행하세요.

```tsx
function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 학생 정보 없이 직접 접근한 경우 튜토리얼로 리다이렉트
    if (!location.state?.studentInfo) {
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);
}
```

---

## 7. 코드 분할 (Lazy Loading)

페이지 컴포넌트를 지연 로딩하여 초기 번들 크기를 줄입니다.

```tsx
// src/router.tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";

const TutorialPage = lazy(() => import("./pages/TutorialPage"));
const ExamPage = lazy(() => import("./pages/ExamPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));

function LazyPage({ Component }: { Component: React.LazyExoticComponent<() => JSX.Element> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LazyPage Component={TutorialPage} /> },
      { path: "/exam", element: <LazyPage Component={ExamPage} /> },
      { path: "/result", element: <LazyPage Component={ResultPage} /> },
    ],
  },
]);
```

> **Note:** 이 프로젝트는 3페이지뿐이므로 lazy loading이 필수는 아닙니다. 번들 크기가 커질 경우에만 도입을 고려하세요.

---

## 8. 404 및 에러 처리

### 8.1 Not Found (404) 페이지

```tsx
// src/router.tsx
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <TutorialPage /> },
      { path: "/exam", element: <ExamPage /> },
      { path: "/result", element: <ResultPage /> },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
```

### 8.2 errorElement (라우트 레벨 에러 처리)

```tsx
// src/router.tsx
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // ...
    ],
  },
]);

// src/pages/ErrorPage.tsx
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <Link to="/">처음으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>오류가 발생했습니다</h1>
      <Link to="/">처음으로 돌아가기</Link>
    </div>
  );
}
```

---

## 9. Anti-Patterns

### 9.1 BrowserRouter + Routes 패턴 사용 금지

```tsx
// BAD - 레거시 패턴, 이 프로젝트에서 사용하지 않음
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TutorialPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// GOOD - createBrowserRouter + RouterProvider 패턴
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <TutorialPage /> },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

### 9.2 window.location을 이용한 네비게이션

```tsx
// BAD - 전체 페이지 리로드 발생, SPA 장점 상실
window.location.href = "/exam";
window.location.replace("/result");

// GOOD - React Router의 useNavigate 사용
const navigate = useNavigate();
navigate("/exam");
navigate("/result", { replace: true });
```

### 9.3 useNavigate를 렌더링 중 호출

```tsx
// BAD - 렌더링 도중 네비게이션 호출
function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.studentInfo) {
    navigate("/"); // 렌더링 중 side effect 발생
  }
}

// GOOD - useEffect 내에서 호출
function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.studentInfo) {
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);
}
```

### 9.4 state에 과도한 데이터 전달

```tsx
// BAD - 직렬화 불가능한 값이나 대용량 데이터를 state로 전달
navigate("/result", {
  state: {
    examData: largeObject,       // 대용량 데이터
    callback: () => {},          // 함수는 직렬화 불가
    ref: someRef,                // ref 객체 전달 금지
  },
});

// GOOD - 필요한 최소 데이터만 전달하거나, 전역 상태/서버 상태 활용
navigate("/result", {
  state: { result: gradeResponse },
});
```

### 9.5 Link의 to 속성에 외부 URL 사용

```tsx
// BAD - Link는 앱 내부 라우팅 전용
<Link to="https://example.com">외부 링크</Link>

// GOOD - 외부 URL은 a 태그 사용
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  외부 링크
</a>
```

---

## Quick Reference

### 라우팅 설정

```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <TutorialPage /> },
      { path: "/exam", element: <ExamPage /> },
      { path: "/result", element: <ResultPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

// main.tsx
<RouterProvider router={router} />;
```

### 네비게이션 훅

```tsx
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";

const navigate = useNavigate();
navigate("/exam");                            // 이동
navigate("/result", { replace: true });       // 히스토리 대체
navigate("/exam", { state: { data } });       // state 전달
navigate(-1);                                 // 뒤로가기

const location = useLocation();
location.pathname;                            // 현재 경로
location.state;                               // 전달받은 state

const [searchParams, setSearchParams] = useSearchParams();
searchParams.get("tab");                      // 쿼리 파라미터 읽기
setSearchParams({ tab: "detail" });           // 쿼리 파라미터 설정

const params = useParams();                   // URL 파라미터 (동적 라우트 사용 시)
```

### 앱 흐름 요약

```
[/] TutorialPage ──navigate("/exam", { state })──> [/exam] ExamPage
                                                        │
                                          POST /api/exams/submit
                                                        │
                                          navigate("/result", { state, replace })
                                                        │
                                                        v
                                                  [/result] ResultPage
```

---

## PR Checklist

- [ ] `createBrowserRouter` + `RouterProvider` 패턴을 사용하고 있는가?
- [ ] 새 페이지 추가 시 `router.tsx`의 라우트 배열에 등록했는가?
- [ ] 프로그래매틱 네비게이션에 `useNavigate`를 사용하고 있는가? (`window.location` 아님)
- [ ] `useNavigate` 호출이 렌더링 중이 아닌 `useEffect` 또는 이벤트 핸들러 안에 있는가?
- [ ] 직접 URL 접근 시 `location.state`가 `null`인 경우를 처리하고 있는가?
- [ ] 결과 페이지로 이동 시 `replace: true`를 사용하여 뒤로가기를 방지하고 있는가?
- [ ] 라우트에 `errorElement`가 설정되어 있는가?
- [ ] `path: "*"`로 404 페이지를 처리하고 있는가?
- [ ] TanStack Query의 `isLoading` / `isPending`으로 로딩 상태를 처리하고 있는가?
