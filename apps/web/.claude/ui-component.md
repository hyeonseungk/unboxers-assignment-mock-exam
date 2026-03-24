# UI 컴포넌트 가이드라인 (React + Vite + Tailwind CSS v4)

## Related Guides

- `.claude/design-color.md`: 시맨틱 컬러 토큰, 테마 변수 정의
- `.claude/typography-i18n.md`: 텍스트 컴포넌트, 폰트 규칙
- `.claude/form-handling.md`: 학생정보 입력 폼, 유효성 검증 패턴
- `.claude/animation-gesture.md`: 터치 인터랙션, 전환 애니메이션
- `.claude/screen-layout.md`: 화면 레이아웃, 반응형 규칙
- `.claude/state-management.md`: 답안 상태, 타이머 상태 관리
- `.claude/modal-dialog.md`: 확인 다이얼로그, 제출 모달

---

## Tech Stack

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | React + Vite | SPA, CSR 기반 |
| 스타일링 | Tailwind CSS v4 | CSS-first 설정, `@theme` 디렉티브 |
| 클래스 병합 | `clsx` + `tailwind-merge` | `cn()` 유틸리티 |
| 아이콘 | `lucide-react` | 트리쉐이킹 지원 |
| 상태 관리 | React state / context | 외부 라이브러리 최소화 |
| 타겟 디바이스 | 18-27인치 터치스크린 | 키오스크/태블릿 환경 |

---

## 1. 컴포넌트 설계 원칙

### 1.1 핵심 철학

- **합성 우선 (Composition over Inheritance):** 작은 컴포넌트를 조합해 복잡한 UI 구성
- **단일 책임 (Single Responsibility):** 한 컴포넌트는 한 가지 역할만 수행
- **Props over Customization:** 미리 정의된 variant 사용, 임의 스타일 오버라이드 지양
- **Tailwind First:** 유틸리티 클래스 우선, 인라인 스타일 금지
- **터치스크린 최적화:** 모든 인터랙티브 요소는 터치 환경 고려

### 1.2 네이밍 컨벤션

| 컴포넌트 유형 | 네이밍 패턴 | 예시 |
|--------------|------------|------|
| 공용 UI 컴포넌트 | 역할 기반 이름 | `Button`, `Timer`, `ProgressBar` |
| OMR 관련 | `Omr` 접두사 | `OmrBubble`, `OmrRow`, `OmrCard` |
| 화면 단위 | `*Screen` 또는 `*Page` | `ExamScreen`, `ResultScreen` |
| 레이아웃 | `*Layout`, `*Container` | `ExamLayout`, `QuestionContainer` |
| 기능 컴포넌트 | 설명적 이름 | `StudentInfoForm`, `ScoreChart` |

### 1.3 클래스 병합: cn()

```typescript
// lib/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 사용 예
<button className={cn(
  "px-6 py-3 rounded-xl font-medium",
  isSelected && "bg-blue-600 text-white",
  disabled && "opacity-50 pointer-events-none"
)} />
```

### 1.4 컴포넌트 export 규칙

```typescript
// named export + default export 병행
export const OmrBubble: React.FC<OmrBubbleProps> = (props) => { ... };
export default OmrBubble;
```

### 1.5 디렉토리 구조

```
src/
  components/
    ui/            # 공용 UI (Button, Timer, ProgressBar 등)
    omr/           # OMR 관련 컴포넌트
    exam/          # 시험 화면 컴포넌트
    result/        # 결과 화면 컴포넌트
    tutorial/      # 튜토리얼 슬라이드
    student/       # 학생정보 입력
  hooks/           # 커스텀 훅 (useTimer, useExamState 등)
  lib/utils/       # 유틸리티 (cn, 점수 계산 등)
```

---

## 2. 핵심 컴포넌트 패턴

### 2.1 OMR 버블 (객관식 1-5)

OMR 카드의 핵심 인터랙션 요소. 터치스크린에서 정확한 선택이 가능하도록 충분한 크기 확보.

