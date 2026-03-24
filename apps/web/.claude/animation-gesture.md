# Animation & Gesture Guidelines

18-27인치 터치스크린 모의고사 웹앱을 위한 **CSS/Tailwind CSS v4 기반 애니메이션**과 **터치 제스처 처리** 가이드라인입니다. 60fps 유지와 터치 반응성을 최우선으로 합니다.

---

## Related Guides

- `.claude/screen-layout.md`: 페이지 레이아웃, 화면 구성과 전환 애니메이션 연계 시 참고
- `.claude/ui-component.md`: 공용 UI 컴포넌트의 인터랙션 피드백 패턴을 맞출 때 참고
- `.claude/performance.md`: 애니메이션 성능 측정, GPU 가속, 리렌더링 최적화를 함께 검토할 때 참고
- `.claude/design-color.md`: 애니메이션에 사용되는 색상 토큰, 강조색 변화를 맞출 때 참고

---

## 1. 애니메이션 원칙

### 1.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **CSS 우선** | CSS Transitions/Animations + Tailwind v4를 기본으로 사용. JS 애니메이션은 CSS로 불가능한 경우에만 |
| **터치 우선 피드백** | 터치스크린 환경이므로 `active:` 상태 피드백이 `hover:`보다 중요 |
| **목적 있는 애니메이션** | 장식이 아닌 상태 변화 전달, 사용자 주의 유도, 조작 피드백 목적으로만 사용 |
| **GPU 가속 활용** | `transform`, `opacity` 속성을 우선 사용하여 레이아웃 재계산 방지 |
| **일관된 타이밍** | Duration/Easing 토큰을 통일하여 앱 전체 리듬감 유지 |

### 1.2 모의고사 앱 주요 애니메이션 대상

| 대상 | 유형 | 설명 |
|------|------|------|
| 페이지 전환 | Transition | 문제 페이지 간 이동, 결과 화면 진입 |
| OMR 버블 선택 | Feedback | 답안 선택 시 시각적 확인 피드백 |
| 타이머 경고 | Attention | 남은 시간 부족 시 깜빡임/색상 변화 |
| 채점 결과 표시 | Reveal | 정답/오답 표시, 점수 카운트업 |
| 튜토리얼 슬라이드 | Gesture | 스와이프 기반 슬라이드 전환 |

---

## 2. Duration & Easing 토큰

### 2.1 Duration 표준

일관된 UX를 위해 아래 duration 범위를 참고합니다. 코드에서는 Tailwind duration 클래스를 직접 사용합니다.

| 용도 | Tailwind Class | 값 | 사용 예시 |
|------|----------------|-----|-----------|
| 즉각 피드백 | `duration-75` ~ `duration-100` | 75-100ms | OMR 버블 탭 피드백, 버튼 press |
| 빠른 전환 | `duration-150` | 150ms | 드롭다운, 툴팁 |
| 기본 전환 | `duration-200` | 200ms | 상태 토글, 색상 변화 |
| 강조 전환 | `duration-300` | 300ms | 모달, 페이지 전환 |
| 느린 전환 | `duration-500` | 500ms | 프로그레스 바, 점수 카운트업 |
| 경고 효과 | `duration-1000` | 1000ms | 타이머 깜빡임 주기 |

### 2.2 Easing 표준

| 용도 | Tailwind Class | 설명 |
|------|----------------|------|
| 기본 전환 | `ease-in-out` | 자연스러운 시작/끝 감속 |
| 진입 애니메이션 | `ease-out` | 빠르게 나타나서 부드럽게 정착 |
| 퇴장 애니메이션 | `ease-in` | 부드럽게 시작해서 빠르게 사라짐 |
| 스프링 효과 | CSS `cubic-bezier` | OMR 버블 선택 등 탄성 피드백 |

> **참고:** Tailwind v4에서는 `@theme`을 통해 커스텀 easing을 정의할 수 있습니다. 프로젝트에 스프링 효과가 빈번하다면 `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` 같은 토큰을 추가하세요.

---

## 3. CSS Transitions (Tailwind v4)

### 3.1 OMR 버블 선택 피드백

