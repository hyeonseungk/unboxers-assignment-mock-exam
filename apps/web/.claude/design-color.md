# Design & Color Guidelines (Tailwind CSS v4 + CSS Custom Properties)

## Related Guides

- `.claude/ui-component.md`: 공용 UI 컴포넌트 조합 규칙, 버튼 variant, cn() 사용법
- `.claude/animation-gesture.md`: 터치 인터랙션, OMR 버블 탭 피드백, 전환 애니메이션
- `.claude/screen-layout.md`: 18-27인치 터치스크린 레이아웃, 페이지 구조
- `.claude/typography-i18n.md`: 문제 텍스트, 타이머, 점수 표시 등 타이포그래피

---

## 1. Architecture Overview

이 프로젝트는 **Tailwind CSS v4**의 CSS-first 설정을 사용합니다.
`tailwind.config.ts`는 존재하지 않으며, 모든 디자인 토큰은 CSS 파일에서 관리합니다.

```
src/styles/globals.css
  │
  ├── @import "tailwindcss"     Tailwind v4 진입점
  │
  ├── @theme inline { ... }     CSS 변수 → Tailwind 유틸리티 매핑
  │                              예: --color-exam-correct → text-exam-correct, bg-exam-correct
  │
  ├── :root { ... }             CSS 커스텀 프로퍼티 (라이트 테마 값)
  │                              현재 라이트 모드 전용, .dark 블록 없음
  │
  └── Component classes         .omr-bubble, .timer-bar, .score-card 등
```

**동작 원리:**

1. `:root`에 원시 색상값을 CSS 커스텀 프로퍼티로 정의한다.
2. `@theme inline`에서 `--color-*` 네임스페이스로 매핑하면, Tailwind v4가 자동으로 유틸리티 클래스를 생성한다 (예: `--color-exam-correct` -> `text-exam-correct`, `bg-exam-correct`).
3. 컴포넌트 레벨 클래스(`.omr-bubble`, `.score-card`)는 CSS 변수를 직접 참조한다.

### Figma 디자인 토큰 연동

Figma에서 정의된 디자인 토큰과 코드의 CSS 변수를 1:1로 매핑합니다.

| Figma Token Name | CSS Variable | Tailwind Class |
|---|---|---|
| `color/exam/correct` | `--exam-correct` | `text-exam-correct`, `bg-exam-correct` |
| `color/exam/wrong` | `--exam-wrong` | `text-exam-wrong`, `bg-exam-wrong` |
| `color/omr/selected` | `--omr-selected` | `bg-omr-selected` |
| `color/timer/warning` | `--timer-warning` | `text-timer-warning` |

> **규칙:** Figma 토큰 이름을 kebab-case로 변환한 것이 CSS 변수 이름입니다. 디자이너와 개발자가 동일한 이름으로 소통합니다.

---

## 2. Design System: "시험지 톤 — Clean White + Blue Accent"

모의고사 앱은 **시험 환경의 집중도**를 최우선으로 설계합니다. 시각적 노이즈를 최소화하고, 채점 결과는 직관적인 색상 대비로 전달합니다.

| Aspect | Choice | 근거 |
|---|---|---|
| **Background** | 깨끗한 White `#ffffff` | 시험지 느낌, 문제 가독성 극대화 |
| **Surface** | Slate-50 `#f8fafc` | 카드/섹션 구분, 시선 분리 |
| **Text** | Slate scale (900/600/400) | 차분한 무채색, 장시간 집중에 적합 |
| **Primary Accent** | Blue-600 `#2563eb` | 신뢰감, 선택 상태 강조 (OMR 버블) |
| **Correct** | Emerald-600 `#059669` | 정답 — 긍정적 피드백 |
| **Wrong** | Red-600 `#dc2626` | 오답 — 명확한 오류 인지 |
| **Unanswered** | Amber-500 `#f59e0b` | 미응답 — 주의 환기 |
| **Timer Warning** | Red-500 `#ef4444` | 시간 부족 경고 |

---

## 3. Semantic Token Reference