```tsx
// components/omr/OmrBubble.tsx
interface OmrBubbleProps {
  /** 선택지 번호 (1-5) */
  number: 1 | 2 | 3 | 4 | 5;
  /** 선택 여부 */
  selected: boolean;
  /** 선택 핸들러 */
  onSelect: () => void;
  /** 비활성화 (시험 종료 후) */
  disabled?: boolean;
  /** 채점 결과 표시 모드 */
  resultMode?: {
    isCorrect: boolean;
    isAnswer: boolean;
  };
}

const OmrBubble: React.FC<OmrBubbleProps> = ({
  number,
  selected,
  onSelect,
  disabled = false,
  resultMode,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={`${number}번 선택지`}
      aria-pressed={selected}
      className={cn(
        // 기본: 원형, 최소 터치 영역 48x48
        "h-12 w-12 rounded-full flex items-center justify-center",
        "text-lg font-semibold transition-all duration-150",
        "border-2 select-none",
        // 터치 피드백
        "active:scale-95",
        // 기본 상태
        !selected && !resultMode && [
          "border-gray-300 text-gray-600 bg-white",
          "hover:border-gray-400 hover:bg-gray-50",
        ],
        // 선택 상태
        selected && !resultMode && [
          "border-blue-600 bg-blue-600 text-white",
          "shadow-md",
        ],
        // 채점 결과: 정답
        resultMode?.isCorrect && selected && "border-green-500 bg-green-500 text-white",
        // 채점 결과: 오답 (내가 선택했지만 틀림)
        resultMode && !resultMode.isCorrect && selected && "border-red-500 bg-red-500 text-white",
        // 채점 결과: 정답 표시 (내가 선택하지 않았지만 정답)
        resultMode?.isAnswer && !selected && "border-green-500 text-green-600 bg-green-50",
        // 비활성화
        disabled && "pointer-events-none opacity-60",
      )}
    >
      {number}
    </button>
  );
};
```

**설계 포인트:**
- `h-12 w-12` (48x48px): 터치스크린 최소 권장 크기
- `active:scale-95`: 터치 시 시각적 피드백
- `aria-pressed`: 토글 상태 접근성
- `resultMode`: 채점 후 정답/오답 시각적 구분

### 2.2 OMR 행 (문항 단위)

```tsx
// components/omr/OmrRow.tsx
interface OmrRowProps {
  /** 문항 번호 */
  questionNumber: number;
  /** 문항 타입 */
  type: "multiple-choice" | "short-answer";
  /** 현재 선택된 답 (객관식: 1-5, 주관식: string) */
  answer: number | string | null;
  /** 답 변경 핸들러 */
  onAnswerChange: (answer: number | string | null) => void;
  /** 비활성화 */
  disabled?: boolean;
}

const OmrRow: React.FC<OmrRowProps> = ({
  questionNumber,
  type,
  answer,
  onAnswerChange,
  disabled,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "border-b border-gray-100 last:border-b-0",
      )}
      role="group"
      aria-label={`${questionNumber}번 문항`}
    >
      {/* 문항 번호 */}
      <span className="w-10 text-center text-sm font-bold text-gray-700 shrink-0">
        {questionNumber}
      </span>

      {type === "multiple-choice" ? (
        /* 객관식: 1-5 버블 */
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((num) => (
            <OmrBubble
              key={num}
              number={num}
              selected={answer === num}
              onSelect={() => onAnswerChange(answer === num ? null : num)}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        /* 주관식: 숫자 입력 필드 */
        <ShortAnswerInput
          value={typeof answer === "string" ? answer : ""}
          onChange={(val) => onAnswerChange(val || null)}
          disabled={disabled}
        />
      )}
    </div>
  );
};
```

### 2.3 주관식 숫자 입력

주관식 답안은 숫자만 입력 가능하며, 터치스크린 가상 키보드를 고려한 설계.

```tsx
// components/omr/ShortAnswerInput.tsx
interface ShortAnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 최대 입력 자릿수 */
  maxLength?: number;
}

const ShortAnswerInput: React.FC<ShortAnswerInputProps> = ({
  value,
  onChange,
  disabled = false,
  maxLength = 5,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= maxLength) {
      onChange(raw);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      maxLength={maxLength}
      placeholder="답 입력"
      aria-label="주관식 답안 입력"
      className={cn(
        "h-12 w-40 px-4 text-center text-lg font-mono",
        "border-2 border-gray-300 rounded-xl",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
        "placeholder:text-gray-400",
        "transition-colors",
        disabled && "bg-gray-100 text-gray-400 pointer-events-none",
      )}
    />
  );
};
```