```tsx
// OMR 답안 버블 — 터치 탭 시 즉각 피드백 + 선택 상태 전환
<button
  type="button"
  aria-pressed={isSelected}
  onClick={() => onSelect(optionId)}
  className={cn(
    "w-14 h-14 rounded-full border-2 flex items-center justify-center",
    "text-lg font-bold select-none",
    "transition-all duration-100 ease-out",
    // 터치 피드백
    "active:scale-95",
    // 선택 상태
    isSelected
      ? "border-accent bg-accent text-white scale-105"
      : "border-line bg-surface text-fg-primary",
    // 정답/오답 피드백 (채점 후)
    showResult && isCorrect && "border-green-500 bg-green-50 text-green-700",
    showResult && !isCorrect && isSelected && "border-red-500 bg-red-50 text-red-700"
  )}
>
  {label}
</button>
```

### 3.2 버튼 터치 피드백

```tsx
// 터치스크린 환경 버튼 — active 상태 강조
<button
  className={cn(
    "bg-accent text-white rounded-xl px-8 py-4",
    "text-lg font-semibold select-none",
    "transition-all duration-100",
    "active:scale-[0.97] active:bg-accent-hover"
  )}
>
  다음 문제
</button>
```

> **`hover:` vs `active:`:** 터치스크린에서는 `hover:` 상태가 불안정합니다. 버튼 피드백은 `active:` 기반으로 처리하세요. `hover:`는 마우스 입력 대비용으로 보조적으로만 추가합니다.

### 3.3 타이머 경고 효과

```tsx
// 남은 시간 경고 — 색상 전환 + 깜빡임
<div
  className={cn(
    "text-2xl font-bold tabular-nums transition-colors duration-300",
    remainingMinutes > 5 && "text-fg-primary",
    remainingMinutes <= 5 && remainingMinutes > 1 && "text-amber-500",
    remainingMinutes <= 1 && "text-red-500 animate-timer-warning"
  )}
>
  {formatTime(remainingSeconds)}
</div>
```

```css
/* globals.css — 타이머 경고 키프레임 */
@keyframes timer-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Tailwind v4 @theme 등록 */
@theme {
  --animate-timer-warning: timer-warning 1s ease-in-out infinite;
}
```

### 3.4 Toggle Switch (터치 최적화)

```tsx
// 터치 영역을 충분히 확보한 Toggle
<button
  type="button"
  role="switch"
  aria-checked={isOn}
  onClick={() => setIsOn(!isOn)}
  className={cn(
    "relative inline-flex h-10 w-[4.5rem] items-center rounded-full",
    "transition-colors duration-200 ease-in-out",
    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    isOn ? "bg-accent" : "bg-line-secondary"
  )}
>
  <span className={cn(
    "inline-block h-7 w-7 transform rounded-full bg-white shadow-md",
    "transition-transform duration-200 ease-in-out",
    isOn ? "translate-x-9" : "translate-x-1.5"
  )} />
</button>
```

> **터치 영역:** 터치스크린 환경에서 인터랙티브 요소의 최소 터치 영역은 **44x44px** 이상을 유지합니다.

### 3.5 드롭다운 & 팝오버

```tsx
// opacity + visibility 전환 (조건부 렌더링 없이 애니메이션 보장)
<div
  className={cn(
    "absolute top-full mt-2 w-full rounded-xl border border-line",
    "bg-surface shadow-xl",
    "transition-all duration-200 ease-out",
    isOpen
      ? "opacity-100 visible translate-y-0"
      : "opacity-0 invisible -translate-y-1"
  )}
>
  {/* 드롭다운 내용 */}
</div>
```

### 3.6 Group Hover/Active 연계

```tsx
// 문제 카드 — 부모 터치 시 자식 요소 연계 효과
<div className="group rounded-2xl bg-surface border border-line p-6
                active:border-accent transition-all duration-200">
  <h3 className="text-fg-primary group-active:text-accent transition-colors">
    문제 {questionNumber}
  </h3>
  <ChevronRight className="text-fg-muted group-active:text-accent
                            group-active:translate-x-1 transition-all" />
</div>
```