### 3.1 Foreground (Text) — `fg-*`

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `text-fg-primary` | `--text-primary` | Slate-900 `#0f172a` | 문제 본문, 제목 |
| `text-fg-secondary` | `--text-secondary` | Slate-600 `#475569` | 보기 텍스트, 레이블 |
| `text-fg-tertiary` | `--text-tertiary` | Slate-500 `#64748b` | 보조 설명, 힌트 |
| `text-fg-muted` | `--text-muted` | Slate-400 `#94a3b8` | 비활성 텍스트, placeholder |
| `text-fg-inverse` | `--text-inverse` | White `#ffffff` | 어두운 배경 위 텍스트 |

### 3.2 Background & Surface

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `bg-background` | `--background` | White `#ffffff` | 페이지 배경 (시험지) |
| `bg-background-secondary` | `--background-secondary` | Slate-50 `#f8fafc` | 섹션 구분 배경 |
| `bg-surface` | `--surface` | White `#ffffff` | 카드, 문제 카드 |
| `bg-surface-secondary` | `--surface-secondary` | Slate-50 `#f8fafc` | 보조 surface |
| `bg-surface-elevated` | `--surface-elevated` | White `#ffffff` | 모달, 팝오버 |
| `bg-overlay` | `--bg-overlay` | `rgba(0,0,0,0.5)` | 모달 배경 오버레이 |

### 3.3 Accent (Interactive)

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `bg-accent` / `text-accent` | `--accent` | Blue-600 `#2563eb` | 주요 액션 버튼, 선택 상태 |
| `bg-accent-hover` | `--accent-hover` | Blue-700 `#1d4ed8` | Hover 상태 |
| `bg-accent-light` | `--accent-light` | Blue-50 `#eff6ff` | 선택된 항목 배경 |
| `text-accent-muted` | `--accent-muted` | Blue-400 `#60a5fa` | 비활성 accent |
| `text-accent-foreground` | `--accent-foreground` | White `#ffffff` | accent 배경 위 텍스트 |

### 3.4 Border/Line — `line-*`

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `border-line` | `--border` | Slate-200 `#e2e8f0` | 기본 테두리 |
| `border-line-secondary` | `--border-secondary` | Slate-300 `#cbd5e1` | 강한 테두리 |
| `border-line-focus` | `--border-focus` | Blue-600 `#2563eb` | 포커스 링 |

### 3.5 Status Colors

각 상태 색상은 50, 100, 500, 600, 700 레벨을 제공합니다. Error/Warning은 200 레벨도 포함합니다.

| Category | Base Color | 클래스 예시 |
|---|---|---|
| **Error** | Red | `bg-error-50`, `bg-error-100`, `border-error-200`, `text-error-500`, `text-error-600`, `text-error-700` |
| **Warning** | Amber | `bg-warning-50`, `bg-warning-100`, `border-warning-200`, `text-warning-500`, `text-warning-600`, `text-warning-700` |
| **Success** | Emerald | `bg-success-50`, `bg-success-100`, `text-success-500`, `text-success-600`, `text-success-700` |

---

## 4. Exam Domain Color System (시험 도메인 색상)

모의고사 앱의 핵심 도메인 색상입니다. 일반 시맨틱 토큰과 별도로 `exam-*` 네임스페이스로 관리합니다.

### 4.1 채점 결과 (Grading)

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `text-exam-correct` | `--exam-correct` | Emerald-600 `#059669` | 정답 텍스트/아이콘 |
| `bg-exam-correct` | `--exam-correct` | Emerald-600 `#059669` | 정답 배경 (버블, 배지) |
| `bg-exam-correct-light` | `--exam-correct-light` | Emerald-50 `#ecfdf5` | 정답 행 배경 하이라이트 |
| `border-exam-correct` | `--exam-correct-border` | Emerald-200 `#a7f3d0` | 정답 영역 테두리 |
| `text-exam-wrong` | `--exam-wrong` | Red-600 `#dc2626` | 오답 텍스트/아이콘 |
| `bg-exam-wrong` | `--exam-wrong` | Red-600 `#dc2626` | 오답 배경 (버블, 배지) |
| `bg-exam-wrong-light` | `--exam-wrong-light` | Red-50 `#fef2f2` | 오답 행 배경 하이라이트 |
| `border-exam-wrong` | `--exam-wrong-border` | Red-200 `#fecaca` | 오답 영역 테두리 |
| `text-exam-unanswered` | `--exam-unanswered` | Amber-500 `#f59e0b` | 미응답 텍스트/아이콘 |
| `bg-exam-unanswered` | `--exam-unanswered` | Amber-500 `#f59e0b` | 미응답 배경 (버블, 배지) |
| `bg-exam-unanswered-light` | `--exam-unanswered-light` | Amber-50 `#fffbeb` | 미응답 행 배경 하이라이트 |
| `border-exam-unanswered` | `--exam-unanswered-border` | Amber-200 `#fde68a` | 미응답 영역 테두리 |

