# Utility & Helper Guidelines

모의고사 웹앱에서 사용하는 모든 유틸리티 함수는 **순수 함수(Pure Function)**로 작성한다. UI 렌더링 로직과 비즈니스 계산 로직을 철저히 분리하여 단위 테스트가 가능한 구조를 유지한다.

---

## 1. 유틸리티 원칙

| 원칙 | 설명 |
| --- | --- |
| **순수 함수** | 동일 입력에 항상 동일 출력을 반환한다. 외부 상태를 읽거나 변경하지 않는다. |
| **단일 책임** | 하나의 함수는 하나의 역할만 수행한다. 시간 포맷팅 함수가 점수 계산까지 하지 않는다. |
| **불변성** | 입력값을 직접 변형(mutate)하지 않고 항상 새로운 값을 반환한다. |
| **방어적 코딩** | 잘못된 입력(null, undefined, NaN)에 대해 안전한 기본값을 반환한다. |
| **명시적 타이핑** | `any` 타입을 사용하지 않는다. 입력과 출력 타입을 정확히 명시한다. |
| **TSDoc 필수** | 공개 함수에는 `@param`, `@returns`, `@example`을 포함하는 TSDoc을 작성한다. |

---

## 2. 디렉토리 구조

```
src/lib/utils/
├── __tests__/             # 유틸리티 테스트 파일
│   ├── timer.test.ts
│   ├── score.test.ts
│   ├── cn.test.ts
│   └── guard.test.ts
├── cn.ts                  # Tailwind CSS 클래스 병합 (clsx + tailwind-merge)
├── timer.ts               # 시간 포맷팅 (타이머 표시, 경과 시간)
├── score.ts               # 점수 계산 (정답률, 과목별 점수, 등급)
├── guard.ts               # 타입 가드 (Question, Answer, ExamResult 등)
├── format.ts              # 범용 포맷팅 (숫자, 퍼센트)
└── index.ts               # Barrel export
```

### Barrel Export

```typescript
// src/lib/utils/index.ts
export { cn } from "./cn";
export { formatTime, formatElapsed, formatCountdown } from "./timer";
export { calcScore, calcAccuracy, calcGrade } from "./score";
export { isQuestion, isAnswer, isExamResult, isNonEmpty } from "./guard";
export { formatNumber, formatPercent } from "./format";
```

> **Vite + React 환경**에서 tree-shaking이 정상 동작하므로 barrel export를 안전하게 사용할 수 있다.

---

## 3. 주요 유틸리티 구현

### 3.1 시간 포맷팅 (timer.ts)

모의고사의 타이머 표시, 경과 시간, 남은 시간 계산에 사용한다.

```typescript
// src/lib/utils/timer.ts

/**
 * 초(seconds) 단위의 시간을 "MM:SS" 형식으로 변환한다.
 * @param seconds - 변환할 초 단위 시간
 * @returns "MM:SS" 형식의 문자열
 * @example
 * formatTime(125)  // "02:05"
 * formatTime(0)    // "00:00"
 * formatTime(-10)  // "00:00"
 */
export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

/**
 * 초(seconds) 단위의 시간을 "HH:MM:SS" 형식으로 변환한다.
 * 총 시험 시간이 1시간 이상인 경우에 사용한다.
 * @param seconds - 변환할 초 단위 시간
 * @returns "HH:MM:SS" 형식의 문자열
 * @example
 * formatElapsed(3661)  // "01:01:01"
 * formatElapsed(59)    // "00:00:59"
 */
export const formatElapsed = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hrs, mins, secs]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

/**
 * 남은 시간(초)을 사용자 친화적 문자열로 변환한다.
 * 5분 이하일 때 경고 스타일과 함께 사용한다.
 * @param remainingSeconds - 남은 시간 (초)
 * @returns 포맷된 문자열
 * @example
 * formatCountdown(300)  // "5분 00초"
 * formatCountdown(45)   // "45초"
 * formatCountdown(0)    // "시간 종료"
 */
export const formatCountdown = (remainingSeconds: number): string => {
  if (!Number.isFinite(remainingSeconds) || remainingSeconds <= 0) {
    return "시간 종료";
  }

  const mins = Math.floor(remainingSeconds / 60);
  const secs = Math.floor(remainingSeconds % 60);

  if (mins === 0) return `${secs}초`;
  return `${mins}분 ${String(secs).padStart(2, "0")}초`;
};
```

### 3.2 점수 계산 (score.ts)

모의고사 채점, 정답률 계산, 등급 판정에 사용한다.