**설계 포인트:**
- `inputMode="numeric"`: 모바일/터치에서 숫자 키패드 활성화
- `h-12` (48px): 터치 타겟 높이 확보
- `font-mono`: 숫자 정렬 일관성
- 숫자 외 입력 필터링

### 2.4 시험 타이머

```tsx
// components/ui/Timer.tsx
interface TimerProps {
  /** 남은 시간 (초) */
  remainingSeconds: number;
  /** 전체 시간 (초) */
  totalSeconds: number;
  /** 경고 임계값 (초, 이하일 때 경고 스타일) */
  warningThreshold?: number;
  /** 위험 임계값 (초, 이하일 때 위험 스타일) */
  dangerThreshold?: number;
}

const Timer: React.FC<TimerProps> = ({
  remainingSeconds,
  totalSeconds,
  warningThreshold = 600,  // 10분
  dangerThreshold = 60,    // 1분
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = (remainingSeconds / totalSeconds) * 100;

  const isDanger = remainingSeconds <= dangerThreshold;
  const isWarning = remainingSeconds <= warningThreshold;

  return (
    <div
      className="flex items-center gap-3"
      role="timer"
      aria-live="polite"
      aria-label={`남은 시간 ${minutes}분 ${seconds}초`}
    >
      {/* 프로그레스 바 */}
      <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isDanger && "bg-red-500",
            isWarning && !isDanger && "bg-amber-500",
            !isWarning && "bg-blue-500",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 시간 표시 */}
      <span
        className={cn(
          "text-2xl font-mono font-bold tabular-nums min-w-[5ch] text-right",
          isDanger && "text-red-600 animate-pulse",
          isWarning && !isDanger && "text-amber-600",
          !isWarning && "text-gray-800",
        )}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};
```

**설계 포인트:**
- `role="timer"` + `aria-live="polite"`: 스크린리더 타이머 인식
- `tabular-nums`: 숫자 폭 고정 (시간 변경 시 레이아웃 흔들림 방지)
- 3단계 색상 (정상/경고/위험): 시간 긴박감 시각적 전달
- `animate-pulse`: 위험 구간에서 주의 환기

### 2.5 결과 카드

```tsx
// components/result/ScoreCard.tsx
interface ScoreCardProps {
  /** 과목명 */
  subject: string;
  /** 획득 점수 */
  score: number;
  /** 만점 */
  totalScore: number;
  /** 맞은 문항 수 */
  correctCount: number;
  /** 전체 문항 수 */
  totalCount: number;
  /** 등급 (선택) */
  grade?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  subject,
  score,
  totalScore,
  correctCount,
  totalCount,
  grade,
}) => {
  const percentage = Math.round((score / totalScore) * 100);

  return (
    <div className={cn(
      "rounded-2xl bg-white p-6 shadow-lg",
      "border border-gray-100",
    )}>
      {/* 과목명 + 등급 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{subject}</h3>
        {grade && (
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-semibold",
            percentage >= 80 && "bg-green-100 text-green-700",
            percentage >= 60 && percentage < 80 && "bg-amber-100 text-amber-700",
            percentage < 60 && "bg-red-100 text-red-700",
          )}>
            {grade}
          </span>
        )}
      </div>

      {/* 점수 */}
      <div className="text-center py-4">
        <span className="text-5xl font-bold text-gray-900">{score}</span>
        <span className="text-xl text-gray-400 ml-1">/ {totalScore}</span>
      </div>

      {/* 정답률 바 */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{correctCount}/{totalCount} 문항 정답</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              percentage >= 80 && "bg-green-500",
              percentage >= 60 && percentage < 80 && "bg-amber-500",
              percentage < 60 && "bg-red-500",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
```

### 2.6 튜토리얼 슬라이드