---

## 4. CSS Keyframe Animations (Tailwind v4)

### 4.1 Tailwind v4 커스텀 애니메이션 등록

Tailwind v4에서는 `@theme` 블록을 통해 커스텀 키프레임과 애니메이션을 등록합니다.

```css
/* globals.css */

/* 키프레임 정의 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes count-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 스프링 바운스 easing */
@keyframes bubble-select {
  0% { transform: scale(1); }
  40% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1.05); }
}

/* @theme에 애니메이션 토큰 등록 */
@theme {
  --animate-fade-in-up: fade-in-up 0.3s ease-out forwards;
  --animate-scale-in: scale-in 0.2s ease-out forwards;
  --animate-count-up: count-up 0.4s ease-out forwards;
  --animate-slide-in-right: slide-in-right 0.3s ease-out forwards;
  --animate-slide-in-left: slide-in-left 0.3s ease-out forwards;
  --animate-bubble-select: bubble-select 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  --animate-timer-warning: timer-warning 1s ease-in-out infinite;
}
```

### 4.2 페이지 전환 애니메이션

```tsx
// 문제 페이지 진입 — fade-in-up
<div className="animate-fade-in-up">
  <QuestionContent question={currentQuestion} />
</div>

// 방향에 따른 슬라이드 (이전/다음 문제)
<div
  key={questionId}
  className={cn(
    direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left"
  )}
>
  <QuestionContent question={currentQuestion} />
</div>
```

### 4.3 채점 결과 표시

```tsx
// 점수 카운트업 — stagger 효과 (animation-delay)
<div className="flex flex-col items-center gap-6">
  {/* 총점 */}
  <div className="animate-scale-in text-5xl font-bold text-accent">
    {score}점
  </div>

  {/* 세부 결과 — stagger delay */}
  {results.map((result, i) => (
    <div
      key={result.id}
      className="animate-fade-in-up"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      <ResultCard result={result} />
    </div>
  ))}
</div>
```

> **animation-delay stagger 패턴:** 목록 항목의 순차적 진입은 `style={{ animationDelay }}` inline으로 처리합니다. 이는 동적 delay 값이 필요한 경우의 정당한 inline style 사용입니다.

### 4.4 빌트인 애니메이션

```tsx
// 로딩 스피너
<Loader2 className="animate-spin h-6 w-6 text-accent" />

// 스켈레톤 로딩
<div className="animate-pulse bg-surface-secondary h-6 w-3/4 rounded-lg" />

// 진입 애니메이션 (animate-in 조합)
<div className="animate-in fade-in-0 zoom-in-95 duration-150">
  {/* 드롭다운/팝오버 내용 */}
</div>
```

---

## 5. 터치 제스처 처리

### 5.1 기본 원칙

| 원칙 | 설명 |
|------|------|
| **네이티브 이벤트 우선** | `onTouchStart/Move/End` + `onPointerDown/Move/Up`으로 직접 구현 |
| **마우스 호환** | 터치 + 마우스 모두 작동하도록 Pointer Events API 사용 |
| **패시브 리스너** | 스크롤 성능을 위해 `{ passive: true }` 기본 사용 |
| **제스처 임계값** | 의도하지 않은 제스처 방지를 위해 최소 이동 거리 설정 |
| **최소 터치 영역** | 44x44px 이상의 터치 타겟 보장 |

### 5.2 터치/탭 처리

```tsx
// 기본 탭 — onClick으로 충분 (React가 터치/클릭 모두 처리)
<button onClick={handleSelect} className="...">
  {label}
</button>

// 빠른 피드백이 필요한 경우 — onPointerDown 활용
<button
  onPointerDown={() => setIsPressed(true)}
  onPointerUp={() => {
    setIsPressed(false);
    handleAction();
  }}
  onPointerLeave={() => setIsPressed(false)}
  className={cn(
    "transition-transform duration-75",
    isPressed && "scale-95"
  )}
>
  {label}
</button>
```

### 5.3 스와이프 제스처 (튜토리얼 슬라이드)