```typescript
// src/lib/utils/score.ts

interface ScoreInput {
  /** 정답 수 */
  correct: number;
  /** 전체 문제 수 */
  total: number;
}

interface GradeResult {
  /** 등급 라벨 (예: "1등급", "2등급") */
  label: string;
  /** 등급 번호 (1~9) */
  grade: number;
}

/**
 * 정답 수와 전체 문제 수로 점수(100점 만점)를 계산한다.
 * @param input - 정답 수와 전체 문제 수
 * @returns 0~100 사이의 점수 (소수점 첫째 자리까지)
 * @example
 * calcScore({ correct: 18, total: 20 })  // 90
 * calcScore({ correct: 7, total: 30 })   // 23.3
 * calcScore({ correct: 0, total: 0 })    // 0
 */
export const calcScore = ({ correct, total }: ScoreInput): number => {
  if (total <= 0 || correct < 0) return 0;
  const score = (Math.min(correct, total) / total) * 100;
  return Math.round(score * 10) / 10;
};

/**
 * 정답률을 퍼센트 문자열로 반환한다.
 * @param input - 정답 수와 전체 문제 수
 * @returns 퍼센트 문자열 (예: "85.0%")
 * @example
 * calcAccuracy({ correct: 17, total: 20 })  // "85.0%"
 * calcAccuracy({ correct: 0, total: 0 })    // "0.0%"
 */
export const calcAccuracy = ({ correct, total }: ScoreInput): string => {
  const score = calcScore({ correct, total });
  return `${score.toFixed(1)}%`;
};

/**
 * 점수에 따른 등급을 판정한다.
 * 수능 표준 등급 기준을 따른다.
 * @param score - 0~100 사이의 점수
 * @returns 등급 정보
 * @example
 * calcGrade(96)  // { label: "1등급", grade: 1 }
 * calcGrade(78)  // { label: "3등급", grade: 3 }
 * calcGrade(-5)  // { label: "9등급", grade: 9 }
 */
export const calcGrade = (score: number): GradeResult => {
  if (!Number.isFinite(score)) return { label: "9등급", grade: 9 };

  const thresholds: [number, number][] = [
    [96, 1],
    [89, 2],
    [77, 3],
    [60, 4],
    [40, 5],
    [23, 6],
    [11, 7],
    [4, 8],
  ];

  for (const [min, grade] of thresholds) {
    if (score >= min) return { label: `${grade}등급`, grade };
  }

  return { label: "9등급", grade: 9 };
};
```

---

## 4. cn 유틸리티 (Tailwind CSS 클래스 병합)

Tailwind CSS v4 환경에서 조건부 클래스 조합 시 반드시 `cn` 유틸리티를 사용한다.

### 구현

```typescript
// src/lib/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS 클래스를 조건부로 병합한다.
 * clsx로 조건부 클래스를 처리하고, tailwind-merge로 충돌을 해결한다.
 * @param inputs - 클래스 문자열, 객체, 배열 등
 * @returns 병합된 클래스 문자열
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### 사용 패턴

```typescript
// 기본 조합
<div className={cn("flex items-center", "gap-4")} />

// 타이머 상태에 따른 조건부 스타일
<span
  className={cn(
    "font-mono text-lg tabular-nums",
    {
      "text-red-500 animate-pulse": remainingSeconds <= 60,
      "text-yellow-500": remainingSeconds <= 300 && remainingSeconds > 60,
      "text-gray-700": remainingSeconds > 300,
    }
  )}
>
  {formatCountdown(remainingSeconds)}
</span>

// 문제 번호 버튼 (답안 상태 표시)
<button
  className={cn(
    "w-10 h-10 rounded-full text-sm font-medium",
    "transition-colors duration-150",
    {
      "bg-blue-500 text-white": isAnswered,
      "bg-gray-100 text-gray-600 hover:bg-gray-200": !isAnswered,
      "ring-2 ring-blue-400": isCurrent,
    }
  )}
/>

// 외부 className 오버라이드 허용
interface QuestionCardProps {
  className?: string;
  children: React.ReactNode;
}