### 4.2 OMR Card (답안지)

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `bg-omr-default` | `--omr-default` | Slate-100 `#f1f5f9` | 미선택 버블 배경 |
| `border-omr-default` | `--omr-default-border` | Slate-300 `#cbd5e1` | 미선택 버블 테두리 |
| `bg-omr-selected` | `--omr-selected` | Blue-600 `#2563eb` | 선택된 버블 배경 |
| `text-omr-selected` | `--omr-selected-text` | White `#ffffff` | 선택된 버블 텍스트 |
| `border-omr-selected` | `--omr-selected-border` | Blue-700 `#1d4ed8` | 선택된 버블 테두리 |
| `bg-omr-hover` | `--omr-hover` | Blue-50 `#eff6ff` | 버블 hover 배경 |
| `border-omr-hover` | `--omr-hover-border` | Blue-300 `#93c5fd` | 버블 hover 테두리 |
| `bg-omr-disabled` | `--omr-disabled` | Slate-50 `#f8fafc` | 제출 후 비활성 버블 |
| `text-omr-disabled` | `--omr-disabled-text` | Slate-400 `#94a3b8` | 비활성 버블 텍스트 |

### 4.3 Timer (시험 타이머)

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `text-timer-default` | `--timer-default` | Slate-700 `#334155` | 기본 타이머 텍스트 |
| `bg-timer-bar` | `--timer-bar` | Blue-600 `#2563eb` | 프로그레스 바 기본 |
| `bg-timer-bar-track` | `--timer-bar-track` | Slate-200 `#e2e8f0` | 프로그레스 바 트랙 |
| `text-timer-warning` | `--timer-warning` | Amber-600 `#d97706` | 시간 부족 경고 (5분 이하) |
| `bg-timer-warning` | `--timer-warning` | Amber-600 `#d97706` | 경고 프로그레스 바 |
| `text-timer-danger` | `--timer-danger` | Red-600 `#dc2626` | 임박 경고 (1분 이하) |
| `bg-timer-danger` | `--timer-danger` | Red-600 `#dc2626` | 위험 프로그레스 바 |

### 4.4 Score & Result (점수/결과)

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `text-score-high` | `--score-high` | Emerald-600 `#059669` | 고득점 (80% 이상) |
| `text-score-mid` | `--score-mid` | Blue-600 `#2563eb` | 중간 점수 (50-79%) |
| `text-score-low` | `--score-low` | Red-600 `#dc2626` | 저득점 (50% 미만) |
| `bg-score-bar` | `--score-bar` | Blue-600 `#2563eb` | 점수 막대 그래프 |
| `bg-score-bar-bg` | `--score-bar-bg` | Slate-100 `#f1f5f9` | 점수 막대 배경 |

### 4.5 Question Navigation (문제 탐색)

| Tailwind Class | CSS Variable | 값 | 용도 |
|---|---|---|---|
| `bg-qnav-current` | `--qnav-current` | Blue-600 `#2563eb` | 현재 문제 번호 |
| `text-qnav-current` | `--qnav-current-text` | White `#ffffff` | 현재 문제 번호 텍스트 |
| `bg-qnav-answered` | `--qnav-answered` | Blue-100 `#dbeafe` | 응답 완료 문제 번호 |
| `text-qnav-answered` | `--qnav-answered-text` | Blue-700 `#1d4ed8` | 응답 완료 텍스트 |
| `bg-qnav-unanswered` | `--qnav-unanswered` | White `#ffffff` | 미응답 문제 번호 |
| `border-qnav-unanswered` | `--qnav-unanswered-border` | Slate-300 `#cbd5e1` | 미응답 테두리 |
| `bg-qnav-flagged` | `--qnav-flagged` | Amber-100 `#fef3c7` | 다시보기 표시 문제 |
| `border-qnav-flagged` | `--qnav-flagged-border` | Amber-400 `#fbbf24` | 다시보기 테두리 |

---

## 5. CSS Variable Definition Pattern

### 5.1 :root 정의

