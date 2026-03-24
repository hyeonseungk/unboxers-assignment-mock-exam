# 타이포그래피 & 텍스트 가이드라인

## Related Guides

- `.agents/design-color.md`: semantic color token, 텍스트 색상 규칙 참고
- `.agents/ui-component.md`: 공용 UI 컴포넌트와 텍스트 조합 규칙 참고
- `.agents/screen-layout.md`: 페이지 레이아웃과 텍스트 배치 규칙 참고
- `.agents/form-handling.md`: 입력 필드, 라벨, 유효성 메시지의 텍스트 처리 참고

---

## 1. 폰트 설정

### 1.1 폰트 로드 (CDN @import)

Pretendard Variable을 CDN에서 로드합니다. `next/font`는 사용하지 않습니다.

```css
/* app/globals.css */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
```

### 1.2 Font Family 설정 (Tailwind CSS v4)

`@theme inline` 블록에서 font-family를 정의합니다. `tailwind.config.ts`는 사용하지 않습니다.

```css
/* app/globals.css */
@theme inline {
  --font-sans: "Pretendard Variable", Pretendard, -apple-system,
    BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;
}
```

### 1.3 Body 폰트 기본 설정

```css
body {
  font-family: var(--font-sans);
  font-feature-settings: "cv01", "cv02", "cv03", "cv04";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

> **`font-feature-settings`:** Pretendard의 OpenType 기능을 활성화합니다. `cv01`-`cv04`는 대체 글리프(alternative glyph) 설정으로, 숫자와 특수문자의 가독성을 높입니다.

---

## 2. 타이포그래피 스케일

### 2.1 기본 원칙

Tailwind CSS v4의 기본 fontSize 유틸리티(`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl` 등)를 직접 사용합니다. 커스텀 토큰이 필요하면 `@theme inline`에서 정의합니다.

```css
/* app/globals.css - 커스텀 토큰이 필요한 경우 */
@theme inline {
  --font-size-exam-title: 2rem;
  --font-size-exam-title--line-height: 2.5rem;
  --font-size-question-number: 1.25rem;
  --font-size-question-number--line-height: 1.75rem;
}
```

### 2.2 모의고사 앱 타이포그래피 맵

| 용도 | Tailwind 클래스 | HTML 요소 | 크기 |
| --- | --- | --- | --- |
| 시험 제목 | `text-2xl font-bold` 또는 `text-3xl font-bold` | `<h1>` | 24-30px |
| 섹션 제목 (파트 구분) | `text-xl font-semibold` | `<h2>` | 20px |
| 문항 번호 | `text-lg font-bold` | `<span>`, `<h3>` | 18px |
| 학생 이름/정보 라벨 | `text-base font-medium` | `<label>`, `<span>` | 16px |
| 본문 / 안내 메시지 | `text-base` | `<p>` | 16px |
| 보기 텍스트 | `text-base` 또는 `text-sm` | `<p>`, `<li>` | 14-16px |
| 타이머 | `text-xl font-bold tabular-nums` | `<span>`, `<time>` | 20px |
| 점수 표시 | `text-2xl font-bold tabular-nums` | `<span>` | 24px |
| 보조 텍스트 (메타정보) | `text-sm` | `<span>` | 14px |
| 캡션 / 부가 설명 | `text-xs` | `<span>` | 12px |
| 버튼 텍스트 | `text-base font-medium` 또는 `text-lg font-medium` | `<button>` | 16-18px |

### 2.3 시맨틱 HTML 요소 사용

```tsx
// 올바른 예: 시맨틱 요소 사용
<main>
  <h1 className="text-2xl font-bold text-fg-primary">2026 수학 모의고사</h1>
  <section aria-labelledby="part-1">
    <h2 id="part-1" className="text-xl font-semibold">Part 1. 객관식</h2>
    <article>
      <h3 className="text-lg font-bold">1번</h3>
      <p className="text-base">문항 내용...</p>
    </article>
  </section>
</main>

// 잘못된 예: div soup
<div>
  <div className="text-2xl font-bold">2026 수학 모의고사</div>
  <div className="text-xl">Part 1. 객관식</div>
</div>
```

---

## 3. 터치스크린 가독성

18-27인치 터치스크린 환경에서의 가독성 규칙입니다.

### 3.1 최소 폰트 크기

| 컨텍스트 | 최소 크기 | 권장 크기 | 이유 |
| --- | --- | --- | --- |
| 본문 텍스트 | 14px (`text-sm`) | 16px (`text-base`) | 터치스크린에서 기본 가독성 확보 |
| 캡션/보조 텍스트 | 12px (`text-xs`) | 14px (`text-sm`) | 보조 정보도 읽을 수 있어야 함 |
| 문항 번호 | 16px (`text-base`) | 18px (`text-lg`) | 빠른 시각적 탐색 지원 |
| 버튼 텍스트 | 16px (`text-base`) | 18px (`text-lg`) | 터치 대상 인식 용이성 |
| 타이머 | 18px (`text-lg`) | 20px (`text-xl`) | 시험 중 빠르게 확인 가능 |
| 입력 필드 | 16px (`text-base`) | 16px (`text-base`) | iOS 자동 줌 방지 |

### 3.2 터치 타겟과 텍스트 관계

터치 타겟 최소 크기는 44x44px(WCAG 2.5.5)입니다. 텍스트가 포함된 터치 가능 요소는 충분한 패딩을 확보합니다.

```tsx
// 보기 선택 버튼: 텍스트 + 패딩으로 터치 영역 확보
<button className="w-full min-h-[48px] px-4 py-3 text-base text-left rounded-lg border">
  <span className="font-bold mr-2">①</span>
  <span>보기 내용</span>