```tsx
// components/tutorial/TutorialSlide.tsx
interface TutorialSlideProps {
  /** 현재 단계 (0-based) */
  currentStep: number;
  /** 전체 단계 수 */
  totalSteps: number;
  /** 슬라이드 제목 */
  title: string;
  /** 슬라이드 설명 */
  description: string;
  /** 일러스트/이미지 */
  illustration?: React.ReactNode;
  /** 다음 단계 */
  onNext: () => void;
  /** 이전 단계 */
  onPrev: () => void;
  /** 건너뛰기 */
  onSkip: () => void;
}
```

**슬라이드 네비게이션 패턴:**

```tsx
{/* 하단 네비게이션 */}
<div className="flex items-center justify-between px-8 py-6">
  {/* 이전 버튼 */}
  <button
    type="button"
    onClick={onPrev}
    disabled={currentStep === 0}
    className={cn(
      "h-14 px-8 rounded-xl text-lg font-medium",
      "transition-colors",
      currentStep === 0
        ? "text-gray-300 pointer-events-none"
        : "text-gray-600 hover:bg-gray-100 active:bg-gray-200",
    )}
  >
    이전
  </button>

  {/* 페이지 인디케이터 (dot) */}
  <div className="flex gap-2" role="tablist">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div
        key={i}
        role="tab"
        aria-selected={i === currentStep}
        className={cn(
          "h-2.5 rounded-full transition-all duration-300",
          i === currentStep ? "w-8 bg-blue-600" : "w-2.5 bg-gray-300",
        )}
      />
    ))}
  </div>

  {/* 다음/시작 버튼 */}
  <button
    type="button"
    onClick={isLastStep ? onSkip : onNext}
    className={cn(
      "h-14 px-8 rounded-xl text-lg font-semibold",
      "transition-colors active:scale-[0.98]",
      "bg-blue-600 text-white hover:bg-blue-700",
    )}
  >
    {isLastStep ? "시작하기" : "다음"}
  </button>
</div>
```

### 2.7 학생정보 입력 폼

```tsx
// components/student/StudentInfoForm.tsx
interface StudentInfoFormProps {
  onSubmit: (info: StudentInfo) => void;
}

interface StudentInfo {
  name: string;
  school: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
}
```

**입력 필드 패턴 (터치스크린 최적화):**

```tsx
{/* 터치 최적화 입력 필드 */}
<div className="space-y-5">
  <div>
    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
      이름 <span className="text-red-500">*</span>
    </label>
    <input
      id="name"
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="이름을 입력하세요"
      className={cn(
        "w-full h-14 px-5 text-lg rounded-xl",
        "border-2 border-gray-200",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
        "placeholder:text-gray-400",
        error && "border-red-500 focus:border-red-500 focus:ring-red-200",
      )}
    />
    {error && (
      <p className="mt-1.5 text-sm text-red-500">{error}</p>
    )}
  </div>
</div>
```

### 2.8 Button 컴포넌트

```tsx
// components/ui/Button.tsx
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "lg" | "md" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500",
  secondary: "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300 disabled:text-gray-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  lg: "h-14 px-8 text-lg rounded-xl",   // 56px - 터치스크린 CTA용
  md: "h-12 px-6 text-base rounded-xl",  // 48px - 기본
  sm: "h-10 px-4 text-sm rounded-lg",    // 40px - 보조 액션
};
```

**사이즈 가이드 (터치스크린 기준):**

| 사이즈 | 높이 | 용도 | 비고 |
|--------|------|------|------|
| `lg` | 56px (h-14) | 시험 시작, 제출, 주요 CTA | 18인치 이상 권장 |
| `md` | 48px (h-12) | 일반 버튼 | 기본값, WCAG 터치 타겟 충족 |
| `sm` | 40px (h-10) | 보조 액션, 인라인 | 최소 크기 |

---

## 3. 터치스크린 UI 고려사항

### 3.1 터치 타겟 크기

> **WCAG 2.5.5 (AAA):** 터치 타겟 최소 44x44px. 이 프로젝트는 18-27인치 터치스크린 대상이므로 **48x48px 이상** 권장.

