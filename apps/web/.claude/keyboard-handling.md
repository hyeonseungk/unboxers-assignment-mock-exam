# Input & Focus Management Guidelines

터치스크린(18-27인치) + 키보드 환경에서의 이벤트 처리, 포커스 관리, 접근성 패턴 가이드라인입니다.
모의고사 앱 특성상 OMR 버블 선택, 주관식 숫자 키패드 입력, 문항 간 탭 이동, 모달 ESC 닫기가 핵심 시나리오입니다.

## Related Guides

- `.agents/form-handling.md`: 폼 상태 관리, 유효성 검사, 입력 컴포넌트 패턴
- `.agents/modal-dialog.md`: 포커스 트랩, ESC 처리, Dialog/Toast 패턴
- `.agents/ui-component.md`: 공용 버튼, 입력, 다이얼로그 트리거 컴포넌트
- `.agents/animation-gesture.md`: 터치 인터랙션 애니메이션, 피드백 효과
- `.agents/design-color.md`: 포커스 링, 선택 상태 등 semantic color token

---

## 1. Tech Stack

| Library / API | Purpose |
| --- | --- |
| React Event System | `onClick`, `onKeyDown`, `onTouchStart` 등 합성 이벤트 처리 |
| Native DOM APIs | `focus()`, `blur()`, `scrollIntoView()` 등 포커스 제어 |
| `@radix-ui/react-dialog` | 모달 포커스 트랩, ESC 닫기 (내장) |
| Tailwind CSS | 포커스 스타일링, 터치 타겟 사이즈 |

---

## 2. 이벤트 처리 원칙

### 2.1 React 합성 이벤트 우선

DOM 이벤트 리스너 직접 등록 대신 React 합성 이벤트를 사용합니다. `useEffect` 내 `addEventListener`는 전역 단축키 등 불가피한 경우에만 허용합니다.

```tsx
// Good - React 합성 이벤트
const OMRBubble = ({ value, selected, onSelect }: OMRBubbleProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={() => onSelect(value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(value);
      }
    }}
    className={`w-12 h-12 rounded-full border-2 transition-colors
      ${selected ? "bg-accent border-accent text-white" : "border-line hover:bg-background-tertiary"}
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
  >
    {value}
  </button>
);

// Bad - useEffect에서 DOM 리스너 직접 등록
useEffect(() => {
  const handler = (e: Event) => { /* ... */ };
  document.addEventListener("click", handler);
  return () => document.removeEventListener("click", handler);
}, []);
```

### 2.2 전역 키보드 단축키 (허용되는 useEffect 패턴)

ESC로 모달 닫기, 문항 번호 단축키 등 전역 단축키는 `useEffect`로 등록합니다. 반드시 cleanup 함수를 포함해야 합니다.

```tsx
useEffect(() => {
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    // 입력 필드에 포커스된 상태에서는 단축키 무시
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

    if (e.key === "Escape") {
      onClose();
    }
  };

  document.addEventListener("keydown", handleGlobalKeyDown);
  return () => document.removeEventListener("keydown", handleGlobalKeyDown);
}, [onClose]);
```

### 2.3 onClick으로 터치와 클릭 통합 처리

터치스크린 환경에서 `onClick`은 터치와 마우스 클릭 모두를 처리합니다. `onTouchStart`/`onTouchEnd`를 별도 등록하면 이중 실행(double-fire) 문제가 발생할 수 있으므로, 기본적으로 `onClick` 하나로 통합합니다.

```tsx
// Good - onClick 하나로 터치/클릭 통합
<button onClick={handleSelect}>선택</button>

// Bad - 이중 실행 위험
<button
  onClick={handleSelect}
  onTouchEnd={handleSelect}  // onClick과 중복 실행됨
>
  선택
