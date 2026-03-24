# Screen & Layout Guidelines (React + Vite + React Router)

터치스크린 키오스크(18-27인치) 전용 모의고사 웹앱의 화면 레이아웃 가이드라인입니다.
3단계 흐름(튜토리얼 -> 답안 마킹(OMR) -> 채점/결과)에 최적화된 전체화면 레이아웃 설계를 다룹니다.

---

## Related Guides

- `.claude/navigation.md`: React Router 라우팅 구조, 단계별 페이지 전환, 가드 처리를 다룰 때 참고
- `.claude/design-color.md`: 페이지 배경, surface, semantic color token을 맞출 때 참고
- `.claude/typography-i18n.md`: 페이지 텍스트, 제목, 터치스크린 가독성을 맞출 때 참고
- `.claude/ui-component.md`: 공용 UI 컴포넌트(버튼, OMR 셀 등) 조합 규칙을 따를 때 참고
- `.claude/animation-gesture.md`: 터치 인터랙션, 페이지 전환 애니메이션을 다룰 때 참고
- `.claude/form-handling.md`: OMR 마킹 상태 관리, 답안 입력 처리를 다룰 때 참고

---

## 1. 레이아웃 원칙

### 1.1 키오스크 전용 설계

본 프로젝트는 **18-27인치 터치스크린 전용** 키오스크 앱입니다. 일반 웹 브라우저, 모바일, 태블릿 대응은 요구사항이 아닙니다.

| 원칙 | 설명 |
| --- | --- |
| 전체화면 고정 | `100dvw x 100dvh`, 스크롤바 없음, overflow hidden |
| 터치 최적화 | 최소 터치 영역 48px, 권장 56px 이상 |
| 단일 포커스 | 한 화면에 하나의 주요 작업만 수행 |
| 시선 흐름 | 상단(정보) -> 중앙(작업 영역) -> 하단(네비게이션) |
| 가시 영역 활용 | 콘텐츠는 반드시 뷰포트 내에 배치, 페이지 단위 전환으로 처리 |

### 1.2 Tech Stack

| Feature | Solution |
| --- | --- |
| 빌드 도구 | Vite |
| UI 라이브러리 | React |
| 라우팅 | React Router (Layout Routes) |
| 스타일링 | Tailwind CSS v4 (`@theme inline`) |
| 상태 관리 | `useState`, `zustand` (앱 전역 상태) |

### 1.3 뷰포트 단위 규칙

키오스크 앱에서는 `dvh`(dynamic viewport height)를 기본으로 사용합니다. Tailwind CSS v4에서 제공하는 동적 뷰포트 유틸리티를 활용합니다.

```tsx
// Root 컨테이너: 전체 화면 고정
<div className="h-dvh w-dvw overflow-hidden">
  {/* 레이아웃 내용 */}
</div>
```

> **Note:** `h-screen`(100vh) 대신 `h-dvh`(100dvh)를 사용합니다. 키오스크 환경에서 주소창이나 시스템 UI로 인한 높이 차이를 방지합니다.

---

## 2. 디렉토리 구조

### 2.1 라우트 및 레이아웃 파일 구조

```
src/
├── main.tsx               # Vite 엔트리 포인트
├── App.tsx                # React Router 설정 (createBrowserRouter)
├── index.css              # Global Styles (Tailwind + @theme inline)
│
├── layouts/
│   └── ExamLayout.tsx     # 공통 Layout 컴포넌트 (헤더 + 메인 + 네비게이션)
│
├── pages/
│   ├── TutorialPage.tsx   # 튜토리얼 (시험 안내)
│   ├── OmrPage.tsx        # 답안 마킹 (OMR 카드)
│   └── ResultPage.tsx     # 채점/결과
│
├── components/
│   ├── ui/                # 공용 UI 컴포넌트
│   │   ├── TouchButton.tsx
│   │   └── OmrCell.tsx
│   ├── ExamHeader.tsx     # 시험 정보 + 타이머 헤더
│   ├── OmrCard.tsx        # OMR 답안지 카드
│   └── NavigationBar.tsx  # 이전/다음 네비게이션 바
│
└── features/
    └── exam/
        ├── hooks/         # 시험 관련 커스텀 훅
        └── stores/        # zustand 스토어
```