```tsx
// 최소 터치 타겟 보장
<button className="min-h-12 min-w-12 flex items-center justify-center">
  <Icon className="h-5 w-5" />
</button>

// 히트 영역 확장 (시각적 크기 < 터치 영역)
<button className="relative p-2 after:absolute after:inset-[-8px] after:content-['']">
  <Icon className="h-5 w-5" />
</button>
```

### 3.2 터치 피드백

터치스크린에서 hover가 없으므로 `active` 상태로 즉각적 피드백 제공.

```tsx
// 터치 피드백 패턴
const touchFeedback = {
  scale: "active:scale-[0.97] transition-transform",
  color: "active:bg-blue-700 transition-colors",
  opacity: "active:opacity-80 transition-opacity",
};

// OMR 버블: 스케일 + 색상 변화
<button className="active:scale-95 transition-all duration-150">
  {number}
</button>

// 일반 버튼: 배경색 변화
<button className="bg-blue-600 active:bg-blue-800 transition-colors">
  다음
</button>
```

### 3.3 간격과 여백

터치스크린에서 오터치를 방지하기 위한 간격 규칙.

| 요소 | 최소 간격 | Tailwind | 비고 |
|------|----------|----------|------|
| OMR 버블 간 | 8px | `gap-2` | 인접 버블 오선택 방지 |
| 문항 행 간 | 12px | `py-3` | 행 구분 명확화 |
| 버튼 간 | 12px | `gap-3` | CTA 버튼 사이 |
| 섹션 간 | 24px | `gap-6` | 논리적 구분 |
| 화면 가장자리 | 24px 이상 | `px-6` | 엣지 터치 방지 |

### 3.4 스크롤 영역

OMR 카드처럼 세로로 긴 컨텐츠는 부드러운 스크롤 처리.

```tsx
// 스크롤 가능한 OMR 영역
<div className={cn(
  "flex-1 overflow-y-auto",
  // iOS 모멘텀 스크롤
  "-webkit-overflow-scrolling-touch",
  // 스크롤바 숨김 (터치에서 불필요)
  "scrollbar-none",
)}>
  {questions.map((q) => (
    <OmrRow key={q.number} {...q} />
  ))}
</div>
```

### 3.5 의도치 않은 인터랙션 방지

```tsx
// 텍스트 선택 방지 (OMR 영역)
<div className="select-none">
  {/* OMR 컨텐츠 */}
</div>

// 더블탭 줌 방지 (전역 또는 특정 영역)
// CSS: touch-action: manipulation;
<div className="touch-manipulation">
  {/* 터치 인터랙션 영역 */}
</div>

// 드래그 방지 (이미지, 버튼)
<img draggable={false} className="pointer-events-none select-none" />
```

---

## 4. 스타일링 패턴

### 4.1 Tailwind CSS v4 설정

Tailwind CSS v4는 CSS-first 설정 방식을 사용. `@theme` 디렉티브로 디자인 토큰 정의.

```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;

  --radius-bubble: 9999px;
  --radius-card: 1rem;
  --radius-button: 0.75rem;
}
```

### 4.2 반복 패턴: 카드

```tsx
// 카드 기본 스타일 패턴
const cardBase = "rounded-2xl bg-white border border-gray-100 shadow-sm";
const cardPadding = "p-5 sm:p-6";
const cardHover = "hover:shadow-md transition-shadow"; // 터치에서는 불필요

// 사용
<div className={cn(cardBase, cardPadding)}>
  {children}
</div>
```

### 4.3 반복 패턴: 상태 배지

```tsx
type ExamStatus = "not-started" | "in-progress" | "submitted" | "graded";

const statusStyles: Record<ExamStatus, string> = {
  "not-started": "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  "submitted": "bg-amber-100 text-amber-700",
  "graded": "bg-green-100 text-green-700",
};

<span className={cn(
  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
  statusStyles[status],
)}>
  {statusLabel}
</span>
```

### 4.4 반복 패턴: 프로그레스 바

```tsx
// 답안 작성 진행률
<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
  <div
    className="h-full bg-blue-500 rounded-full transition-all duration-300"
    style={{ width: `${(answeredCount / totalCount) * 100}%` }}
    role="progressbar"
    aria-valuenow={answeredCount}
    aria-valuemin={0}
    aria-valuemax={totalCount}
    aria-label={`${answeredCount}/${totalCount} 문항 작성 완료`}
  />
</div>
```