```css
:root {
  /* === Foreground === */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --text-muted: #94a3b8;
  --text-inverse: #ffffff;

  /* === Background === */
  --background: #ffffff;
  --background-secondary: #f8fafc;
  --surface: #ffffff;
  --surface-secondary: #f8fafc;
  --surface-elevated: #ffffff;
  --bg-overlay: rgba(0, 0, 0, 0.5);

  /* === Accent (Blue) === */
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-light: #eff6ff;
  --accent-muted: #60a5fa;
  --accent-foreground: #ffffff;

  /* === Border === */
  --border: #e2e8f0;
  --border-secondary: #cbd5e1;
  --border-focus: #2563eb;

  /* === Exam: Grading === */
  --exam-correct: #059669;
  --exam-correct-light: #ecfdf5;
  --exam-correct-border: #a7f3d0;
  --exam-wrong: #dc2626;
  --exam-wrong-light: #fef2f2;
  --exam-wrong-border: #fecaca;
  --exam-unanswered: #f59e0b;
  --exam-unanswered-light: #fffbeb;
  --exam-unanswered-border: #fde68a;

  /* === Exam: OMR === */
  --omr-default: #f1f5f9;
  --omr-default-border: #cbd5e1;
  --omr-selected: #2563eb;
  --omr-selected-text: #ffffff;
  --omr-selected-border: #1d4ed8;
  --omr-hover: #eff6ff;
  --omr-hover-border: #93c5fd;
  --omr-disabled: #f8fafc;
  --omr-disabled-text: #94a3b8;

  /* === Exam: Timer === */
  --timer-default: #334155;
  --timer-bar: #2563eb;
  --timer-bar-track: #e2e8f0;
  --timer-warning: #d97706;
  --timer-danger: #dc2626;

  /* === Exam: Score === */
  --score-high: #059669;
  --score-mid: #2563eb;
  --score-low: #dc2626;
  --score-bar: #2563eb;
  --score-bar-bg: #f1f5f9;

  /* === Exam: Question Navigation === */
  --qnav-current: #2563eb;
  --qnav-current-text: #ffffff;
  --qnav-answered: #dbeafe;
  --qnav-answered-text: #1d4ed8;
  --qnav-unanswered: #ffffff;
  --qnav-unanswered-border: #cbd5e1;
  --qnav-flagged: #fef3c7;
  --qnav-flagged-border: #fbbf24;

  /* === Status === */
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-200: #fecaca;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --error-700: #b91c1c;
  --warning-50: #fffbeb;
  --warning-100: #fef3c7;
  --warning-200: #fde68a;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-700: #b45309;
  --success-50: #ecfdf5;
  --success-100: #d1fae5;
  --success-500: #10b981;
  --success-600: #059669;
  --success-700: #047857;
}
```

### 5.2 @theme inline 매핑