### 2.2 React Router Layout Routes 설정

React Router의 Layout Route 패턴을 사용하여 공통 레이아웃을 공유합니다.

```tsx
// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ExamLayout } from "@/layouts/ExamLayout";
import { TutorialPage } from "@/pages/TutorialPage";
import { OmrPage } from "@/pages/OmrPage";
import { ResultPage } from "@/pages/ResultPage";

const router = createBrowserRouter([
  {
    element: <ExamLayout />,
    children: [
      { path: "/", element: <TutorialPage /> },
      { path: "/exam", element: <OmrPage /> },
      { path: "/result", element: <ResultPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

> **Note:** `ExamLayout`은 React Router의 `<Outlet />`을 사용하여 자식 라우트를 렌더링합니다. Next.js의 `children` prop 패턴과 다릅니다.

---

## 3. 공통 레이아웃 (ExamLayout)

### 3.1 3단 구조: 헤더 / 메인 / 네비게이션

키오스크 앱의 핵심 레이아웃은 **수직 3단 분할**입니다. 헤더와 네비게이션은 고정, 메인 영역만 페이지별로 교체됩니다.

```
┌──────────────────────────────────────┐
│  Header (시험 정보 + 타이머)   64px  │
├──────────────────────────────────────┤
│                                      │
│                                      │
│  Main Content (Outlet)               │
│  (페이지별 콘텐츠)           flex-1  │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  Navigation (이전/다음)        80px  │
└──────────────────────────────────────┘
```

### 3.2 ExamLayout 구현

```tsx
// src/layouts/ExamLayout.tsx
import { Outlet } from "react-router-dom";
import { ExamHeader } from "@/components/ExamHeader";
import { NavigationBar } from "@/components/NavigationBar";

export function ExamLayout() {
  return (
    <div className="h-dvh w-dvw flex flex-col overflow-hidden bg-background">
      {/* 헤더: 고정 높이 */}
      <ExamHeader />

      {/* 메인 콘텐츠: 남은 공간 전부 사용 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* 네비게이션 바: 고정 높이 */}
      <NavigationBar />
    </div>
  );
}
```

### 3.3 조건부 레이아웃 (헤더/네비게이션 숨김)

결과 페이지처럼 헤더나 네비게이션이 필요 없는 경우, 별도 레이아웃을 정의하거나 라우트 레벨에서 분기합니다.

```tsx
// src/App.tsx - 레이아웃 분기 예시
const router = createBrowserRouter([
  {
    // 헤더 + 네비게이션이 있는 시험 흐름
    element: <ExamLayout />,
    children: [
      { path: "/", element: <TutorialPage /> },
      { path: "/exam", element: <OmrPage /> },
    ],
  },
  {
    // 헤더/네비게이션 없는 전체화면 레이아웃
    element: <FullScreenLayout />,
    children: [
      { path: "/result", element: <ResultPage /> },
    ],
  },
]);
```

```tsx
// src/layouts/FullScreenLayout.tsx
import { Outlet } from "react-router-dom";