### 4.5 색상 사용 원칙

| 용도 | 색상 | Tailwind 클래스 |
|------|------|----------------|
| 주요 액션 (CTA) | 파랑 | `bg-blue-600`, `text-blue-600` |
| 정답/성공 | 초록 | `bg-green-500`, `text-green-700` |
| 오답/에러 | 빨강 | `bg-red-500`, `text-red-600` |
| 경고/주의 | 노랑/호박 | `bg-amber-500`, `text-amber-600` |
| 비활성/보조 | 회색 | `bg-gray-300`, `text-gray-500` |
| 배경 | 흰색/밝은 회색 | `bg-white`, `bg-gray-50` |

> 하드코딩된 색상값(`bg-[#007AFF]`) 대신 Tailwind 팔레트 또는 `@theme` 커스텀 토큰을 사용합니다.

---

## 5. 접근성

### 5.1 시맨틱 HTML

```tsx
// 버튼: <button> 사용
<button type="button" onClick={handleSelect}>선택</button>

// 네비게이션: <a> 또는 라우터 Link 사용
<Link to="/result">결과 보기</Link>

// 폼 제출: <form> + <button type="submit">
<form onSubmit={handleSubmit}>
  <button type="submit">제출</button>
</form>

// div에 onClick 금지
// <div onClick={...}> (X)
```

### 5.2 ARIA 속성

```tsx
// OMR 버블: 토글 버튼
<button aria-pressed={selected} aria-label={`${number}번`}>

// 타이머: 라이브 리전
<div role="timer" aria-live="polite">

// 프로그레스 바
<div role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>

// 아이콘 전용 버튼
<button aria-label="이전 문항">
  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
</button>
```

### 5.3 포커스 관리

```tsx
// 포커스 링 스타일 (키보드 네비게이션)
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">

// 터치스크린에서는 focus-visible만 사용 (focus와 구분)
// focus: 터치 시에도 표시 (불필요)
// focus-visible: 키보드 네비게이션 시에만 표시 (권장)
```

---

## 6. Anti-Patterns

```tsx
// (1) div를 버튼으로 사용
<div onClick={onSelect} className="cursor-pointer">1</div>       // X
<button type="button" onClick={onSelect}>1</button>               // O

// (2) 터치 타겟 부족
<button className="p-1"><X className="h-4 w-4" /></button>       // X (24x24px)
<button className="min-h-12 min-w-12 flex items-center justify-center">
  <X className="h-5 w-5" />
</button>                                                         // O (48x48px)

// (3) 하드코딩 색상
<div className="bg-[#2563eb]">...</div>                           // X
<div className="bg-blue-600">...</div>                            // O

// (4) 인라인 스타일
<div style={{ borderRadius: "16px", padding: "24px" }}>...</div> // X
<div className="rounded-2xl p-6">...</div>                        // O
// 예외: 동적 값 (width, transform 등)은 style 속성 허용

// (5) 화면별 중복 컴포넌트
const ExamPageButton = () => <button>...</button>;                 // X
<Button variant="primary" label="시험 시작" />                     // O

// (6) 접근성 미흡 아이콘 버튼
<button><ChevronLeft /></button>                                   // X
<button aria-label="이전"><ChevronLeft aria-hidden="true" /></button> // O

// (7) hover만으로 상태 전달 (터치에서 hover 없음)
<button className="hover:bg-blue-100">...</button>                // X (hover만 의존)
<button className="active:bg-blue-200 hover:bg-blue-100">...</button> // O

// (8) OMR 영역에서 텍스트 선택 허용
<div>{/* OMR 버블 */}</div>                                        // X
<div className="select-none">{/* OMR 버블 */}</div>                // O

// (9) 모든 곳에 select-none 적용
<input className="select-none" />                                  // X (입력 필드에는 선택 필요)
<div className="select-none">{/* 버블 영역만 */}</div>              // O
```

---

## 7. Quick Reference

