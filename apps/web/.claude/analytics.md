# Analytics Guidelines

모의고사 웹앱의 분석/추적 가이드라인입니다.

> **현재 상태:** 이 프로젝트는 18-27인치 터치스크린 키오스크용 모의고사 앱으로, **별도의 분석 서비스를 연동하지 않습니다.** 분석/추적은 핵심 요구사항이 아니며, 향후 필요 시 아래 가이드라인을 참고하여 도입하세요.

---

## 1. 현황

- 외부 분석 SDK 미설치 (Amplitude, GA, Mixpanel 등)
- 키오스크 환경 특성상 개별 사용자 식별이 불필요
- 시험 응시 데이터는 백엔드 API를 통해 자체 관리

---

## 2. 도입 시 권장 방안

향후 분석이 필요해질 경우, 키오스크 특성을 고려한 접근이 필요하다.

### 2.1 도구 선택 기준

| 기준 | 설명 |
|------|------|
| **자체 수집 우선** | 키오스크 앱은 네트워크가 제한될 수 있으므로 백엔드 API로 직접 수집하는 방식 권장 |
| **경량 SDK** | 외부 도구 사용 시 번들 사이즈 영향이 적은 경량 솔루션 선택 |
| **오프라인 버퍼링** | 네트워크 불안정 시 이벤트를 로컬에 버퍼링 후 일괄 전송 |

### 2.2 키오스크 환경에서 의미 있는 데이터

| 데이터 | 예시 |
|--------|------|
| 시험 완료율 | 시작 대비 제출 비율 |
| 문항별 소요 시간 | 각 문제에 머문 시간 |
| 오답 패턴 | 자주 틀리는 문항/유형 |
| 터치 UX | 미응답 문항 수, 답안 변경 횟수 |

---

## 3. 이벤트 추적 패턴 (React + Vite)

도입 시 아래 패턴을 기반으로 구현한다.

### 3.1 Analytics 서비스 레이어

```typescript
// lib/analytics/tracker.ts
type EventProperties = Record<string, string | number | boolean>;

const isDev = import.meta.env.DEV;

const eventQueue: Array<{ name: string; properties?: EventProperties; timestamp: number }> = [];

export const trackEvent = (name: string, properties?: EventProperties) => {
  if (isDev) {
    console.debug(`[Analytics] ${name}`, properties);
    return;
  }

  eventQueue.push({ name, properties, timestamp: Date.now() });
};

export const flushEvents = async () => {
  if (eventQueue.length === 0) return;

  const events = eventQueue.splice(0);
  // 백엔드 API로 일괄 전송
  // await api.post('/analytics/events', { events });
};
```

### 3.2 커스텀 훅

```typescript
// lib/hooks/useTrack.ts
import { useCallback } from 'react';
import { trackEvent } from '@/lib/analytics/tracker';

export const useTrack = () => {
  const track = useCallback((name: string, properties?: Record<string, string | number | boolean>) => {
    trackEvent(name, properties);
  }, []);

  return { track };
};
```

### 3.3 사용 예시 (모의고사 도메인)

```tsx
const ExamPage = () => {
  const { track } = useTrack();

  const handleAnswer = (questionId: string, answerId: string) => {
    track('answer_select', { question_id: questionId, answer_id: answerId });
  };

  const handleSubmit = () => {
    track('exam_submit', { total_time_sec: elapsedTime });
  };
};
```

### 3.4 페이지 전환 추적 (React Router)

```typescript
// React Router 환경에서의 페이지뷰 추적
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics/tracker';

export const usePageView = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);
};
```

---

## 4. 이벤트 네이밍 규칙

| 규칙 | 예시 |
|------|------|
| `snake_case` 사용 | `exam_start`, `answer_select` |
| `도메인_동작` 형태 | `exam_submit`, `question_skip` |
| PII 수집 금지 | 개인 식별 정보 절대 포함하지 않음 |

---

## Quick Reference

```
현재: 분석 서비스 미사용
환경: React + Vite, 키오스크 (터치스크린)
환경변수: import.meta.env.DEV (Vite 방식)
권장 수집: 백엔드 API 직접 전송
이벤트 네이밍: snake_case
PII: 수집 금지
```