</button>
```

**`onTouchStart`가 필요한 예외 상황**: 터치 시작 시점에 시각적 피드백(press effect)을 즉시 보여줘야 할 때만 사용합니다. 이 경우 `onClick`과 로직을 분리해야 합니다.

```tsx
const [isPressed, setIsPressed] = useState(false);

<button
  onTouchStart={() => setIsPressed(true)}  // 시각 피드백만
  onTouchEnd={() => setIsPressed(false)}    // 시각 피드백만
  onClick={handleSelect}                    // 실제 로직
  className={isPressed ? "scale-95" : ""}
>
  {value}
</button>
```

---

## 3. 포커스 관리

### 3.1 tabIndex 규칙

| 값 | 설명 | 사용 |
| --- | --- | --- |
| `tabIndex={0}` | 자연스러운 탭 순서에 포함 | 비-인터랙티브 요소를 포커스 가능하게 만들 때 |
| `tabIndex={-1}` | 프로그래밍 방식으로만 포커스 가능 | 에러 메시지, 동적 영역, roving tabIndex 비활성 항목 |
| `tabIndex={1+}` | 사용 금지 | 자연스러운 탭 순서 파괴 |

### 3.2 OMR 문항 간 포커스 이동

모의고사에서 문항별 OMR 그룹 간 Tab 이동이 핵심 시나리오입니다. 각 문항 그룹은 하나의 `radiogroup`으로 취급하고, 그룹 내부는 화살표 키, 그룹 간은 Tab 키로 이동합니다.

```tsx
const OMRGroup = ({ questionNumber, options, selectedAnswer, onAnswer }: OMRGroupProps) => {
  const [focusedIndex, setFocusedIndex] = useState(
    selectedAnswer ? options.indexOf(selectedAnswer) : 0
  );
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        nextIndex = (index + 1) % options.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        nextIndex = (index - 1 + options.length) % options.length;
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        onAnswer(options[index]);
        return;
      default:
        return;
    }

    setFocusedIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={`${questionNumber}번 문항`}>
      <span className="text-sm font-medium text-fg-secondary">{questionNumber}</span>
      <div className="flex gap-2">
        {options.map((option, index) => (
          <button
            key={option}
            ref={(el) => { buttonRefs.current[index] = el; }}
            type="button"
            role="radio"
            aria-checked={selectedAnswer === option}
            aria-label={`${questionNumber}번 ${option}번`}
            tabIndex={index === focusedIndex ? 0 : -1}
            onClick={() => onAnswer(option)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors
              ${selectedAnswer === option
                ? "bg-accent border-accent text-white"
                : "border-line hover:bg-background-tertiary"}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 3.3 주관식 입력 후 자동 포커스 이동

주관식 숫자 입력(가상 키패드 또는 물리 키보드)에서 최대 자릿수 입력 완료 시 다음 문항으로 자동 포커스를 이동합니다.

```tsx
const ShortAnswerInput = ({ questionNumber, maxLength, onAnswer, nextRef }: ShortAnswerInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > maxLength) return;

    onAnswer(value);

    // 최대 자릿수 도달 시 다음 문항으로 이동
    if (value.length === maxLength && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  return (
    <div>
      <label htmlFor={`answer-${questionNumber}`} className="text-sm font-medium">
        {questionNumber}번 답
      </label>
      <input
        ref={inputRef}
        id={`answer-${questionNumber}`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={maxLength}
        aria-label={`${questionNumber}번 문항 주관식 답 입력`}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-line rounded-md text-center text-lg
          focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent"
      />
    </div>
  );
};
```

### 3.4 모달 포커스 관리

Radix Dialog가 포커스 트랩, ESC 닫기, 닫힌 후 이전 포커스 복원을 자동 처리합니다. 수동 구현은 불필요합니다.

```tsx
import * as Dialog from "@radix-ui/react-dialog";

const ExamModal = ({ isOpen, onClose, children }: ExamModalProps) => (
  <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
        bg-surface rounded-xl p-6 max-w-md w-full">
        <Dialog.Title>시험 안내</Dialog.Title>
        <Dialog.Description asChild>
          <span className="sr-only">시험 관련 안내 사항</span>
        </Dialog.Description>
        {children}
        <Dialog.Close asChild>
          <button className="mt-4 px-4 py-2 bg-background-tertiary rounded-md
            focus-visible:ring-2 focus-visible:ring-accent">
            닫기
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### 3.5 포커스 스타일링

| 요소 유형 | 권장 Tailwind 클래스 |
| --- | --- |
| 버튼 / OMR 버블 | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` |
| 입력 필드 | `focus:outline-none focus:ring-2 focus:ring-accent-light focus:border-accent` |
| 링크 | `focus:outline-none focus-visible:underline` |
| 카드 / 패널 | `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` |

`focus-visible`은 키보드 포커스에만 반응하여 마우스/터치 클릭 시 불필요한 포커스 링을 숨깁니다. 입력 필드는 항상 포커스 상태를 표시해야 하므로 `focus:`를 사용합니다.

---

## 4. 터치 최적화

### 4.1 터치 타겟 사이즈

WCAG 2.5.5 기준 최소 44x44px이지만, 터치스크린 키오스크 환경에서는 48x48px 이상을 권장합니다.

```tsx
// Good - 충분한 터치 타겟
<button className="min-w-[48px] min-h-[48px] p-3">
  {value}
</button>

// Bad - 너무 작은 터치 타겟
<button className="w-6 h-6 text-xs">
  {value}
</button>
```

### 4.2 가상 키패드 (숫자 입력용)

터치스크린에서 OS 가상 키보드 대신 앱 내장 숫자 키패드를 제공하면 UX가 향상됩니다. `inputMode="none"`으로 OS 키보드를 억제하고 커스텀 키패드를 렌더링합니다.

```tsx
const NumericKeypad = ({ onInput, onDelete, onConfirm }: NumericKeypadProps) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div
      role="group"
      aria-label="숫자 키패드"
      className="grid grid-cols-3 gap-2 p-4"
    >
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onInput(key)}
          className="min-h-[56px] rounded-lg bg-background-secondary text-lg font-medium
            active:bg-background-tertiary transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={onDelete}
        aria-label="지우기"
        className="min-h-[56px] rounded-lg bg-background-secondary
          active:bg-background-tertiary transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        지우기
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="min-h-[56px] rounded-lg bg-accent text-white font-medium
          active:bg-accent-hover transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        확인
      </button>
    </div>
  );
};

// 사용 시 - OS 키보드 억제
<input
  inputMode="none"  // OS 가상 키보드 표시 안 함
  readOnly           // 직접 타이핑 방지, 키패드로만 입력
  value={answer}
  aria-label="주관식 답 입력"
  className="..."
/>
```

### 4.3 터치 피드백

터치 인터랙션에 즉각적인 시각 피드백을 제공합니다. CSS `active` 의사 클래스가 가장 간단하고 안정적입니다.

```tsx
// active 의사 클래스로 터치 피드백
<button className="transition-all active:scale-95 active:bg-accent-hover">
  선택
</button>
```

### 4.4 touch-action 설정

스크롤, 줌 등 브라우저 기본 터치 동작이 앱 인터랙션과 충돌할 수 있습니다. OMR 영역처럼 정밀한 터치가 필요한 곳에서 `touch-action`을 제한합니다.

```tsx
// OMR 버블 영역 - 핀치줌/스크롤 방지
<div className="touch-action-none">
  {bubbles}
</div>

// 세로 스크롤만 허용 (문항 목록)
<div className="touch-action-pan-y overflow-y-auto">
  {questionList}
</div>
```

---

## 5. 접근성 (Accessibility)

### 5.1 ARIA 속성 매핑 (모의고사 컴포넌트)

| 컴포넌트 | 필수 속성 |
| --- | --- |
| OMR 그룹 | `role="radiogroup"`, `aria-label="N번 문항"` |
| OMR 버블 | `role="radio"`, `aria-checked`, `aria-label="N번 M번"` |
| 주관식 입력 | `aria-label="N번 문항 주관식 답 입력"` |
| 가상 키패드 | `role="group"`, `aria-label="숫자 키패드"`, 각 키에 명시적 텍스트 |
| 시험 타이머 | `role="timer"`, `aria-live="polite"`, `aria-label="남은 시간"` |
| 문항 네비게이션 | `role="navigation"`, `aria-label="문항 이동"` |
| 모달/다이얼로그 | Radix Dialog 내장 (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) |
| 에러 메시지 | `role="alert"`, `aria-live="assertive"` |
| 로딩 상태 | `aria-busy="true"`, `aria-live="polite"` |

### 5.2 시험 타이머 접근성

타이머는 시각적으로 항상 표시되지만, 스크린 리더가 매초 읽으면 방해가 됩니다. `aria-live="polite"`로 설정하되, 업데이트 빈도를 분 단위 또는 주요 시점(5분, 1분 남음)으로 제한합니다.

```tsx
const ExamTimer = ({ remainingSeconds }: { remainingSeconds: number }) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeText = `${minutes}분 ${seconds}초`;

  // 스크린 리더용: 5분, 1분 남았을 때만 알림
  const isAnnouncePoint = (remainingSeconds === 300 || remainingSeconds === 60);

  return (
    <>
      <div role="timer" aria-label="남은 시간" className="text-lg font-mono tabular-nums">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      {isAnnouncePoint && (
        <div role="alert" className="sr-only">
          남은 시간 {timeText}
        </div>
      )}
    </>
  );
};
```

### 5.3 스크린 리더 전용 텍스트

```tsx
// 아이콘 버튼에 접근성 레이블
<button aria-label="이전 문항">
  <IconChevronLeft className="w-5 h-5" aria-hidden="true" />
</button>

// 시각적으로 숨겨진 보조 텍스트
<span className="sr-only">정답 표시</span>
```

### 5.4 폼 필드 접근성

```tsx
const AnswerField = ({ questionNumber, error }: AnswerFieldProps) => {
  const inputId = `answer-${questionNumber}`;
  const errorId = `answer-error-${questionNumber}`;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium mb-1">
        {questionNumber}번 답
        <span aria-hidden="true" className="text-error-500 ml-1">*</span>
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-3 py-2 border rounded-md
          ${error ? "border-error-500" : "border-line"}
          focus:outline-none focus:ring-2 focus:ring-accent-light`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-error-500">
          {error}
        </p>
      )}
    </div>
  );
};
```

---

## 6. Anti-Patterns

### 6.1 tabIndex 양수 값

```tsx
// Bad - 탭 순서가 예측 불가능해짐
<input tabIndex={1} />
<input tabIndex={3} />
<input tabIndex={2} />