```css
@theme inline {
  /* Foreground */
  --color-fg-primary: var(--text-primary);
  --color-fg-secondary: var(--text-secondary);
  --color-fg-tertiary: var(--text-tertiary);
  --color-fg-muted: var(--text-muted);
  --color-fg-inverse: var(--text-inverse);

  /* Background & Surface */
  --color-background: var(--background);
  --color-background-secondary: var(--background-secondary);
  --color-surface: var(--surface);
  --color-surface-secondary: var(--surface-secondary);
  --color-surface-elevated: var(--surface-elevated);
  --color-overlay: var(--bg-overlay);

  /* Accent */
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-light: var(--accent-light);
  --color-accent-muted: var(--accent-muted);
  --color-accent-foreground: var(--accent-foreground);

  /* Border */
  --color-line: var(--border);
  --color-line-secondary: var(--border-secondary);
  --color-line-focus: var(--border-focus);

  /* Exam: Grading */
  --color-exam-correct: var(--exam-correct);
  --color-exam-correct-light: var(--exam-correct-light);
  --color-exam-correct-border: var(--exam-correct-border);
  --color-exam-wrong: var(--exam-wrong);
  --color-exam-wrong-light: var(--exam-wrong-light);
  --color-exam-wrong-border: var(--exam-wrong-border);
  --color-exam-unanswered: var(--exam-unanswered);
  --color-exam-unanswered-light: var(--exam-unanswered-light);
  --color-exam-unanswered-border: var(--exam-unanswered-border);

  /* Exam: OMR */
  --color-omr-default: var(--omr-default);
  --color-omr-default-border: var(--omr-default-border);
  --color-omr-selected: var(--omr-selected);
  --color-omr-selected-text: var(--omr-selected-text);
  --color-omr-selected-border: var(--omr-selected-border);
  --color-omr-hover: var(--omr-hover);
  --color-omr-hover-border: var(--omr-hover-border);
  --color-omr-disabled: var(--omr-disabled);
  --color-omr-disabled-text: var(--omr-disabled-text);

  /* Exam: Timer */
  --color-timer-default: var(--timer-default);
  --color-timer-bar: var(--timer-bar);
  --color-timer-bar-track: var(--timer-bar-track);
  --color-timer-warning: var(--timer-warning);
  --color-timer-danger: var(--timer-danger);

  /* Exam: Score */
  --color-score-high: var(--score-high);
  --color-score-mid: var(--score-mid);
  --color-score-low: var(--score-low);
  --color-score-bar: var(--score-bar);
  --color-score-bar-bg: var(--score-bar-bg);

  /* Exam: Question Navigation */
  --color-qnav-current: var(--qnav-current);
  --color-qnav-current-text: var(--qnav-current-text);
  --color-qnav-answered: var(--qnav-answered);
  --color-qnav-answered-text: var(--qnav-answered-text);
  --color-qnav-unanswered: var(--qnav-unanswered);
  --color-qnav-unanswered-border: var(--qnav-unanswered-border);
  --color-qnav-flagged: var(--qnav-flagged);
  --color-qnav-flagged-border: var(--qnav-flagged-border);

  /* Status */
  --color-error-50: var(--error-50);
  --color-error-100: var(--error-100);
  --color-error-200: var(--error-200);
  --color-error-500: var(--error-500);
  --color-error-600: var(--error-600);
  --color-error-700: var(--error-700);
  --color-warning-50: var(--warning-50);
  --color-warning-100: var(--warning-100);
  --color-warning-200: var(--warning-200);
  --color-warning-500: var(--warning-500);
  --color-warning-600: var(--warning-600);
  --color-warning-700: var(--warning-700);
  --color-success-50: var(--success-50);
  --color-success-100: var(--success-100);
  --color-success-500: var(--success-500);
  --color-success-600: var(--success-600);
  --color-success-700: var(--success-700);
}
```

---

## 6. Component Usage Patterns

### 6.1 OMR 버블 (답안 선택)

```tsx
// 미선택 상태
<button className="bg-omr-default border border-omr-default-border text-fg-secondary
  rounded-full w-12 h-12 hover:bg-omr-hover hover:border-omr-hover-border
  transition-colors duration-150">
  ③
</button>

// 선택된 상태
<button className="bg-omr-selected border border-omr-selected-border text-omr-selected-text
  rounded-full w-12 h-12 shadow-sm transition-colors duration-150">
  ②
</button>

// 제출 후 비활성 상태
<button className="bg-omr-disabled border border-line text-omr-disabled-text
  rounded-full w-12 h-12 cursor-not-allowed" disabled>
  ④
</button>

// cn()을 활용한 동적 스타일
<button
  className={cn(
    'rounded-full w-12 h-12 border transition-colors duration-150',
    isSelected && 'bg-omr-selected border-omr-selected-border text-omr-selected-text shadow-sm',
    !isSelected && !isDisabled && 'bg-omr-default border-omr-default-border text-fg-secondary hover:bg-omr-hover hover:border-omr-hover-border',
    isDisabled && 'bg-omr-disabled border-line text-omr-disabled-text cursor-not-allowed',
  )}
  disabled={isDisabled}
>
  {choiceLabel}
</button>
```

### 6.2 채점 결과 표시