```tsx
"use client";

import { useRef, useCallback } from "react";

interface SwipeConfig {
  threshold?: number;      // 스와이프 인식 최소 거리 (px)
  velocityThreshold?: number; // 빠른 스와이프 감지 속도 (px/ms)
}

function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  config: SwipeConfig = {}
) {
  const { threshold = 50, velocityThreshold = 0.3 } = config;
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!startRef.current) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const dt = Date.now() - startRef.current.time;
    const velocity = Math.abs(dx) / dt;

    // 수평 이동이 수직보다 크고, 임계값 충족
    if (Math.abs(dx) > Math.abs(dy)) {
      const isSwipe = Math.abs(dx) > threshold || velocity > velocityThreshold;
      if (isSwipe) {
        if (dx > 0) onSwipeRight();
        else onSwipeLeft();
      }
    }

    startRef.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold, velocityThreshold]);

  return { handlePointerDown, handlePointerUp };
}

// 사용 예시: 튜토리얼 슬라이드
function TutorialSlides({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const { handlePointerDown, handlePointerUp } = useSwipe(goNext, goPrev);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative overflow-hidden touch-pan-y select-none"
    >
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0">
            <SlideContent slide={slide} />
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-200",
              i === currentIndex
                ? "bg-accent w-8"
                : "bg-line-secondary"
            )}
            aria-label={`슬라이드 ${i + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5.4 터치 스크롤 제어

```tsx
// 특정 영역에서 브라우저 기본 스크롤 방지 (예: 스와이프 가능한 슬라이드 영역)
<div className="touch-none">       {/* 모든 터치 동작 차단 */}
<div className="touch-pan-y">      {/* 수직 스크롤만 허용 (수평 스와이프 감지용) */}
<div className="touch-pan-x">      {/* 수평 스크롤만 허용 */}
<div className="touch-manipulation"> {/* 더블탭 줌 비활성화, 탭 딜레이 제거 */}
```

> **`touch-manipulation` 필수:** 터치스크린 앱의 최상위 컨테이너에 `touch-manipulation`을 적용하여 300ms 탭 딜레이를 제거하세요. 브라우저의 더블탭 줌 동작도 비활성화됩니다.

### 5.5 Pointer Events API 기본 패턴

```tsx
// 마우스 + 터치 통합 처리 (Pointer Events)
<div
  onPointerDown={handleStart}
  onPointerMove={handleMove}
  onPointerUp={handleEnd}
  onPointerCancel={handleEnd}  // 터치 취소 대응
  style={{ touchAction: "none" }}  // 제스처 직접 제어 시
>
  {/* 인터랙티브 콘텐츠 */}
</div>
```

> **Pointer Events vs Touch Events:** Pointer Events API는 마우스, 터치, 펜 입력을 통합 처리합니다. `onTouchStart`/`onMouseDown` 분기 없이 `onPointerDown` 하나로 처리하세요.

---

## 6. Framer Motion (선택사항)

CSS 애니메이션으로 구현이 어려운 아래 경우에 한해 Framer Motion 도입을 검토합니다.

### 6.1 도입 기준

| CSS로 충분한 경우 | Framer Motion이 유리한 경우 |
|------|------|
| 단순 상태 전환 (hover, active, toggle) | 레이아웃 애니메이션 (요소 재배치 시 자동 보간) |
| 진입 애니메이션 (fade-in, slide-in) | 복잡한 exit 애니메이션 (AnimatePresence) |
| 스피너, 펄스, 깜빡임 | 드래그 기반 인터랙션 (드래그 바운드, 스냅) |
| 단순 스크롤 연동 | 제스처 기반 물리 시뮬레이션 (스프링, 관성) |

### 6.2 사용 예시 (도입 시)

```tsx
import { motion, AnimatePresence } from "framer-motion";

// 문제 전환 with AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={questionId}
    initial={{ opacity: 0, x: direction === "next" ? 50 : -50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: direction === "next" ? -50 : 50 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    <QuestionContent question={currentQuestion} />
  </motion.div>
</AnimatePresence>

// OMR 버블 스프링 애니메이션
<motion.button
  whileTap={{ scale: 0.9 }}
  animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
>
  {label}
</motion.button>
```

> **번들 사이즈 주의:** Framer Motion은 ~30KB (gzipped)입니다. 도입 전 CSS 대안을 먼저 검토하고, 불가피한 경우에만 추가하세요. `motion` 컴포넌트의 `lazy` import를 고려하세요.

---

## 7. 성능 최적화

### 7.1 GPU 가속 (Compositor-only Properties)

브라우저의 합성 레이어에서 처리되는 속성만 애니메이션하여 메인 스레드 부하를 최소화합니다.

```tsx
// Good — GPU 합성 속성 (Layout/Paint 재계산 없음)
<div className="transition-transform duration-300 translate-x-10" />  // transform
<div className="transition-opacity duration-200 opacity-50" />        // opacity

// Bad — Layout 재계산 유발 (절대 애니메이션하지 않을 것)
<div className="transition-all left-10 top-10" />  // position 속성
<div className="transition-all w-64 h-64" />        // width/height
<div className="transition-all p-8 m-4" />           // padding/margin
```

| 속성 | 레이어 | 성능 |
|------|--------|------|
| `transform` | Compositor | 최고 (GPU) |
| `opacity` | Compositor | 최고 (GPU) |
| `filter` | Compositor | 좋음 (GPU) |
| `background-color` | Paint | 보통 |
| `box-shadow` | Paint | 보통 |
| `width`, `height` | Layout | 나쁨 (리플로우) |
| `left`, `top`, `margin`, `padding` | Layout | 나쁨 (리플로우) |

### 7.2 will-change 사용 규칙

```tsx
// Good — 예측 가능한 애니메이션에 will-change 적용
<div className="will-change-transform hover:scale-105 transition-transform" />

// Good — 반복 애니메이션 요소
<div className="will-change-[opacity,transform] animate-fade-in-up" />

// Bad — 과다 사용 (메모리 낭비)
<div className="will-change-auto" />  // 모든 요소에 적용하지 않기
```

> **규칙:** `will-change`는 실제 애니메이션이 발생하는 요소에만 적용합니다. 페이지 전체에 뿌리지 마세요. 애니메이션 완료 후 제거가 이상적이지만, Tailwind 클래스 기반에서는 정적으로 적용되므로 대상을 최소화하는 것이 핵심입니다.

### 7.3 애니메이션 개수 제한

```tsx
// Bad — 한 화면에서 동시에 너무 많은 애니메이션
<div className="animate-fade-in-up">
  {allItems.map((item, i) => (
    <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
      {/* 100개 아이템 모두 stagger... */}
    </div>
  ))}
</div>

// Good — 뷰포트 내 항목만 애니메이션, 최대 개수 제한
{visibleItems.slice(0, 20).map((item, i) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${i * 80}ms` }}
  >
    {/* 최대 20개까지만 stagger */}
  </div>
))}
```

### 7.4 Reduce Motion (접근성)

```tsx
// 접근성 — prefers-reduced-motion 대응
<div className="transition-all duration-300
                motion-reduce:transition-none
                motion-reduce:animate-none">
  컨텐츠