// Good - DOM 순서대로 또는 0/-1만 사용
<input tabIndex={0} />
<input tabIndex={0} />
<input tabIndex={0} />
```

### 6.2 포커스 스타일 제거

```tsx
// Bad - 키보드 사용자가 현재 위치를 알 수 없음
<button className="outline-none focus:outline-none">버튼</button>

// Good - focus-visible로 키보드 포커스만 표시
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
  버튼
</button>
```

### 6.3 클릭 핸들러만 있는 div

```tsx
// Bad - 키보드/스크린 리더 접근 불가
<div onClick={handleClick}>선택</div>

// Good - 키보드 접근성 추가
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
>
  선택
</div>

// Best - 시맨틱 HTML 사용
<button type="button" onClick={handleClick}>선택</button>
```

### 6.4 onClick + onTouchEnd 이중 등록

```tsx
// Bad - 터치 디바이스에서 두 번 실행됨
<button onClick={handleAction} onTouchEnd={handleAction}>실행</button>

// Good - onClick 하나로 통합
<button onClick={handleAction}>실행</button>
```

### 6.5 터치 타겟 사이즈 미달

```tsx
// Bad - 터치스크린에서 조작 어려움 (32px 미만)
<button className="w-8 h-8 text-xs">{value}</button>

// Good - 최소 48x48px 보장
<button className="min-w-[48px] min-h-[48px]">{value}</button>
```

### 6.6 ARIA 속성 누락

```tsx
// Bad - 스크린 리더가 OMR 상태를 알 수 없음
<div className={selected ? "bg-accent" : ""} onClick={() => onSelect(value)}>
  {value}
