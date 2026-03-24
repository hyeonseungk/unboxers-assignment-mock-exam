# 클라이언트 사이드 로깅 가이드라인

> **프로젝트 컨텍스트:** React + Vite 모의고사 웹앱, 18-27인치 터치스크린 키오스크 환경.
> 주요 로깅 대상은 API 요청/응답, 에러, 사용자 행동(답안 제출 등)이다.

## Related Guides

- `error-handling.md`: 예외를 어디서 잡고 어떤 수준으로 로깅할지 정할 때 참고
- `server-request.md`: API 요청 패턴과 에러 핸들링의 로깅 연계 시 참고
- `security.md`: 민감 정보(토큰, 개인정보) 로깅 금지 기준 확인

---

## 1. 로깅 원칙

| 원칙 | 설명 |
| --- | --- |
| **logger 래퍼 사용** | `console.log`를 직접 호출하지 않는다. `logger` 유틸리티를 통해 환경별 출력을 자동 제어한다 |
| **구조화된 로그** | 메시지 문자열 + context 태그 + data 객체 형태로 일관되게 기록한다 |
| **PascalCase 메시지** | 로그 메시지는 `"AnswerSubmitted"`, `"ApiFetchFailed"` 같은 PascalCase 식별자를 사용한다. 검색과 필터링이 쉬워진다 |
| **민감 정보 금지** | 토큰, 비밀번호, 개인식별정보(PII)는 절대 로그에 포함하지 않는다 |
| **적절한 레벨 선택** | 모든 것을 `error`로 기록하지 않는다. 아래 레벨 정의를 따른다 |
| **최소한의 유의미한 로그** | 디버깅에 실제로 도움이 되는 정보만 기록한다. 반복문 내 대량 로깅을 피한다 |

---

## 2. 로거 유틸리티

### 2.1 구현 (`lib/utils/logger.ts`)

```typescript
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogOptions {
  context?: string;
  data?: unknown;
}

const isDev = import.meta.env.DEV;

function formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
  const timestamp = new Date().toISOString();
  const ctx = options?.context ? ` [${options.context}]` : "";
  return `${timestamp} [${level.toUpperCase()}]${ctx} ${message}`;
}

export const logger = {
  debug(message: string, options?: LogOptions): void {
    if (isDev) {
      console.debug(formatMessage("debug", message, options), options?.data ?? "");
    }
  },

  info(message: string, options?: LogOptions): void {
    if (isDev) {
      console.info(formatMessage("info", message, options), options?.data ?? "");
    }
  },

  warn(message: string, options?: LogOptions): void {
    if (isDev) {
      console.warn(formatMessage("warn", message, options), options?.data ?? "");
    }
  },

  error(message: string, options?: LogOptions): void {
    // 프로덕션에서도 항상 출력
    console.error(formatMessage("error", message, options), options?.data ?? "");
  },
};
```

**포인트:**
- Vite 환경이므로 `process.env.NODE_ENV` 대신 `import.meta.env.DEV`를 사용한다.
- 프로덕션 빌드 시 `import.meta.env.DEV`가 `false`로 치환되어 트리셰이킹 대상이 된다.
- `error`만 프로덕션에서 출력된다. 키오스크 환경에서 콘솔 노이즈를 최소화하기 위함이다.

### 2.2 API 시그니처

```typescript
logger.debug(message: string, options?: LogOptions): void
logger.info(message: string, options?: LogOptions): void
logger.warn(message: string, options?: LogOptions): void
logger.error(message: string, options?: LogOptions): void
```

- `message` -- PascalCase 식별자 (e.g., `"AnswerSubmitted"`, `"ExamLoaded"`)
- `options.context` -- 로그 출처 태그 (e.g., `"API"`, `"Exam"`)
- `options.data` -- 추가 데이터 객체. 에러 객체, 요약 정보 등

### 2.3 import 패턴

```typescript
import { logger } from "@/lib/utils/logger";

logger.info("ExamStarted", { context: "Exam", data: { examId } });
logger.error("SubmitFailed", { context: "Exam", data: error });
```