</div>

// 커스텀 애니메이션에도 적용
<div className="animate-fade-in-up motion-reduce:animate-none">
  결과 카드
</div>
```

> **현재 상태:** `motion-reduce` 대응은 접근성 모범 사례입니다. 주요 애니메이션 컴포넌트에 점진적으로 적용하세요.

---

## 8. Anti-Patterns

### 8.1 애니메이션 Anti-Patterns

| Anti-Pattern | 이유 | 대안 |
|--------------|------|------|
| `transition-all`로 width/height 애니메이션 | Layout 재계산 유발, 60fps 불가 | `transform: scale()` 사용 |
| `left`/`top` position 애니메이션 | 리플로우 유발 | `transform: translate()` 사용 |
| `will-change` 전역 적용 | GPU 메모리 과다 사용 | 애니메이션 대상에만 적용 |
| 500ms 초과 duration | 사용자 대기감 유발 | 300ms 이하 권장 (프로그레스 바 예외) |
| `setInterval` 기반 애니메이션 | 프레임 누락, 배터리 소모 | CSS Animation 또는 `requestAnimationFrame` |
| 조건부 렌더링으로 퇴장 처리 | 퇴장 애니메이션 불가 | `opacity`+`visibility` 또는 `AnimatePresence` |
| `hover:` 의존 터치 피드백 | 터치스크린에서 hover 불안정 | `active:` 상태 사용 |

### 8.2 제스처 Anti-Patterns

| Anti-Pattern | 이유 | 대안 |
|--------------|------|------|
| `onTouchStart` + `onMouseDown` 분리 | 중복 이벤트, 코드 복잡 | Pointer Events API 사용 |
| 스와이프 임계값 없음 | 의도하지 않은 제스처 발동 | 최소 50px 이동 거리 설정 |
| 터치 영역 44px 미만 | 터치 실패, 사용자 불만 | 최소 44x44px 보장 |
| `touch-action: none` 전역 적용 | 스크롤 불가, 접근성 파괴 | 제스처 영역에만 적용 |
| `preventDefault()` 남용 | 브라우저 기본 동작 파괴 | 필요한 이벤트에만 제한적으로 |
| passive 미설정 scroll listener | 스크롤 성능 저하 | `{ passive: true }` 기본 사용 |

---

## 9. Quick Reference

### 9.1 Tailwind Transition 클래스

| Class | 설명 |
|-------|------|
| `transition` | 기본 (colors, opacity 등) |
| `transition-all` | 모든 속성 |
| `transition-colors` | 색상만 |
| `transition-opacity` | 투명도만 |
| `transition-transform` | transform만 |
| `transition-shadow` | 그림자만 |
| `duration-{n}` | 시간 (75, 100, 150, 200, 300, 500) |
| `ease-in` / `ease-out` / `ease-in-out` | 이징 |
| `delay-{n}` | 딜레이 |

### 9.2 빌트인 애니메이션

| Class | 설명 |
|-------|------|
| `animate-spin` | 360도 회전 (로딩 스피너) |
| `animate-pulse` | 투명도 펄스 (스켈레톤 로딩) |
| `animate-bounce` | 수직 바운스 |
| `animate-ping` | 확장 + 페이드 (알림 배지) |
| `animate-in` / `animate-out` | 진입/퇴장 (fade, zoom, slide 조합) |

### 9.3 터치 제어 클래스

| Class | 설명 |
|-------|------|
| `touch-manipulation` | 더블탭 줌 비활성화, 탭 딜레이 제거 |
| `touch-pan-y` | 수직 스크롤만 허용 |
| `touch-pan-x` | 수평 스크롤만 허용 |
| `touch-none` | 모든 터치 동작 차단 |
| `select-none` | 텍스트 선택 방지 |

### 9.4 코드 스니펫 Quick Copy

```tsx
// 1. OMR 버블 — 탭 피드백 + 선택 상태
<button className={cn(
  "w-14 h-14 rounded-full border-2 transition-all duration-100 active:scale-95",
  isSelected ? "border-accent bg-accent text-white scale-105" : "border-line bg-surface"
)}>

// 2. 다음/이전 문제 버튼 — 터치 피드백
<button className="bg-accent text-white rounded-xl px-8 py-4
                   transition-all duration-100 active:scale-[0.97]">

// 3. 타이머 경고 — 색상 전환 + 깜빡임
<span className={cn(
  "tabular-nums transition-colors duration-300",
  remainingMinutes <= 1 && "text-red-500 animate-timer-warning"
)}>

// 4. 페이지 전환 — fade-in-up
<div className="animate-fade-in-up">

// 5. 채점 결과 — stagger 진입
<div className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>

// 6. 드롭다운 표시/숨김
<div className={cn(
  "transition-all duration-200 ease-out",
  isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
)}>

// 7. 로딩 스피너
<Loader2 className="animate-spin h-6 w-6 text-accent" />

// 8. 스와이프 영역 — 터치 제어
<div className="touch-pan-y select-none overflow-hidden">

// 9. 최상위 컨테이너 — 탭 딜레이 제거
<div className="touch-manipulation">
```
