# Modal & Dialog Guidelines

모의고사 웹앱의 모달/다이얼로그 패턴 가이드라인입니다. (React + Vite + Tailwind CSS v4)
대상 디바이스: 18-27인치 터치스크린 키오스크 환경

---

## Related Guides

- `.claude/keyboard-handling.md`: 포커스 트랩, ESC 처리, 접근성 속성을 맞출 때 참고
- `.claude/animation-gesture.md`: 모달 진입/퇴장 애니메이션, 터치 제스처 인터랙션을 함께 다룰 때 참고
- `.claude/ui-component.md`: 공용 버튼, 입력, 다이얼로그 트리거 컴포넌트 조합 시 참고

---

## 1. 모달 유형

### 1.1 유형별 사용 기준

| 유형 | 사용 케이스 | 특징 |
|------|-------------|------|
| **ConfirmDialog** | 시험 시작 확인, 답안 제출 확인 | 중앙 팝업, 확인/취소 2버튼, 포커스 트랩 |
| **AlertDialog** | 시간 초과 경고, 미응답 문항 알림 | 중앙 팝업, 확인 1버튼, 배경 클릭 닫기 불가 |
| **InfoDialog** | 시험 안내, 유의사항 표시 | 중앙 팝업, 스크롤 가능한 본문 |
| **Toast** | 저장 완료, 답안 기록 피드백 | 자동 사라짐, 비차단, 화면 하단 표시 |

### 1.2 Quick Reference

| 상황 | 추천 유형 |
|------|-----------|
| "시험을 시작하시겠습니까?" | ConfirmDialog |
| "답안을 제출하시겠습니까?" | ConfirmDialog |
| "시험 시간이 종료되었습니다" | AlertDialog (배경 클릭 닫기 불가) |
| "3문항이 미응답입니다. 제출하시겠습니까?" | ConfirmDialog (경고 variant) |
| "남은 시간 5분" | Toast 또는 인라인 배너 |
| "답안이 저장되었습니다" | Toast |
| 시험 유의사항 안내 | InfoDialog |

---

## 2. 구현 패턴

### 2.1 기술 선택: 커스텀 구현 vs Headless 라이브러리

외부 의존성 없이 커스텀 모달을 구현하되, 복잡한 접근성 요구사항이 있을 경우 headless 라이브러리를 선택적으로 도입한다.

| 접근 방식 | 적합한 경우 | 비고 |
|-----------|-------------|------|
| **커스텀 구현 (React Portal + ARIA)** | 단순 확인/알림 모달, 프로젝트 모달 유형이 제한적일 때 | 본 프로젝트 기본 방식 |
| **@headlessui/react** | 접근성 자동 처리가 필요하고, Tailwind CSS와 직접 통합하고 싶을 때 | Tailwind Labs 공식 라이브러리 |
| **react-aria (Adobe)** | 복잡한 접근성 시나리오, 국제화 지원이 필요할 때 | hooks 기반, 스타일 무관 |

본 프로젝트에서는 **커스텀 구현**을 기본으로 한다. 모달 유형이 4가지 이내로 제한적이고, React Portal + 수동 ARIA 속성으로 충분히 커버 가능하다.

### 2.2 React Portal 기반 모달 컨테이너

모든 모달은 React Portal을 통해 DOM 트리 최상위(`#modal-root`)에 렌더링한다. 이는 z-index 충돌을 방지하고, 부모 컴포넌트의 `overflow: hidden` 영향을 받지 않기 위함이다.

```html
<!-- index.html -->
<body>
  <div id="root"></div>
  <div id="modal-root"></div>
</body>
```

```tsx
// components/modal/ModalPortal.tsx
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface ModalPortalProps {
  children: ReactNode;
}

export function ModalPortal({ children }: ModalPortalProps) {
  const container = document.getElementById("modal-root");
  if (!container) return null;
  return createPortal(children, container);
}
```

### 2.3 Base Modal 컴포넌트

모든 모달의 공통 동작(오버레이, 포커스 트랩, ESC 닫기, 접근성 속성)을 캡슐화한 기반 컴포넌트.