---

## 3. 환경별 설정

### 3.1 로그 레벨별 출력 여부

| 레벨 | 개발(DEV) | 프로덕션(PROD) | 용도 |
| --- | --- | --- | --- |
| `debug` | console.debug | 무시 | 개발 중 데이터 흐름 확인, state 변경 추적 |
| `info` | console.info | 무시 | 주요 사용자 흐름 (시험 시작, 답안 제출 등) |
| `warn` | console.warn | 무시 | 복구 가능한 문제 (API 재시도, 타임아웃 경고) |
| `error` | console.error | console.error | 크래시, API 실패, 예외 |

### 3.2 키오스크 환경 고려사항

키오스크에서는 DevTools를 열 수 없으므로 프로덕션 에러 로그는 원격으로 수집하는 것이 이상적이다. 외부 서비스 연동 전까지는 `error` 레벨만 콘솔에 남기는 현재 전략을 유지한다.

**향후 외부 로깅 서비스 연동 시 (선택사항):**

```typescript
error(message: string, options?: LogOptions): void {
  console.error(formatMessage("error", message, options), options?.data ?? "");

  // 외부 서비스 연동 예시 (Sentry, LogRocket 등)
  // externalService.captureError(message, options);
},
```

### 3.3 ESLint 설정

```javascript
// eslint.config.mjs
export default defineConfig([
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info", "debug"] }],
    },
  },
]);
```

logger 내부에서 `console.info`, `console.debug`를 사용하므로 모두 허용한다. 일반 코드에서 직접 `console.log`를 사용하면 경고가 발생한다.

### 3.4 레벨 선택 의사결정

```
문제가 발생했는가?
├── Yes
│   ├── 앱이 계속 동작하는가?
│   │   ├── Yes → WARN (복구 가능한 문제)
│   │   └── No  → ERROR (크래시, 실패)
│   └──
└── No
    ├── 사용자 행동 추적인가? → INFO (주요 흐름만)
    └── 개발 중 확인용인가?  → DEBUG
```

---

## 4. 구조화된 로깅 패턴

### 4.1 Context 표준값

모의고사 앱에서 사용하는 주요 context 값을 정의한다.

| Context | 설명 | 예시 |
| --- | --- | --- |
| `API` | API 호출 관련 | 요청/응답, 네트워크 에러 |
| `Exam` | 시험 진행 관련 | 시험 시작, 문제 로딩, 시간 관리 |
| `Answer` | 답안 관련 | 답안 선택, 답안 제출 |
| `Auth` | 인증 관련 | 로그인, 토큰 갱신 |
| `Navigation` | 페이지 이동 관련 | 문제 간 이동, 페이지 전환 |
| `Storage` | 저장소 관련 | localStorage 임시 저장 |
| `[FeatureName]` | 특정 기능 | `Result`, `Timer` 등 |

### 4.2 API 요청/응답 로깅

```typescript
// API 클라이언트에서의 로깅 패턴
import { logger } from "@/lib/utils/logger";

// 요청 실패
logger.error("ApiFetchFailed", {
  context: "API",
  data: { endpoint: "/api/exams/123", status: 500, error },
});

// 네트워크 에러
logger.error("NetworkError", {
  context: "API",
  data: { endpoint: "/api/answers", error: error.message },
});

// 재시도
logger.warn("ApiRetryAttempted", {
  context: "API",
  data: { endpoint: "/api/answers", attempt: 2, maxRetries: 3 },
});
```

### 4.3 사용자 행동 로깅 (답안 제출 등)

```typescript
// 답안 선택
logger.info("AnswerSelected", {
  context: "Answer",
  data: { questionId: 5, selectedOption: 3 },
});

// 답안 제출
logger.info("AnswerSubmitted", {
  context: "Answer",
  data: { examId, questionCount: 40, answeredCount: 38 },
});

// 빈 답안 제출 (허용하되 기록)
logger.info("EmptyAnswerSubmitted", {
  context: "Answer",
  data: { examId, unansweredCount: 2 },
});
```