```tsx
// 정답 표시
<div className="bg-exam-correct-light border border-exam-correct-border rounded-lg p-3">
  <span className="text-exam-correct font-semibold">정답</span>
</div>

// 오답 표시
<div className="bg-exam-wrong-light border border-exam-wrong-border rounded-lg p-3">
  <span className="text-exam-wrong font-semibold">오답</span>
</div>

// 미응답 표시
<div className="bg-exam-unanswered-light border border-exam-unanswered-border rounded-lg p-3">
  <span className="text-exam-unanswered font-semibold">미응답</span>
</div>

// cn()을 활용한 조건부 스타일
<div
  className={cn(
    'rounded-lg p-3 border',
    result === 'correct' && 'bg-exam-correct-light border-exam-correct-border',
    result === 'wrong' && 'bg-exam-wrong-light border-exam-wrong-border',
    result === 'unanswered' && 'bg-exam-unanswered-light border-exam-unanswered-border',
  )}
>
  <span
    className={cn(
      'font-semibold',
      result === 'correct' && 'text-exam-correct',
      result === 'wrong' && 'text-exam-wrong',
      result === 'unanswered' && 'text-exam-unanswered',
    )}
  >
    {resultLabel}
  </span>
</div>
```

### 6.3 시험 타이머

```tsx
// 기본 상태 (여유 시간)
<div className="flex items-center gap-2">
  <span className="text-timer-default font-mono text-lg">45:30</span>
  <div className="flex-1 h-2 rounded-full bg-timer-bar-track">
    <div className="h-full rounded-full bg-timer-bar" style={{ width: `${percent}%` }} />
  </div>
</div>

// 경고 상태 (5분 이하)
<div className="flex items-center gap-2">
  <span className="text-timer-warning font-mono text-lg font-semibold">04:23</span>
  <div className="flex-1 h-2 rounded-full bg-timer-bar-track">
    <div className="h-full rounded-full bg-timer-warning" style={{ width: `${percent}%` }} />
  </div>
</div>

// 위험 상태 (1분 이하)
<div className="flex items-center gap-2">
  <span className="text-timer-danger font-mono text-lg font-bold animate-pulse">00:42</span>
  <div className="flex-1 h-2 rounded-full bg-timer-bar-track">
    <div className="h-full rounded-full bg-timer-danger" style={{ width: `${percent}%` }} />
  </div>
</div>

// cn()을 활용한 타이머 색상 전환
<span
  className={cn(
    'font-mono text-lg',
    remainingMinutes > 5 && 'text-timer-default',
    remainingMinutes <= 5 && remainingMinutes > 1 && 'text-timer-warning font-semibold',
    remainingMinutes <= 1 && 'text-timer-danger font-bold animate-pulse',
  )}
>
  {formattedTime}
</span>
```

### 6.4 문제 탐색 패널 (Question Navigator)

```tsx
// 현재 문제
<button className="bg-qnav-current text-qnav-current-text w-10 h-10 rounded-lg font-semibold">
  5
</button>

// 응답 완료
<button className="bg-qnav-answered text-qnav-answered-text w-10 h-10 rounded-lg">
  3
</button>

// 미응답
<button className="bg-qnav-unanswered border border-qnav-unanswered-border text-fg-secondary w-10 h-10 rounded-lg">
  7
</button>

// 다시보기 표시 (flagged)
<button className="bg-qnav-flagged border border-qnav-flagged-border text-fg-primary w-10 h-10 rounded-lg">
  12
</button>
```

### 6.5 점수/결과 화면

```tsx
// 점수 표시 (등급별 색상)
<span
  className={cn(
    'text-4xl font-bold',
    scorePercent >= 80 && 'text-score-high',
    scorePercent >= 50 && scorePercent < 80 && 'text-score-mid',
    scorePercent < 50 && 'text-score-low',
  )}
>
  {score}점
</span>

// 결과 요약 카드
<div className="bg-surface border border-line rounded-xl p-6">
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-exam-correct" />
      <span className="text-fg-secondary">정답 {correctCount}문제</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-exam-wrong" />
      <span className="text-fg-secondary">오답 {wrongCount}문제</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-exam-unanswered" />
      <span className="text-fg-secondary">미응답 {unansweredCount}문제</span>
    </div>
  </div>
</div>
```

### 6.6 버튼 패턴

```tsx
// Primary 버튼 (시험 시작, 답안 제출)
<button className="bg-accent text-accent-foreground hover:bg-accent-hover rounded-xl px-6 py-3 font-semibold transition-colors duration-150">
  시험 시작
</button>

// Secondary 버튼 (취소, 이전)
<button className="bg-surface border border-line text-fg-primary hover:bg-background-secondary rounded-xl px-6 py-3 transition-colors duration-150">
  이전 문제
</button>

// Danger 버튼 (시험 포기)
<button className="bg-error-600 text-white hover:bg-error-700 rounded-xl px-6 py-3 font-semibold transition-colors duration-150">
  시험 종료
</button>
```