```tsx
// components/modal/BaseModal.tsx
import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { ModalPortal } from "./ModalPortal";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** true이면 오버레이 클릭으로 닫기 불가 (AlertDialog용) */
  preventOverlayClose?: boolean;
  /** 접근성: 모달 제목 (aria-labelledby 연결용) */
  ariaLabelledBy: string;
  /** 접근성: 모달 설명 (aria-describedby 연결용) */
  ariaDescribedBy?: string;
  children: ReactNode;
}

export function BaseModal({
  isOpen,
  onClose,
  preventOverlayClose = false,
  ariaLabelledBy,
  ariaDescribedBy,
  children,
}: BaseModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // 열릴 때 이전 포커스 저장, 닫힐 때 복원
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // 모달 내부 첫 번째 포커스 가능 요소로 이동
      requestAnimationFrame(() => {
        const focusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // ESC 키 처리
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 포커스 트랩
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    },
    []
  );

  if (!isOpen) return null;

  return (
    <ModalPortal>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0 duration-150"
        onClick={preventOverlayClose ? undefined : onClose}
        aria-hidden="true"
      />
      {/* Dialog Container */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onKeyDown={handleKeyDown}
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        {children}
      </div>
    </ModalPortal>
  );
}
```

### 2.4 ConfirmDialog 컴포넌트

시험 시작 확인, 답안 제출 확인 등 사용자 결정이 필요한 상황에 사용한다.

```tsx
// components/modal/ConfirmDialog.tsx
import { BaseModal } from "./BaseModal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** "danger": 빨간 강조, "warning": 노란 강조, "info": 기본 */
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  variant = "info",
}: ConfirmDialogProps) {
  const titleId = "confirm-dialog-title";
  const descId = "confirm-dialog-desc";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[min(480px,90vw)] border border-gray-200">
        <h2
          id={titleId}
          className="text-xl font-bold text-gray-900"
        >
          {title}
        </h2>
        <p
          id={descId}
          className="mt-3 text-base text-gray-600 leading-relaxed"
        >
          {message}
        </p>
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[56px] rounded-xl border border-gray-300 bg-white text-gray-700 text-lg font-medium
                       hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98]
                       transition-all duration-150
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 min-h-[56px] rounded-xl text-white text-lg font-medium
                       active:scale-[0.98] transition-all duration-150
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                       ${variant === "danger"
                         ? "bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500"
                         : variant === "warning"
                           ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 focus-visible:ring-amber-500"
                           : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500"
                       }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
```

### 2.5 AlertDialog 컴포넌트

시간 초과 등 반드시 사용자가 인지해야 하는 알림에 사용한다. 오버레이 클릭으로 닫을 수 없다.

```tsx
// components/modal/AlertDialog.tsx
import { BaseModal } from "./BaseModal";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  /** "error": 빨간 아이콘, "warning": 노란 아이콘, "info": 파란 아이콘 */
  severity?: "error" | "warning" | "info";
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "확인",
  severity = "info",
}: AlertDialogProps) {
  const titleId = "alert-dialog-title";
  const descId = "alert-dialog-desc";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      preventOverlayClose
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
    >
      <div
        role="alertdialog"
        className="bg-white rounded-2xl shadow-2xl p-8 w-[min(480px,90vw)] border border-gray-200"
      >
        <h2
          id={titleId}
          className="text-xl font-bold text-gray-900"
        >
          {title}
        </h2>
        <p
          id={descId}
          className="mt-3 text-base text-gray-600 leading-relaxed"
        >
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`w-full min-h-[56px] mt-8 rounded-xl text-white text-lg font-medium
                     active:scale-[0.98] transition-all duration-150
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                     ${severity === "error"
                       ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                       : severity === "warning"
                         ? "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500"
                         : "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500"
                     }`}
        >
          {confirmText}
        </button>
      </div>
    </BaseModal>
  );
}
```

### 2.6 사용 예시