export function FullScreenLayout() {
  return (
    <div className="h-dvh w-dvw overflow-hidden bg-background">
      <Outlet />
    </div>
  );
}
```

> **Note:** 레이아웃 변형이 필요할 때 기존 레이아웃에 조건부 로직을 추가하지 않습니다. React Router의 Layout Route 분리를 활용합니다.

---

## 4. 페이지별 레이아웃

### 4.1 튜토리얼 페이지

시험 안내를 표시하는 시작 페이지입니다. 콘텐츠를 화면 중앙에 배치하고, 큰 텍스트와 넉넉한 여백으로 가독성을 확보합니다.

```tsx
// src/pages/TutorialPage.tsx
export function TutorialPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-16 py-12">
      {/* 시험 안내 카드 */}
      <div className="w-full max-w-3xl space-y-8 text-center">
        <h1 className="text-4xl font-bold text-fg-primary">
          2026학년도 대학수학능력시험
        </h1>
        <p className="text-2xl text-fg-secondary leading-relaxed">
          시험 안내 사항을 확인하세요
        </p>

        {/* 안내 목록 */}
        <div className="space-y-4 text-left text-xl text-fg-secondary">
          {instructions.map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <span className="font-bold text-fg-primary shrink-0">
                {index + 1}.
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4.2 OMR 페이지 (답안 마킹)

핵심 작업 화면입니다. OMR 카드를 그리드로 배치하고, 터치로 답안을 마킹합니다.

```
┌──────────────────────────────────────┐
│  Header                              │
├──────────────────────────────────────┤
│  ┌─ 문제 번호 탭 ─────────────────┐ │
│  │ [1-10] [11-20] [21-30] ...      │ │
│  └─────────────────────────────────┘ │
│  ┌─ OMR 그리드 ───────────────────┐ │
│  │  1. ① ② ③ ④ ⑤                 │ │
│  │  2. ① ② ③ ④ ⑤                 │ │
│  │  3. ① ② ③ ④ ⑤                 │ │
│  │  ...                            │ │
│  └─────────────────────────────────┘ │
├──────────────────────────────────────┤
│  Navigation                          │
└──────────────────────────────────────┘
```

```tsx
// src/pages/OmrPage.tsx
export function OmrPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 문제 번호 그룹 탭 */}
      <div className="shrink-0 flex gap-2 px-8 py-4 border-b border-line bg-surface">
        {questionGroups.map((group) => (
          <button
            key={group.id}
            className="min-h-12 min-w-24 rounded-lg px-6 py-3 text-lg font-medium
                       transition-colors active:scale-95
                       data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
            data-active={currentGroup === group.id}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* OMR 카드 그리드: 남은 공간에서 내부 스크롤 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {questions.map((q) => (
            <OmrRow key={q.number} question={q} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

> **Note:** OMR 페이지에서 스크롤이 필요한 경우, `overflow-y-auto`는 메인 콘텐츠 영역 내부에만 적용합니다. 외부 레이아웃(`ExamLayout`)은 항상 `overflow-hidden`을 유지합니다.

### 4.3 결과 페이지

채점 결과를 표시하는 최종 페이지입니다. 점수를 크게 강조하고, 문항별 정오 정보를 제공합니다.

```tsx
// src/pages/ResultPage.tsx
export function ResultPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 점수 요약 영역 */}
      <div className="shrink-0 flex flex-col items-center justify-center gap-4 py-12 bg-surface">
        <p className="text-2xl text-fg-secondary">총점</p>
        <p className="text-7xl font-bold text-fg-primary">{score}</p>
        <p className="text-xl text-fg-muted">{totalQuestions}문항 중 {correctCount}문항 정답</p>
      </div>

      {/* 문항별 결과 목록: 내부 스크롤 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {results.map((r) => (
            <QuestionResultCard key={r.number} result={r} />
          ))}
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="shrink-0 flex gap-4 px-8 py-6 border-t border-line bg-surface">
        <button className="flex-1 min-h-14 rounded-xl bg-accent text-accent-foreground text-xl font-semibold
                           active:scale-[0.98] transition-transform">
          다시 풀기
        </button>
      </div>
    </div>
  );
}
```

---

## 5. 헤더 컴포넌트

### 5.1 ExamHeader 구조

헤더는 시험 정보(과목명, 시험 유형)와 타이머를 표시합니다. 고정 높이로 항상 화면 상단에 위치합니다.

```tsx
// src/components/ExamHeader.tsx
export function ExamHeader() {
  return (
    <header className="shrink-0 h-16 flex items-center justify-between px-8 bg-surface border-b border-line">
      {/* 좌측: 시험 정보 */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-fg-primary">{examTitle}</h1>
        <span className="text-lg text-fg-secondary">{subjectName}</span>
      </div>

      {/* 우측: 타이머 */}
      <div className="flex items-center gap-3">
        <ClockIcon className="size-6 text-fg-muted" />
        <time className="text-2xl font-mono font-bold text-fg-primary tabular-nums">
          {formatTime(remainingSeconds)}
        </time>
      </div>
    </header>
  );
}
```

> **Note:** 타이머 숫자에는 `font-mono tabular-nums`를 적용하여 숫자 폭이 변해도 레이아웃이 흔들리지 않도록 합니다.

---

## 6. 네비게이션 바

### 6.1 NavigationBar 구조

하단 네비게이션은 이전/다음 버튼과 현재 진행 상태를 표시합니다. 터치 영역을 넉넉하게 확보합니다.

```tsx
// src/components/NavigationBar.tsx
import { useNavigate } from "react-router-dom";

