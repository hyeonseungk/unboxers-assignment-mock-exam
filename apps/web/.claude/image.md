# 이미지 가이드라인 (Vite + React)

## 현황

이 프로젝트는 **모의고사 웹앱**으로, 수학 문제는 지면으로 풀고 답만 마킹하는 방식이다. 따라서 이미지 사용은 **최소한**이며, 로고와 아이콘 정도만 존재한다. 이미지 최적화가 핵심 관심사가 아니므로 이 가이드라인은 간결하게 유지한다.

---

## 1. Vite 이미지 처리

### Static Import (권장)

Vite는 이미지를 ES 모듈로 import하면 빌드 시 해시된 URL을 반환한다. 타입 안전성과 캐시 무효화를 자동으로 얻는다.

```tsx
import logo from "@/assets/logo.png";

const Header = () => (
  <img src={logo} alt="모의고사 로고" className="h-8 w-auto" />
);
```

### public 폴더

`public/` 폴더의 파일은 빌드 시 그대로 복사되며, 루트 경로(`/`)로 접근한다. 해시가 붙지 않아 캐시 무효화가 안 되므로, 변경 가능성이 없는 파일(favicon, og-image 등)에만 사용한다.

```tsx
// public/favicon.ico → /favicon.ico
<link rel="icon" href="/favicon.ico" />
```

### 에셋 중앙 관리

이미지가 늘어나면 `lib/asset/image/index.ts`에서 일괄 export한다.

```typescript
// lib/asset/image/index.ts
import logo from "./logo.png";
import logoDark from "./logo-dark.png";

export const IMAGES = {
  logo,
  logoDark,
} as const;
```

```
lib/asset/image/
├── index.ts
├── logo.png
└── logo-dark.png
```

---

## 2. SVG 아이콘

### lucide-react (프로젝트 표준)

이 프로젝트는 **lucide-react**를 아이콘 라이브러리로 사용한다. 새 아이콘이 필요하면 lucide에서 먼저 찾는다.

```tsx
import { Check, X, ChevronDown } from "lucide-react";

<Check className="h-5 w-5 text-fg-primary" />
<X className="h-4 w-4" aria-hidden="true" />
```

### 커스텀 SVG

lucide에 없는 SVG가 필요한 경우, React 컴포넌트로 직접 작성한다.

```tsx
// components/icons/CustomIcon.tsx
interface IconProps {
  className?: string;
}

export const CustomIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    {/* paths */}
  </svg>
);
```

### SVG 파일 import

Vite에서 SVG를 `<img>`로 사용할 수 있다. 색상 제어가 필요 없는 로고 등에 적합하다.

```tsx
import logoSvg from "@/assets/logo.svg";

<img src={logoSvg} alt="로고" className="h-8" />
```

> **참고:** `vite-plugin-svgr`을 추가하면 SVG를 React 컴포넌트로 import할 수 있지만, 현재 프로젝트에서는 커스텀 SVG가 거의 없으므로 도입하지 않는다.

---

## 3. 최적화

이 프로젝트에서 이미지는 핵심이 아니지만, 기본적인 최적화 원칙은 지킨다.

| 원칙 | 방법 |
|------|------|
| 포맷 | WebP 또는 AVIF 우선 사용. PNG는 투명도가 필요할 때만 |
| 크기 | 실제 표시 크기의 2배(Retina 대응) 이하로 준비 |
| alt 텍스트 | 정보성 이미지는 의미 있는 alt 필수, 장식용은 `alt=""` + `aria-hidden` |
| lazy loading | 뷰포트 밖 이미지는 `loading="lazy"` 사용 |

```tsx
// 장식용 이미지
<img src={decorative} alt="" aria-hidden="true" />

// 정보성 이미지
<img src={logo} alt="언박서스 모의고사 로고" loading="lazy" />
```

---

## Quick Reference

| 상황 | 방법 |
|------|------|
| 로고 등 정적 이미지 | `import`로 가져와서 `<img src={...}>` |
| favicon, og-image | `public/` 폴더에 배치 |
| 아이콘 | `lucide-react` 우선, 없으면 SVG 컴포넌트 |
| 이미지 중앙 관리 | `lib/asset/image/index.ts`에서 export |

### 하지 말 것

```tsx
// alt 텍스트 누락
<img src={logo} />

// public 폴더에 자주 변경되는 이미지 배치 (캐시 무효화 불가)
<img src="/frequently-changing.png" />

// 불필요하게 큰 이미지를 원본 크기로 사용
<img src={hugeImage} className="h-8" /> // 2000px 이미지를 32px로 표시
```