```tsx
// 시험 시작 확인
const [showStartConfirm, setShowStartConfirm] = useState(false);

<ConfirmDialog
  isOpen={showStartConfirm}
  onClose={() => setShowStartConfirm(false)}
  onConfirm={handleStartExam}
  title="시험을 시작하시겠습니까?"
  message="시작 후에는 제한 시간이 적용됩니다. 준비가 되셨다면 확인을 눌러주세요."
  confirmText="시험 시작"
  cancelText="돌아가기"
/>

// 미응답 문항 제출 확인
<ConfirmDialog
  isOpen={showSubmitWarning}
  onClose={() => setShowSubmitWarning(false)}
  onConfirm={handleSubmit}
  title="미응답 문항이 있습니다"
  message={`${unansweredCount}문항이 미응답입니다. 그래도 제출하시겠습니까?`}
  confirmText="제출"
  cancelText="돌아가서 풀기"
  variant="warning"
/>

// 시간 초과 알림
<AlertDialog
  isOpen={isTimeExpired}
  onClose={handleForceSubmit}
  title="시험 시간이 종료되었습니다"
  message="답안이 자동으로 제출됩니다."
  confirmText="결과 확인"
  severity="error"
/>
```

### 2.7 Headless 라이브러리 도입 시 전환 가이드 (선택적)

프로젝트가 성장하여 모달 유형이 다양해지거나, 접근성 감사(audit)가 필요한 경우 `@headlessui/react`로 전환할 수 있다.

```bash
npm install @headlessui/react
```

```tsx
// Headless UI 전환 시 ConfirmDialog 예시
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Headless UI가 포커스 트랩, ESC 닫기, aria 속성을 자동 처리 */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-2xl shadow-2xl p-8 w-[min(480px,90vw)]">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <Description className="mt-3 text-gray-600">{message}</Description>
          {/* 버튼 영역 */}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
```

전환 시 `BaseModal`의 수동 포커스 트랩, ESC 핸들러, aria 속성 관리 코드를 제거할 수 있다.

---

## 3. 접근성 (a11y)

### 3.1 필수 ARIA 속성

모든 모달은 다음 속성을 반드시 포함해야 한다.

| 속성 | 값 | 설명 |
|------|-----|------|
| `role` | `"dialog"` 또는 `"alertdialog"` | 일반 모달은 `dialog`, 필수 응답 모달은 `alertdialog` |
| `aria-modal` | `"true"` | 배경 콘텐츠가 비활성임을 스크린 리더에 알림 |
| `aria-labelledby` | `{titleElementId}` | 모달 제목 요소의 id 참조 |
| `aria-describedby` | `{descriptionElementId}` | 모달 설명 요소의 id 참조 (선택이지만 권장) |

```tsx
// 올바른 예시
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">시험 시작 확인</h2>
  <p id="modal-desc">시작 후에는 시간 제한이 적용됩니다.</p>
</div>

// AlertDialog (시간 초과 등 필수 응답)
<div
  role="alertdialog"
  aria-modal="true"
  aria-labelledby="alert-title"
  aria-describedby="alert-desc"
>
  <h2 id="alert-title">시험 시간 종료</h2>
  <p id="alert-desc">답안이 자동 제출됩니다.</p>
</div>
```

### 3.2 포커스 관리

| 규칙 | 설명 |
|------|------|
| **열릴 때** | 모달 내부 첫 번째 포커스 가능 요소로 포커스 이동 |
| **열려 있는 동안** | Tab 키가 모달 내부 요소 사이에서만 순환 (포커스 트랩) |
| **닫힐 때** | 모달을 트리거한 원래 요소로 포커스 복원 |

포커스 트랩은 `BaseModal` 컴포넌트에 내장되어 있다. 별도로 `focus-trap-react` 같은 라이브러리를 추가할 필요 없다.

### 3.3 키보드 지원

| 키 | 동작 |
|-----|------|
| `Escape` | 모달 닫기 (AlertDialog는 닫기 불가로 설정 가능) |
| `Tab` | 모달 내부에서 포커스 순방향 이동 |
| `Shift + Tab` | 모달 내부에서 포커스 역방향 이동 |
| `Enter` / `Space` | 포커스된 버튼 실행 |

### 3.4 스크린 리더 고려사항

- 모달이 열리면 스크린 리더는 `aria-labelledby`로 연결된 제목을 먼저 읽는다.
- `role="alertdialog"`는 스크린 리더가 즉시 내용을 읽어주므로, 시간 초과 같은 긴급 알림에 적합하다.
- 오버레이에 `aria-hidden="true"`를 적용하여 스크린 리더가 배경을 무시하도록 한다.
- 모달이 열려 있는 동안 배경 콘텐츠에 `inert` 속성을 추가하는 것을 권장한다.