export function NavigationBar() {
  const navigate = useNavigate();

  return (
    <nav className="shrink-0 h-20 flex items-center justify-between px-8 bg-surface border-t border-line">
      {/* 이전 버튼 */}
      <button
        className="min-h-14 min-w-32 rounded-xl border border-line-secondary px-8
                   text-xl font-semibold text-fg-primary
                   active:scale-[0.98] transition-transform
                   disabled:opacity-40 disabled:pointer-events-none"
        disabled={isFirstStep}
        onClick={handlePrev}
      >
        이전
      </button>

      {/* 진행 상태 */}
      <div className="flex items-center gap-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "size-3 rounded-full transition-colors",
              i === currentStep ? "bg-accent" : "bg-line"
            )}
          />
        ))}
      </div>

      {/* 다음/제출 버튼 */}
      <button
        className="min-h-14 min-w-32 rounded-xl bg-accent px-8
                   text-xl font-semibold text-accent-foreground
                   active:scale-[0.98] transition-transform"
        onClick={isLastStep ? handleSubmit : handleNext}
      >
        {isLastStep ? "제출" : "다음"}
      </button>
    </nav>
  );
}
```

### 6.2 터치 영역 기준

| 요소 | 최소 크기 | 권장 크기 | Tailwind Class |
| --- | --- | --- | --- |
| 기본 버튼 | 44px | 56px | `min-h-14` (56px) |
| OMR 셀 | 44px | 48px+ | `min-h-12 min-w-12` (48px) |
| 탭 버튼 | 44px | 48px | `min-h-12` (48px) |
| 아이콘 버튼 | 44px | 48px | `size-12` (48px) |

> **Principle:** 터치스크린에서 오터치를 방지하려면 인접 터치 요소 간 최소 8px(`gap-2`) 간격을 유지합니다.

---

## 7. 반응형 전략 (18-27인치 최적화)

### 7.1 단일 해상도 범위 최적화

모바일/태블릿을 고려하지 않으므로, 모바일 우선 설계 대신 **대형 화면 단일 최적화** 전략을 사용합니다.

| 화면 크기 | 해상도 범위 | 대응 전략 |
| --- | --- | --- |
| 18인치 | 약 1920x1080 | 기본 레이아웃 기준 |
| 21-24인치 | 1920x1080 ~ 2560x1440 | 여백 확대, 그리드 열 증가 |
| 27인치 | 2560x1440+ | 최대 콘텐츠 폭 제한 |

### 7.2 콘텐츠 폭 제한

대형 화면에서 콘텐츠가 지나치게 넓어지는 것을 방지합니다.

```tsx
// OMR 카드 영역: 최대 폭 제한 + 가운데 정렬
<div className="flex-1 overflow-y-auto px-8 py-6">
  <div className="mx-auto max-w-5xl">
    {/* OMR 그리드 */}
  </div>
</div>
```

### 7.3 Breakpoint 활용

본 프로젝트에서 사용하는 Tailwind breakpoint는 `lg`(1024px)와 `xl`(1280px)입니다. `sm`, `md`는 키오스크 환경에서 사용하지 않습니다.

```tsx
// 화면 크기에 따른 그리드 열 조정
<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
  {questions.map((q) => (
    <OmrRow key={q.number} question={q} />
  ))}