### 6.7 Status 메시지

```tsx
// 에러 상태
<div className="bg-error-50 border border-error-200 rounded-lg p-3">
  <p className="text-error-700">답안을 불러오는데 실패했습니다.</p>
</div>

// 성공 상태
<div className="bg-success-50 rounded-lg p-3">
  <p className="text-success-700">답안이 성공적으로 제출되었습니다.</p>
</div>

// 경고 상태
<div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
  <p className="text-warning-700">미응답 문제가 3개 있습니다.</p>
</div>
```

---

## 7. Input Focus Pattern

입력 요소에는 두 가지 focus 패턴이 존재합니다.

**1. Tailwind ring 유틸리티 (입력 요소)**

```tsx
// 입력 요소 focus 패턴
className="focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent"

// 버튼/체크박스 등 비입력 요소 focus 패턴
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
```

**2. OMR 버블 전용 focus (터치스크린 고려)**

```tsx
// OMR 버블은 터치 대상이므로 focus-visible만 사용
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
```

> **주의:** 입력 요소에는 `focus:ring-accent-light`를 사용하세요 (`ring-accent`가 아닌). 버튼과 OMR 버블 등 비입력 요소에는 `focus-visible:ring-accent`를 사용합니다.

---

## 8. Anti-Patterns

### 하드코딩된 색상 사용 금지

```tsx
// BAD
<div className="bg-blue-600 text-white" />
<div className="bg-green-50 border-green-200" />
<div className="bg-[#2563eb]" />
<div style={{ color: '#dc2626' }} />

// GOOD
<div className="bg-accent text-accent-foreground" />
<div className="bg-exam-correct-light border-exam-correct-border" />
<div className="bg-accent" />
<span className="text-exam-wrong" />
```

### bracket syntax로 테마 토큰 참조 금지

```tsx
// BAD — 시맨틱 클래스가 있는 토큰에 bracket syntax 사용
<div className="bg-[var(--accent)]" />
<div className="text-[var(--exam-correct)]" />
<div className="border-[var(--border)]" />

// GOOD — 시맨틱 Tailwind 클래스 사용
<div className="bg-accent" />
<div className="text-exam-correct" />
<div className="border-line" />
```

### tailwind.config.ts 참조 금지

이 프로젝트는 Tailwind CSS v4를 사용합니다. `tailwind.config.ts`는 존재하지 않으며, 모든 테마 커스터마이징은 CSS 파일의 `@theme inline`에서 수행합니다.

### 화면 종속적 토큰 이름 금지

```css
/* BAD — 특정 화면에 종속된 이름 */
.exam-page-bg { ... }
.result-page-header-color { ... }

/* GOOD — 역할 기반 이름 */
.score-card { ... }
.omr-bubble { ... }
```

### 원시 Tailwind 색상 스케일 직접 사용 금지

```tsx
// BAD — Tailwind 기본 palette 직접 사용
<div className="bg-blue-600 text-white" />
<span className="text-emerald-600" />
<div className="border-slate-200" />

// GOOD — 시맨틱 토큰 사용
<div className="bg-accent text-accent-foreground" />
<span className="text-exam-correct" />
<div className="border-line" />
```

새로운 색상이 필요한 경우, 원시 스케일을 직접 사용하지 말고 시맨틱 토큰을 새로 정의하세요 (Section 9 참조).

### 예외 사항

다음의 경우 인라인 스타일 또는 하드코딩 색상 사용이 허용됩니다:

| # | 예외 사항 | 이유 |
|---|---|---|
| 1 | Timer progress bar의 `width` 인라인 스타일 | 런타임 퍼센트 값 (동적 계산) |
| 2 | Score bar의 `width` 인라인 스타일 | 런타임 점수 비율 (동적 계산) |
| 3 | 에러 fallback 페이지 인라인 스타일 | Tailwind CSS 미로드 대비 |
| 4 | 외부 라이브러리 style props | 라이브러리 API 요구사항 |

---

## 9. Adding New Tokens

새로운 색상 토큰이 필요할 때:

1. **기존 토큰으로 충분한지 먼저 확인한다** (대부분 기존 토큰으로 커버 가능).
2. **`:root`에 CSS 변수를 추가한다.**
3. **`@theme inline`에 `--color-*` 네임스페이스로 매핑한다** (Tailwind 유틸리티 자동 생성).
4. **필요 시 컴포넌트 클래스를 추가한다** (특정 UI 패턴에 묶인 경우).