```tsx
// 배경 콘텐츠 비활성화 (inert)
useEffect(() => {
  const root = document.getElementById("root");
  if (!root) return;
  if (isOpen) {
    root.setAttribute("inert", "");
  } else {
    root.removeAttribute("inert");
  }
  return () => root.removeAttribute("inert");
}, [isOpen]);
```

---

## 4. 터치스크린 UX 고려사항

18-27인치 터치스크린 환경에서의 모달 사용성을 보장하기 위한 규칙.

### 4.1 터치 타겟 크기

모든 인터랙티브 요소는 최소 **48x48px** 터치 타겟을 보장해야 한다 (WCAG 2.5.8 기준은 44x44px이나, 키오스크 환경에서는 48px 이상을 권장).

```tsx
// 올바른 예시: 충분한 터치 타겟
<button className="min-h-[56px] min-w-[120px] px-6 py-3 text-lg">
  확인
</button>

// 잘못된 예시: 터치하기 어려운 작은 버튼
<button className="px-2 py-1 text-sm">
  확인
</button>
```

### 4.2 버튼 배치

- 확인/취소 버튼은 **가로 배치(flex-row)**를 기본으로 한다.
- 터치 오조작 방지를 위해 버튼 사이에 최소 **16px(gap-4)** 간격을 둔다.
- 파괴적 액션(제출, 삭제)은 우측에 배치하여 습관적 터치를 방지한다.

```tsx
<div className="flex gap-4 mt-8">
  <button className="flex-1 min-h-[56px] ...">취소</button>   {/* 좌측: 안전한 액션 */}
  <button className="flex-1 min-h-[56px] ...">제출</button>   {/* 우측: 주요/파괴적 액션 */}
</div>
```

### 4.3 터치 피드백

터치스크린에서는 hover 상태가 없으므로, **active(press) 상태**의 시각적 피드백이 중요하다.

```tsx
// 터치 피드백 패턴
<button
  className="
    active:scale-[0.98]          /* 살짝 축소되는 press 효과 */
    active:bg-blue-800           /* 배경색 변화 */
    transition-all duration-150  /* 부드러운 전환 */
    touch-action-manipulation    /* 터치 지연 제거 */
  "
>
  확인
</button>
```

### 4.4 모달 크기와 위치

- 모달 너비는 `min(480px, 90vw)`를 기본으로 한다. 대형 터치스크린에서도 너무 넓어지지 않으면서, 내용이 충분히 읽힐 수 있는 크기이다.
- 모달은 화면 정중앙에 위치시킨다 (`fixed left-1/2 top-1/2 -translate-x/y-1/2`).
- 내용이 긴 모달(시험 안내 등)은 `max-h-[80vh] overflow-y-auto`로 스크롤을 허용한다.

### 4.5 실수 방지 패턴

터치스크린 환경에서 의도하지 않은 조작을 방지하기 위한 패턴.

- **답안 제출 확인**: 반드시 2단계 확인 (제출 버튼 클릭 → ConfirmDialog)
- **시험 종료**: AlertDialog 사용, 오버레이 클릭으로 닫기 불가
- **더블탭 방지**: 제출 버튼은 한 번 클릭 후 즉시 `disabled` 처리

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    await submitAnswers();
  } finally {
    setIsSubmitting(false);
  }
};

<button
  disabled={isSubmitting}
  onClick={handleSubmit}
  className="disabled:opacity-50 disabled:pointer-events-none"
>
  {isSubmitting ? "제출 중..." : "제출"}