</div>
```

### 7.4 텍스트 크기 기준

키오스크 거리(약 40-60cm)에서의 가독성을 기준으로 합니다.

| 용도 | Tailwind Class | 크기 |
| --- | --- | --- |
| 점수 (대형) | `text-7xl` | 72px |
| 페이지 제목 | `text-4xl` | 36px |
| 섹션 제목 | `text-2xl` | 24px |
| 헤더 정보 | `text-xl` | 20px |
| 본문/버튼 | `text-xl` ~ `text-lg` | 18-20px |
| 보조 텍스트 | `text-lg` | 18px |
| 최소 텍스트 | `text-base` | 16px |

> **Principle:** 키오스크에서 `text-sm`(14px) 이하는 사용하지 않습니다. 최소 `text-base`(16px)를 유지합니다.

---

## 8. Spacing & Layout 유틸리티 (Tailwind CSS v4)

### 8.1 간격 원칙

**Principle:** 자식 요소에 `margin`을 설정하지 않습니다. 부모의 `gap`, `space-*`, `padding`으로 간격을 제어합니다.

| 상황 | 접근 방식 | 예시 |
| --- | --- | --- |
| Flex/Grid 자식 간격 | `gap-*` | `gap-4`, `gap-6` |
| 수직 나열 간격 | `space-y-*` | `space-y-4` |
| 섹션 내부 여백 | `px-*`, `py-*` | `px-8 py-6` |
| 콘텐츠 최대폭 | `max-w-*` + `mx-auto` | `max-w-5xl mx-auto` |

### 8.2 키오스크 여백 기준

일반 웹앱보다 여백을 넉넉하게 설정합니다.

| 영역 | Tailwind Class | 값 |
| --- | --- | --- |
| 페이지 수평 패딩 | `px-8` | 32px |
| 페이지 수직 패딩 | `py-6` | 24px |
| 카드 내부 패딩 | `p-6` | 24px |
| 요소 간 기본 간격 | `gap-4` | 16px |
| 섹션 간 간격 | `gap-8` 또는 `space-y-8` | 32px |

### 8.3 Flex 레이아웃 패턴

```tsx
// 수직 3단 분할 (헤더 + 메인 + 푸터)
<div className="h-dvh flex flex-col">
  <header className="shrink-0">{/* 고정 높이 */}</header>
  <main className="flex-1 overflow-hidden">{/* 가변 높이 */}</main>
  <footer className="shrink-0">{/* 고정 높이 */}</footer>
</div>

// 수평 2분할 (사이드바 + 콘텐츠)
<div className="flex-1 flex overflow-hidden">
  <aside className="w-80 shrink-0 border-r border-line overflow-y-auto">
    {/* 사이드바 */}
  </aside>
  <div className="flex-1 overflow-y-auto">
    {/* 메인 콘텐츠 */}
  </div>
</div>
```

---

## 9. Anti-Patterns

### 9.1 레이아웃 Anti-Patterns

```tsx
// BAD: 뷰포트를 넘는 스크롤 허용
<div className="min-h-screen overflow-auto">

// GOOD: 뷰포트 고정, 내부 영역만 스크롤
<div className="h-dvh overflow-hidden">
  <main className="flex-1 overflow-y-auto">{/* ... */}</main>
</div>
```

```tsx
// BAD: 자식에 margin 설정
<div>
  <Card className="mb-4" />
  <Card className="mb-4" />
</div>

// GOOD: 부모에 gap 설정
<div className="flex flex-col gap-4">
  <Card />
  <Card />
</div>
```

```tsx
// BAD: h-screen 사용 (키오스크에서 높이 불일치 가능)
<div className="h-screen">

// GOOD: h-dvh 사용
<div className="h-dvh">
```

### 9.2 터치 인터랙션 Anti-Patterns

```tsx
// BAD: 터치 영역이 너무 작음
<button className="h-8 w-8 text-sm">X</button>

// GOOD: 최소 44px 터치 영역
<button className="min-h-12 min-w-12 text-lg">X</button>
```

```tsx
// BAD: hover 의존 인터랙션 (터치스크린에서 hover 없음)
<div className="opacity-0 hover:opacity-100">
  <ActionMenu />
</div>

// GOOD: 항상 표시하거나 active 상태 사용
<div className="opacity-100">
  <ActionMenu />
</div>
```

```tsx
// BAD: 인접 터치 요소 간격 부족
<div className="flex gap-1">
  <button>A</button>
  <button>B</button>
</div>

// GOOD: 최소 8px 간격
<div className="flex gap-2">
  <button className="min-h-12 min-w-12">A</button>
  <button className="min-h-12 min-w-12">B</button>