### 4.4 시험 흐름 로깅

```typescript
// 시험 시작
logger.info("ExamStarted", {
  context: "Exam",
  data: { examId, totalQuestions: 40 },
});

// 시험 완료
logger.info("ExamCompleted", {
  context: "Exam",
  data: { examId, duration: "45m 30s" },
});

// 시험 데이터 로딩 실패
logger.error("ExamLoadFailed", {
  context: "Exam",
  data: { examId, error },
});
```

### 4.5 에러 바운더리 로깅

```typescript
// ErrorBoundary에서의 로깅
logger.error("UnhandledRenderError", {
  context: "ErrorBoundary",
  data: { componentStack: info.componentStack, error: error.message },
});
```

---

## 5. Anti-Patterns

### console.log 직접 사용

```typescript
// BAD -- 환경별 제어 불가, 구조화되지 않음
console.log("시험 시작됨");
console.log("data:", data);

// GOOD
logger.info("ExamStarted", { context: "Exam", data: { examId } });
logger.debug("DataFetched", { context: "API", data: { itemCount: data.length } });
```

### 민감 정보 노출

```typescript
// BAD -- 토큰 값 그대로 노출
logger.debug("TokenReceived", { context: "Auth", data: { token: accessToken } });

// GOOD -- 민감하지 않은 메타 정보만
logger.debug("TokenReceived", { context: "Auth", data: { tokenLength: accessToken.length } });
```

### 대용량 객체 전체 로깅

```typescript
// BAD -- 40문제 전체 객체 덤프
logger.debug("ExamLoaded", { context: "Exam", data: examData });

// GOOD -- 필요한 요약 정보만
logger.debug("ExamLoaded", {
  context: "Exam",
  data: { examId: examData.id, questionCount: examData.questions.length },
});
```

### 모든 것을 error로 기록

```typescript
// BAD
logger.error("ExamStarted");  // 에러가 아님
logger.error("PageLoaded");   // 에러가 아님

// GOOD
logger.info("ExamStarted", { context: "Exam" });
logger.info("PageLoaded", { context: "Navigation" });
logger.error("ExamLoadFailed", { context: "Exam", data: error });  // 실제 에러
```

### 반복문 내 과도한 로깅

```typescript
// BAD -- 40문제면 40번 로깅
questions.forEach((q) => {
  logger.debug("QuestionRendered", { data: { id: q.id } });
});

// GOOD -- 요약 1회
logger.debug("QuestionsRendered", {
  context: "Exam",
  data: { count: questions.length },
});
```

---

## Quick Reference

### PR 체크리스트

- [ ] `console.log` 대신 `logger`를 사용하고 있는가?
- [ ] 적절한 로그 레벨을 선택했는가? (debug / info / warn / error)
- [ ] `context` 값이 표준 네이밍(API, Exam, Answer 등)을 따르는가?
- [ ] 민감 정보(PII, 토큰)가 포함되지 않았는가?
- [ ] error 로그에 error 객체를 data로 전달했는가?
- [ ] 반복문 내 과도한 로깅이 없는가?
- [ ] 대용량 객체를 직접 로깅하지 않고 필요한 필드만 선별했는가?

### 레벨 요약

```
DEBUG  -- 개발 중 데이터 확인            (프로덕션 무시)
INFO   -- 사용자 행동, 주요 흐름          (프로덕션 무시)
WARN   -- 복구 가능한 문제, 주의 필요     (프로덕션 무시)
ERROR  -- 크래시, 실패, 예외             (프로덕션 출력)
```

### Context 요약

```
API          -- 요청/응답, 네트워크 에러
Exam         -- 시험 시작/완료/로딩
Answer       -- 답안 선택/제출
Auth         -- 로그인, 토큰
Navigation   -- 페이지 이동
Storage      -- 로컬 저장소
[Feature]    -- 특정 기능 (Result, Timer 등)
```