</button>
```

---

## 5. Anti-Patterns

### 금지 패턴

| Anti-Pattern | 이유 | 올바른 대안 |
|-------------|------|------------|
| `window.confirm()` / `window.alert()` 사용 | 스타일링 불가, 접근성 제어 불가, 터치 UX 부적합 | `ConfirmDialog` / `AlertDialog` 컴포넌트 사용 |
| `aria-modal` 없이 모달 렌더링 | 스크린 리더가 배경 콘텐츠를 읽을 수 있음 | `aria-modal="true"` 필수 적용 |
| 포커스 트랩 없는 모달 | Tab 키로 모달 밖으로 포커스 이탈 가능 | `BaseModal`의 포커스 트랩 활용 |
| `z-index` 직접 하드코딩 | 중첩 모달 시 z-index 충돌 | 모달 레이어 변수 또는 단일 z-index 계층 사용 |
| Portal 없이 모달 렌더링 | 부모의 `overflow: hidden`, `transform` 등에 영향받음 | `ModalPortal` 통해 `#modal-root`에 렌더링 |
| 오버레이 없이 모달 열기 | 사용자가 배경과 모달을 구분할 수 없음 | 반투명 오버레이 필수 |
| 닫기 후 포커스 미복원 | 키보드 사용자가 위치를 잃음 | `previousFocusRef`로 트리거 요소에 포커스 복원 |
| 터치 타겟 44px 미만 | 터치스크린에서 조작이 어려움 | 모든 버튼 `min-h-[56px]` 이상 |

### 주의 패턴

```tsx
// BAD: useEffect에서 모달 상태를 동기화하면 무한 렌더링 위험
useEffect(() => {
  if (someCondition) setIsOpen(true);
}, [someCondition]);

// GOOD: 이벤트 핸들러에서 직접 상태 변경
const handleAction = () => {
  if (someCondition) setIsOpen(true);
};

// BAD: 모달 내부에서 라우터 네비게이션 후 모달을 닫지 않음
const handleConfirm = () => {
  navigate("/result");
  // 모달이 열린 채로 페이지 전환됨
};

// GOOD: 모달을 먼저 닫고 네비게이션
const handleConfirm = () => {
  onClose();
  navigate("/result");
};
```

---

## 6. Quick Reference

### 파일 구조

```
components/
  modal/
    ModalPortal.tsx      # React Portal 래퍼
    BaseModal.tsx         # 공통 모달 동작 (오버레이, 포커스 트랩, ESC, ARIA)
    ConfirmDialog.tsx     # 확인/취소 다이얼로그
    AlertDialog.tsx       # 알림 다이얼로그 (닫기 제한)
```

### 모달 prop 인터페이스 공통 규칙

| prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `isOpen` | `boolean` | O | 모달 열림 상태 |
| `onClose` | `() => void` | O | 모달 닫기 콜백 |
| `title` | `string` | O | 모달 제목 (aria-labelledby 연결) |
| `message` | `string` | O | 모달 본문 (aria-describedby 연결) |

### z-index 계층

| 계층 | z-index | 용도 |
|------|---------|------|
| 기본 콘텐츠 | `auto` | 페이지 본문 |
| 헤더/타이머 | `z-10` | 고정 헤더, 시험 타이머 |
| 오버레이 | `z-50` | 모달 배경 딤 처리 |
| 모달 콘텐츠 | `z-50` | 모달 다이얼로그 본체 |

---

## 7. PR Checklist

- [ ] 모든 모달이 `ModalPortal`(React Portal)을 통해 `#modal-root`에 렌더링되는가?
- [ ] `role="dialog"` 또는 `role="alertdialog"`가 적용되었는가?
- [ ] `aria-modal="true"`가 적용되었는가?
- [ ] `aria-labelledby`가 제목 요소와 연결되었는가?
- [ ] `aria-describedby`가 설명 요소와 연결되었는가?
- [ ] ESC 키로 모달이 닫히는가? (AlertDialog 제외 가능)
- [ ] 포커스 트랩이 정상 작동하는가? (Tab/Shift+Tab이 모달 내부에서만 순환)
- [ ] 모달이 닫힐 때 트리거 요소로 포커스가 복원되는가?
- [ ] 모달 버튼의 터치 타겟이 최소 48x48px 이상인가?
- [ ] `active:` 상태에서 터치 피드백이 제공되는가?
- [ ] 파괴적 액션(제출 등)에 더블탭 방지가 적용되었는가?
- [ ] 오버레이 클릭 동작이 모달 유형에 맞게 설정되었는가?
- [ ] 스크린 리더로 모달 제목과 내용이 올바르게 읽히는가?