</button>

// 문항 번호 네비게이션
<button className="min-w-[48px] min-h-[48px] flex items-center justify-center text-lg font-bold rounded-full">
  1
</button>
```

### 3.3 줄 간격 (Line Height)

한국어 텍스트는 영어보다 글자 높이가 균일하지만 복잡한 글리프를 포함하므로 넉넉한 line-height가 필요합니다.

| 용도 | 권장 line-height | Tailwind 클래스 |
| --- | --- | --- |
| 문항 내용 (긴 텍스트) | 1.75 | `leading-7` 또는 `leading-relaxed` |
| 안내 메시지 | 1.625 | `leading-relaxed` |
| 짧은 라벨/번호 | 1.25-1.5 | `leading-tight` 또는 `leading-normal` |

### 3.4 색상 대비 (WCAG AA)

| 텍스트 유형 | 최소 대비율 |
| --- | --- |
| 본문 텍스트 | 4.5:1 |
| 큰 텍스트 (18px 이상 또는 14px bold) | 3:1 |
| UI 컴포넌트 | 3:1 |

시맨틱 색상 토큰을 사용하면 대비율이 자동으로 확보됩니다.

```tsx
<p className="text-fg-primary">주요 텍스트</p>       {/* 가장 진한 색 */}
<p className="text-fg-secondary">보조 텍스트</p>      {/* 중간 톤 */}
<p className="text-fg-tertiary">부가 정보</p>         {/* 연한 톤 */}
<span className="text-error-600">오류 메시지</span>
<span className="text-success-600">정답 표시</span>
```

---

## 4. 숫자 및 날짜 포맷

### 4.1 숫자 포맷

모의고사 앱에서 숫자는 문항 번호, 점수, 타이머, 정답률 등에 사용됩니다.

```typescript
// 점수 표시
function formatScore(score: number, total: number): string {
  return `${score}/${total}`;
}

// 정답률 표시
function formatPercent(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
// formatPercent(0.85) → "85%"
// formatPercent(0.856) → "85.6%"

// 타이머 포맷 (MM:SS 또는 HH:MM:SS)
function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}
// formatTimer(3661) → "01:01:01"
// formatTimer(125) → "02:05"
```

### 4.2 `tabular-nums`로 숫자 정렬

타이머, 점수 등 숫자가 실시간으로 변하는 UI에서는 `tabular-nums`를 사용하여 자릿수 점프를 방지합니다.

```tsx
// 타이머: 숫자 폭 고정
<span className="text-xl font-bold tabular-nums font-mono">
  {formatTimer(remainingSeconds)}
</span>

// 점수판
<span className="text-2xl font-bold tabular-nums">
  {score}/{totalQuestions}
</span>

// 문항 번호 리스트: 오른쪽 정렬 + tabular-nums
<span className="text-lg font-bold tabular-nums text-right min-w-[2ch]">
  {questionNumber}
</span>
```

### 4.3 날짜 포맷

한국어 날짜 표기를 따릅니다.

```typescript
import { format } from "date-fns";

// 시험 날짜 표시
format(new Date(examDate), "yyyy년 MM월 dd일");
// → "2026년 03월 24일"

// 시험 시간 표시
format(new Date(examDate), "yyyy-MM-dd HH:mm");
// → "2026-03-24 14:30"

// 간략한 날짜
format(new Date(examDate), "MM/dd");
// → "03/24"
```

---

## 5. 텍스트 관리 원칙

### 5.1 한국어 전용 앱의 텍스트 관리

이 앱은 한국어 전용이므로 i18n 라이브러리(`next-intl`, `react-intl` 등)를 사용하지 않습니다. 텍스트는 다음 방식으로 관리합니다.

**상수 파일로 관리하는 텍스트:**

```typescript
// constants/exam-text.ts
export const EXAM_TEXT = {
  title: "모의고사",
  submitButton: "제출하기",
  confirmSubmit: "답안을 제출하시겠습니까?",
  timeUp: "시험 시간이 종료되었습니다.",
  emptyAnswer: "답을 선택하지 않은 문항이 있습니다.",
  score: "점수",
  correctRate: "정답률",
  questionNumber: (n: number) => `${n}번`,
  remainingTime: "남은 시간",
  examComplete: "시험이 완료되었습니다.",
} as const;
```

**직접 JSX에 작성해도 되는 텍스트:**
- 한 곳에서만 사용되고 변경 가능성이 낮은 짧은 라벨
- 숫자 단위 (`점`, `분`, `초`)

**상수로 분리해야 하는 텍스트:**
- 여러 컴포넌트에서 재사용되는 텍스트
- 안내 메시지, 확인 다이얼로그 등 사용자에게 노출되는 문장

### 5.2 동적 텍스트 처리

```tsx
// 올바른 예: 템플릿 리터럴 사용
<p className="text-base">{`${currentQuestion}번 / 총 ${totalQuestions}문항`}</p>