### 예시: "부분 정답" 상태 토큰 추가

```css
/* Step 1: :root에 추가 */
:root {
  --exam-partial: #2563eb;
  --exam-partial-light: #eff6ff;
  --exam-partial-border: #bfdbfe;
}

/* Step 2: @theme inline에 매핑 */
@theme inline {
  --color-exam-partial: var(--exam-partial);
  --color-exam-partial-light: var(--exam-partial-light);
  --color-exam-partial-border: var(--exam-partial-border);
}

/* 이제 사용 가능: text-exam-partial, bg-exam-partial-light, border-exam-partial-border */
```

### Figma 토큰 추가 시 네이밍 규칙

| Figma에서 | CSS 변수 | @theme inline |
|---|---|---|
| `color/exam/partial` | `--exam-partial` | `--color-exam-partial` |
| `color/omr/locked` | `--omr-locked` | `--color-omr-locked` |
| `color/timer/paused` | `--timer-paused` | `--color-timer-paused` |

---

## 10. Quick Reference

| 용도 | 사용할 클래스 |
|---|---|
| **레이아웃** | |
| 페이지 배경 | `bg-background` |
| 카드/문제 카드 배경 | `bg-surface` |
| 섹션 구분 배경 | `bg-background-secondary` |
| 기본 테두리 | `border-line` |
| 강한 테두리 | `border-line-secondary` |
| 모달 배경 오버레이 | `bg-overlay` |
| **텍스트** | |
| 문제 본문 | `text-fg-primary` |
| 보기/레이블 | `text-fg-secondary` |
| 보조 설명 | `text-fg-tertiary` |
| 비활성/placeholder | `text-fg-muted` |
| 어두운 배경 위 텍스트 | `text-fg-inverse` |
| **OMR 카드** | |
| 미선택 버블 | `bg-omr-default border-omr-default-border` |
| 선택된 버블 | `bg-omr-selected text-omr-selected-text border-omr-selected-border` |
| 버블 hover | `hover:bg-omr-hover hover:border-omr-hover-border` |
| 비활성 버블 | `bg-omr-disabled text-omr-disabled-text` |
| **채점 결과** | |
| 정답 | `text-exam-correct` / `bg-exam-correct-light border-exam-correct-border` |
| 오답 | `text-exam-wrong` / `bg-exam-wrong-light border-exam-wrong-border` |
| 미응답 | `text-exam-unanswered` / `bg-exam-unanswered-light border-exam-unanswered-border` |
| **타이머** | |
| 기본 시간 표시 | `text-timer-default` |
| 경고 (5분 이하) | `text-timer-warning` / `bg-timer-warning` |
| 위험 (1분 이하) | `text-timer-danger` / `bg-timer-danger` |
| 프로그레스 바 | `bg-timer-bar` on `bg-timer-bar-track` |
| **문제 탐색** | |
| 현재 문제 | `bg-qnav-current text-qnav-current-text` |
| 응답 완료 | `bg-qnav-answered text-qnav-answered-text` |
| 미응답 | `bg-qnav-unanswered border-qnav-unanswered-border` |
| 다시보기 | `bg-qnav-flagged border-qnav-flagged-border` |
| **점수** | |
| 고득점 (80%+) | `text-score-high` |
| 중간 (50-79%) | `text-score-mid` |
| 저득점 (50% 미만) | `text-score-low` |
| **버튼** | |
| Primary (시험 시작, 제출) | `bg-accent text-accent-foreground hover:bg-accent-hover` |
| Secondary (이전, 취소) | `bg-surface border-line text-fg-primary` |
| Danger (시험 종료) | `bg-error-600 text-white hover:bg-error-700` |
| **상태 메시지** | |
| 에러 | `text-error-700` on `bg-error-50 border-error-200` |
| 성공 | `text-success-700` on `bg-success-50` |
| 경고 | `text-warning-700` on `bg-warning-50 border-warning-200` |
| **입력 포커스** | |
| 입력 요소 | `focus:ring-2 focus:ring-accent-light focus:border-accent` |
| 비입력 요소/OMR | `focus-visible:ring-2 focus-visible:ring-accent` |