</div>

// Good - 역할과 상태 명시
<button
  role="radio"
  aria-checked={selected}
  aria-label={`${questionNumber}번 ${value}번`}
  onClick={() => onSelect(value)}
>
  {value}
</button>
```

### 6.7 inputMode 미지정으로 부적절한 OS 키보드 노출

```tsx
// Bad - 터치스크린에서 전체 키보드가 표시됨
<input type="text" />

// Good - 숫자 키패드 표시
<input type="text" inputMode="numeric" pattern="[0-9]*" />

// Good - 앱 내장 키패드 사용 시 OS 키보드 억제
<input type="text" inputMode="none" readOnly />
```

---

## Quick Reference

### 이벤트 처리 체크리스트

- [ ] React 합성 이벤트(`onClick`, `onKeyDown`) 우선 사용
- [ ] `onClick`으로 터치/클릭 통합 처리 (`onTouchEnd` 이중 등록 금지)
- [ ] 전역 단축키만 `useEffect` + `addEventListener` 허용 (cleanup 필수)
- [ ] `onTouchStart`는 시각 피드백 용도에만 사용, 로직은 `onClick`에 위임

### 포커스 관리 체크리스트

- [ ] OMR 그룹: roving tabIndex로 그룹 내 화살표 키 이동, 그룹 간 Tab 이동
- [ ] 주관식 입력: 최대 자릿수 도달 또는 Enter 시 다음 문항으로 자동 이동
- [ ] 모달: Radix Dialog의 내장 포커스 트랩 활용 (수동 구현 금지)
- [ ] `tabIndex`는 0과 -1만 사용 (양수 금지)
- [ ] 모든 인터랙티브 요소에 `focus-visible` 포커스 스타일 적용

### 터치 최적화 체크리스트

- [ ] 모든 터치 타겟 최소 48x48px
- [ ] OMR 영역에 `touch-action: none` 적용 (줌/스크롤 방지)
- [ ] 터치 피드백: `active:` 의사 클래스 또는 press 상태 활용
- [ ] 가상 키패드 사용 시 `inputMode="none"` + `readOnly`로 OS 키보드 억제

### 접근성 체크리스트

- [ ] OMR 버블에 `role="radio"`, `aria-checked`, `aria-label` 적용
- [ ] OMR 그룹에 `role="radiogroup"`, `aria-label` 적용
- [ ] 시험 타이머에 `role="timer"`, 주요 시점만 `role="alert"` 알림
- [ ] 아이콘 버튼에 `aria-label` 또는 `sr-only` 텍스트
- [ ] 에러 메시지에 `role="alert"`, 폼 필드에 `aria-invalid` + `aria-describedby`

### Input Type 매핑

| 입력 유형 | type | inputMode | 비고 |
| --- | --- | --- | --- |
| OMR 선택 | `button` | - | `role="radio"` |
| 주관식 숫자 (물리 키보드) | `text` | `numeric` | `pattern="[0-9]*"` |
| 주관식 숫자 (가상 키패드) | `text` | `none` | `readOnly`, 커스텀 키패드 |
| 수험번호 입력 | `text` | `numeric` | `autoComplete="off"` |
| 이름 입력 | `text` | - | `autoComplete="name"` |