// 올바른 예: 함수로 포맷팅
<span className="text-sm text-fg-secondary">
  {EXAM_TEXT.questionNumber(currentIndex + 1)}
</span>

// 잘못된 예: 문자열 연결
<p className="text-base">{"현재 " + currentQuestion + "번 문항입니다"}</p>
```

---

## 6. Anti-Patterns

```tsx
// [AP-1] 인라인 스타일 사용 금지
// ❌
<p style={{ fontSize: '14px', color: '#666' }}>안내 텍스트</p>
// ✅
<p className="text-sm text-fg-secondary">안내 텍스트</p>


// [AP-2] 하드코딩 색상 금지 (시맨틱 토큰 사용)
// ❌
<span className="text-gray-500">보조 텍스트</span>
// ✅
<span className="text-fg-tertiary">보조 텍스트</span>


// [AP-3] div를 텍스트 컨테이너로 사용 금지
// ❌
<div className="text-2xl font-bold">시험 제목</div>
// ✅
<h1 className="text-2xl font-bold">시험 제목</h1>


// [AP-4] 폰트 크기를 임의로 축소하지 않기 (터치스크린 가독성)
// ❌
<span className="text-[10px]">문항 번호</span>
// ✅
<span className="text-xs">문항 번호</span>  {/* 최소 12px */}


// [AP-5] 타이머/점수에 tabular-nums 누락
// ❌ 숫자가 바뀔 때 레이아웃이 흔들림
<span className="text-xl font-bold">{formatTimer(seconds)}</span>
// ✅
<span className="text-xl font-bold tabular-nums">{formatTimer(seconds)}</span>


// [AP-6] 페이지별 커스텀 텍스트 컴포넌트 남발
// ❌
const ExamTitleText = ({ children }) => (
  <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{children}</span>
);
// ✅ Tailwind 클래스 직접 사용
<h1 className="text-2xl font-bold text-fg-primary">{title}</h1>


// [AP-7] 숫자/날짜를 포맷 없이 표시
// ❌
<span>{examDate}</span>               {/* "2026-03-24T14:30:00Z" */}
<span>{correctRate}</span>             {/* 0.856 */}
// ✅
<span>{format(new Date(examDate), "yyyy년 MM월 dd일")}</span>
<span>{formatPercent(correctRate)}</span>
```

---

## 7. Quick Reference

### 터치스크린 체크리스트

- [ ] 본문 텍스트 최소 14px, 권장 16px (`text-base`)
- [ ] 입력 필드 16px 이상 (iOS 자동 줌 방지)
- [ ] 터치 타겟 최소 44x44px
- [ ] 타이머, 점수에 `tabular-nums` 적용
- [ ] 문항 내용 `leading-relaxed` 이상
- [ ] 버튼 텍스트 16px 이상

### 텍스트 색상 토큰

```
text-fg-primary     주요 텍스트 (시험 제목, 문항 내용)
text-fg-secondary   보조 텍스트 (안내 메시지)
text-fg-tertiary    부가 정보 (메타데이터, 캡션)
text-fg-muted       비활성 텍스트 (placeholder)
text-error-600      오류 / 오답 표시
text-success-600    정답 표시
text-warning-500    경고 (시간 부족 등)
text-accent         강조 / 링크
```

### 폰트 설정 요약

```
폰트:       Pretendard Variable (CDN @import)
설정 파일:   app/globals.css (@theme inline)
설정 방식:   tailwind.config.ts 없음, CSS custom properties 사용
숫자 표기:   tabular-nums (타이머, 점수)
안티앨리어싱: -webkit-font-smoothing: antialiased
```

### 코드 리뷰 체크리스트

- [ ] 시맨틱 HTML 요소 사용 (`h1`-`h6`, `p`, `span`, `time`, `label`)
- [ ] 헤딩 계층 논리적 (`h1` -> `h2` -> `h3`)
- [ ] Tailwind 타이포그래피 클래스 사용 (인라인 스타일 금지)
- [ ] 색상은 시맨틱 토큰 사용 (`text-fg-primary` 등)
- [ ] 폰트 크기 최소값 준수 (12px 이상)
- [ ] 숫자/날짜에 포맷 함수 적용
- [ ] 터치 타겟 크기 확보 (44px+)
- [ ] `tabular-nums` 필요한 곳에 적용
- [ ] `aria-label` 등 접근성 속성 필요한 곳에 추가