</div>
```

### 9.3 React Router Anti-Patterns

```tsx
// BAD: Layout 컴포넌트에서 children prop 사용 (Next.js 패턴)
export function ExamLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// GOOD: React Router의 Outlet 사용
import { Outlet } from "react-router-dom";

export function ExamLayout() {
  return (
    <div className="h-dvh flex flex-col">
      <Outlet />
    </div>
  );
}
```

```tsx
// BAD: 레이아웃 내부에서 경로 조건 분기
export function ExamLayout() {
  const location = useLocation();
  const showHeader = location.pathname !== "/result";
  return (
    <div>
      {showHeader && <ExamHeader />}
      <Outlet />
    </div>
  );
}

// GOOD: Router 레벨에서 레이아웃 분리
const router = createBrowserRouter([
  {
    element: <ExamLayout />,       // 헤더 있는 레이아웃
    children: [{ path: "/exam", element: <OmrPage /> }],
  },
  {
    element: <FullScreenLayout />, // 헤더 없는 레이아웃
    children: [{ path: "/result", element: <ResultPage /> }],
  },
]);
```

---

## 10. Quick Reference

### 10.1 레이아웃 패턴 요약

| 패턴 | Root ClassName | 사용 대상 |
| --- | --- | --- |
| 전체화면 3단 | `h-dvh w-dvw flex flex-col overflow-hidden` | ExamLayout (헤더+메인+네비) |
| 전체화면 단일 | `h-dvh w-dvw overflow-hidden` | FullScreenLayout (결과 등) |
| 내부 스크롤 영역 | `flex-1 overflow-y-auto` | OMR 목록, 결과 목록 |
| 고정 높이 영역 | `shrink-0 h-{n}` | 헤더(h-16), 네비게이션(h-20) |
| 중앙 배치 | `flex items-center justify-center` | 튜토리얼, 로딩 |

### 10.2 터치 크기 요약

| 용도 | Class | 크기 |
| --- | --- | --- |
| 주요 버튼 | `min-h-14` | 56px |
| OMR 마킹 셀 | `min-h-12 min-w-12` | 48px |
| 탭/세그먼트 | `min-h-12` | 48px |
| 최소 터치 영역 | `min-h-11 min-w-11` | 44px |

### 10.3 자주 쓰는 Tailwind v4 유틸리티

| 유틸리티 | 설명 |
| --- | --- |
| `h-dvh` / `w-dvw` | 동적 뷰포트 높이/너비 (100dvh/100dvw) |
| `shrink-0` | flex item이 축소되지 않도록 고정 |
| `flex-1` | 남은 공간 전부 차지 |
| `overflow-hidden` | 외부 스크롤 차단 |
| `overflow-y-auto` | 세로 내부 스크롤 허용 |
| `tabular-nums` | 고정폭 숫자 (타이머용) |
| `active:scale-[0.98]` | 터치 피드백 (살짝 축소) |
| `touch-manipulation` | 터치 지연 제거 (300ms delay 방지) |

---

## 11. PR Checklist

- [ ] 모든 페이지가 `h-dvh` 내에서 렌더링되며, 외부 스크롤이 발생하지 않는가
- [ ] 터치 요소의 최소 크기가 44px 이상인가
- [ ] 인접 터치 요소 간 최소 8px 간격이 확보되었는가
- [ ] Layout 컴포넌트에서 React Router `<Outlet />`을 사용하는가
- [ ] 레이아웃 분기가 Router 레벨에서 처리되는가 (레이아웃 내부 조건 분기 금지)
- [ ] `overflow-hidden`이 ExamLayout 루트에 적용되었는가
- [ ] 내부 스크롤은 메인 콘텐츠 영역에서만 발생하는가
- [ ] 고정 영역(헤더, 네비게이션)에 `shrink-0`가 적용되었는가
- [ ] 자식 요소에 `margin`(`m-*`, `mb-*`, `mt-*`)을 직접 설정하지 않았는가
- [ ] 텍스트 크기가 `text-base`(16px) 이상인가
- [ ] hover 의존 인터랙션 없이 모든 기능이 터치로 접근 가능한가
- [ ] 타이머 등 숫자 표시에 `tabular-nums`가 적용되었는가
- [ ] 18인치와 27인치 화면에서 레이아웃이 정상 표시되는가