### 컴포넌트 → 파일 위치

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| `OmrBubble` | `components/omr/OmrBubble.tsx` | 객관식 선택지 버블 (1-5) |
| `OmrRow` | `components/omr/OmrRow.tsx` | 문항 행 (번호 + 버블/입력) |
| `OmrCard` | `components/omr/OmrCard.tsx` | OMR 카드 전체 (스크롤 영역 + 행 목록) |
| `ShortAnswerInput` | `components/omr/ShortAnswerInput.tsx` | 주관식 숫자 입력 |
| `Timer` | `components/ui/Timer.tsx` | 시험 타이머 (프로그레스 + 시간) |
| `Button` | `components/ui/Button.tsx` | 범용 버튼 (variant/size) |
| `ProgressBar` | `components/ui/ProgressBar.tsx` | 진행률 바 |
| `ScoreCard` | `components/result/ScoreCard.tsx` | 채점 결과 카드 |
| `TutorialSlide` | `components/tutorial/TutorialSlide.tsx` | 튜토리얼 슬라이드 |
| `StudentInfoForm` | `components/student/StudentInfoForm.tsx` | 학생정보 입력 폼 |

### 터치스크린 체크리스트

| 항목 | 기준 |
|------|------|
| 터치 타겟 크기 | 48x48px 이상 (`min-h-12 min-w-12`) |
| 버블 간 간격 | 8px 이상 (`gap-2`) |
| 터치 피드백 | `active:` 상태 필수 |
| 텍스트 선택 | OMR 영역 `select-none` |
| 줌 방지 | `touch-manipulation` |
| 스크롤 | `-webkit-overflow-scrolling-touch` |

### Tailwind 자주 쓰는 패턴

```
카드:       rounded-2xl bg-white border border-gray-100 shadow-sm p-6
버튼(CTA):  h-14 px-8 rounded-xl bg-blue-600 text-white font-semibold active:bg-blue-800
버블:       h-12 w-12 rounded-full border-2 flex items-center justify-center
입력필드:   h-14 px-5 rounded-xl border-2 border-gray-200 text-lg
배지:       px-3 py-1 rounded-full text-sm font-medium
프로그레스:  h-2 bg-gray-200 rounded-full overflow-hidden
```

---

## 8. PR Checklist

### 터치/인터랙션

- [ ] 모든 인터랙티브 요소 터치 타겟 48x48px 이상
- [ ] OMR 버블 간 간격 충분 (오선택 방지)
- [ ] `active:` 상태로 터치 피드백 제공
- [ ] OMR 영역 `select-none` 적용
- [ ] `touch-manipulation` 적용 (더블탭 줌 방지)
- [ ] 시맨틱 `<button>` 사용 (`<div onClick>` 금지)

### OMR 컴포넌트

- [ ] 객관식 버블 선택/해제 토글 동작
- [ ] 주관식 숫자만 입력 가능 (문자 필터링)
- [ ] `inputMode="numeric"` 적용 (숫자 키패드)
- [ ] 채점 결과 모드 정답/오답 시각적 구분
- [ ] 빈 답안 제출 가능 여부 확인

### 타이머

- [ ] `role="timer"` + `aria-live` 적용
- [ ] `tabular-nums` 폰트로 레이아웃 안정성
- [ ] 경고/위험 임계값에 색상 변화
- [ ] 0초 도달 시 자동 제출 처리

### 스타일링

- [ ] Tailwind CSS 유틸리티 클래스 사용
- [ ] 하드코딩 색상값 없음
- [ ] 인라인 스타일 없음 (동적 값 예외)
- [ ] `cn()` 으로 조건부 클래스 병합
- [ ] 18-27인치 터치스크린에서 가독성 확인

### 접근성

- [ ] 아이콘 전용 버튼 `aria-label` 제공
- [ ] OMR 버블 `aria-pressed` 적용
- [ ] 프로그레스 바 `role="progressbar"` + `aria-value*`
- [ ] `focus-visible:ring` 포커스 스타일
- [ ] 동적 컨텐츠 `aria-live` 리전

### 컴포넌트 설계

- [ ] 공용 컴포넌트 `components/ui/` 또는 도메인별 디렉토리 배치
- [ ] Props 인터페이스 명시적 타입 정의
- [ ] `forwardRef` 필요 시 적용
- [ ] named export + default export 병행