function QuestionCard({ className, children }: QuestionCardProps) {
  return (
    <div className={cn("rounded-lg border p-6 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

// 호출 시 스타일 오버라이드 가능
<QuestionCard className="bg-yellow-50 border-yellow-200">
  {/* tailwind-merge가 bg-white를 제거하고 bg-yellow-50 적용 */}
</QuestionCard>
```

### 문자열 결합 사용 금지

```typescript
// Bad - 클래스 충돌을 해결할 수 없다
<div className={`p-4 ${isActive ? "bg-blue-500" : "bg-gray-100"}`} />

// Bad - 템플릿 리터럴 + 조건부 결합
<div className={`p-4 ${disabled && "opacity-50"}`} />

// Good - cn 유틸리티 사용
<div className={cn("p-4", isActive ? "bg-blue-500" : "bg-gray-100")} />
<div className={cn("p-4", disabled && "opacity-50")} />
```

---

## 5. 타입 가드

API 응답이나 상태 데이터의 타입을 런타임에 안전하게 좁히기 위해 타입 가드를 사용한다.

```typescript
// src/lib/utils/guard.ts

import type { Question, Answer, ExamResult } from "@/types";

/**
 * 값이 유효한 Question 객체인지 검사한다.
 * @example
 * if (isQuestion(data)) {
 *   // data는 Question 타입으로 좁혀진다
 *   console.log(data.questionText);
 * }
 */
export const isQuestion = (value: unknown): value is Question => {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.questionText === "string" &&
    Array.isArray(obj.options) &&
    obj.options.length > 0
  );
};

/**
 * 값이 유효한 Answer 객체인지 검사한다.
 */
export const isAnswer = (value: unknown): value is Answer => {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.questionId === "string" &&
    (typeof obj.selectedOption === "number" || obj.selectedOption === null)
  );
};

/**
 * 값이 유효한 ExamResult 객체인지 검사한다.
 */
export const isExamResult = (value: unknown): value is ExamResult => {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.score === "number" &&
    typeof obj.totalQuestions === "number" &&
    typeof obj.correctAnswers === "number"
  );
};

/**
 * 값이 null이나 undefined가 아닌지 검사한다.
 * 배열 필터링에서 타입을 좁힐 때 유용하다.
 * @example
 * const items = [1, null, 2, undefined, 3];
 * const valid = items.filter(isNonEmpty); // number[]
 */
export const isNonEmpty = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};
```

### 타입 가드 사용 패턴

```typescript
// API 응답 검증
const response = await fetchQuestions(examId);
const validQuestions = response.filter(isQuestion);

// 조건 분기
if (isExamResult(data)) {
  const grade = calcGrade(data.score);
  // ...
}

// 배열 필터링에서 타입 좁히기
const answeredQuestions = questions
  .map((q) => findAnswer(q.id))
  .filter(isNonEmpty);
```

---

## 6. Anti-Patterns

### 하지 말아야 할 것

| Anti-Pattern | 이유 | 올바른 방법 |
| --- | --- | --- |
| 유틸리티에서 React Hook 사용 | 유틸리티 != Hook | `src/hooks/`에 분리 |
| 유틸리티에서 JSX 반환 | 유틸리티 != 컴포넌트 | `src/components/`에 분리 |
| 외부 상태(전역 변수) 참조 | 순수 함수 원칙 위반 | 필요한 값을 매개변수로 전달 |
| `any` 타입 사용 | 타입 안전성 파괴 | 제네릭 또는 구체적 타입 사용 |
| 문자열 결합으로 className 생성 | 클래스 충돌 미해결 | `cn()` 유틸리티 사용 |
| 입력값 직접 변형 (mutate) | 예측 불가능한 버그 | 새로운 값을 복사 후 반환 |
| 테스트 없는 유틸리티 | 회귀 버그 방치 | `__tests__/` 디렉토리에 테스트 작성 |
| catch 블록에서 에러 무시 | 디버깅 불가 | 최소한 `console.warn` 호출 |
| 하나의 파일에 모든 유틸리티 | 파일 비대화 | 기능 단위로 파일 분리 |

### 경계 사례: Hook인가, 유틸리티인가

```typescript
// 유틸리티 - 순수 계산이므로 utils/timer.ts에 위치
export const formatTime = (seconds: number): string => { /* ... */ };

// Hook - React 상태를 관리하므로 hooks/useTimer.ts에 위치
export const useTimer = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  // setInterval 로직...
  return { seconds, formatted: formatTime(seconds) };
};
```

Hook 내부에서 유틸리티 함수를 호출하는 것은 권장한다. 반대로 유틸리티가 Hook에 의존하는 것은 금지한다.

---

## 7. 테스트 작성

모든 유틸리티 함수는 `__tests__/` 디렉토리에 테스트를 작성한다. 정상 입력, 경계값, 잘못된 입력 세 가지 범주를 반드시 포함한다.

```typescript
// src/lib/utils/__tests__/timer.test.ts
import { describe, expect, it } from "vitest";
import { formatTime, formatCountdown } from "../timer";

describe("formatTime", () => {
  // 정상 입력
  it("초를 MM:SS 형식으로 변환한다", () => {
    expect(formatTime(125)).toBe("02:05");
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(3600)).toBe("60:00");
  });

  // 경계값
  it("59초를 올바르게 표시한다", () => {
    expect(formatTime(59)).toBe("00:59");
  });

  // 잘못된 입력
  it("음수는 00:00을 반환한다", () => {
    expect(formatTime(-10)).toBe("00:00");
  });

  it("NaN은 00:00을 반환한다", () => {
    expect(formatTime(NaN)).toBe("00:00");
  });

  it("Infinity는 00:00을 반환한다", () => {
    expect(formatTime(Infinity)).toBe("00:00");
  });
});

describe("formatCountdown", () => {
  it("0 이하는 시간 종료를 반환한다", () => {
    expect(formatCountdown(0)).toBe("시간 종료");
    expect(formatCountdown(-1)).toBe("시간 종료");
  });

  it("60초 미만은 초만 표시한다", () => {
    expect(formatCountdown(45)).toBe("45초");
  });

  it("60초 이상은 분:초 형식으로 표시한다", () => {
    expect(formatCountdown(300)).toBe("5분 00초");
    expect(formatCountdown(61)).toBe("1분 01초");
  });
});
```

```typescript
// src/lib/utils/__tests__/score.test.ts
import { describe, expect, it } from "vitest";
import { calcScore, calcGrade } from "../score";

describe("calcScore", () => {
  it("정답 비율을 100점 만점으로 환산한다", () => {
    expect(calcScore({ correct: 18, total: 20 })).toBe(90);
    expect(calcScore({ correct: 20, total: 20 })).toBe(100);
  });

  it("전체 문제 수가 0이면 0을 반환한다", () => {
    expect(calcScore({ correct: 0, total: 0 })).toBe(0);
  });

  it("정답 수가 전체 문제 수를 초과하면 100으로 제한한다", () => {
    expect(calcScore({ correct: 25, total: 20 })).toBe(100);
  });
});

describe("calcGrade", () => {
  it("96점 이상은 1등급이다", () => {
    expect(calcGrade(96)).toEqual({ label: "1등급", grade: 1 });
    expect(calcGrade(100)).toEqual({ label: "1등급", grade: 1 });
  });

  it("4점 미만은 9등급이다", () => {
    expect(calcGrade(3)).toEqual({ label: "9등급", grade: 9 });
    expect(calcGrade(0)).toEqual({ label: "9등급", grade: 9 });
  });
});
```

---

## 8. Quick Reference

### Naming Conventions

| 접두사 | 용도 | 모의고사 앱 예시 |
| --- | --- | --- |
| `format*` | 값을 표시 형식으로 변환 | `formatTime`, `formatCountdown` |
| `calc*` | 계산 로직 | `calcScore`, `calcAccuracy`, `calcGrade` |
| `is*` | 타입 가드 / boolean 검증 | `isQuestion`, `isAnswer`, `isNonEmpty` |
| `parse*` | 문자열을 구조화 데이터로 변환 | `parseExamData`, `parseTimeLimit` |
| `get*` | 값 추출 | `getQuestionById`, `getNextUnanswered` |
| `to*` | 타입/형식 변환 | `toSeconds`, `toMinutes` |
| `create*` | 객체 생성 | `createEmptyAnswerSheet` |

### Import 규칙

```typescript
// cn은 항상 단독 import
import { cn } from "@/lib/utils/cn";

// 기능 단위 import (barrel export 활용)
import { formatTime, formatCountdown } from "@/lib/utils/timer";
import { calcScore, calcGrade } from "@/lib/utils/score";
import { isQuestion, isNonEmpty } from "@/lib/utils/guard";
```

### 체크리스트

새 유틸리티 함수를 추가할 때 다음을 확인한다.

- [ ] 순수 함수인가? (외부 상태 의존 없음)
- [ ] 입출력 타입이 명시되어 있는가?
- [ ] TSDoc(`@param`, `@returns`, `@example`)을 작성했는가?
- [ ] 잘못된 입력에 대한 방어 로직이 있는가?
- [ ] `__tests__/`에 테스트를 작성했는가?
- [ ] barrel export(`index.ts`)에 추가했는가?
- [ ] 기능에 맞는 파일에 위치하는가? (모호한 `utils.ts`가 아닌 `timer.ts`, `score.ts` 등)
