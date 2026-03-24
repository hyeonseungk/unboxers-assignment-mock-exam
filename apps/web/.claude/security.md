# Security Guidelines

React + Vite 모의고사 웹 애플리케이션 보안 가이드라인입니다. 인증 없이 학생 정보(이름, 학번)만 입력받는 키오스크/터치스크린 환경을 전제로 작성되었습니다.

---

## 1. 보안 원칙

| 원칙                   | 이 프로젝트에서의 의미                                          |
| ---------------------- | --------------------------------------------------------------- |
| **Never Trust Client** | 학생 입력값(이름, 학번)을 포함한 모든 입력은 반드시 검증한다    |
| **Secure by Default**  | React JSX 자동 이스케이프에 의존하되, 이를 우회하는 코드를 금지 |
| **Least Exposure**     | 환경 변수, API 키 등 민감 정보의 클라이언트 노출을 최소화한다   |
| **Defense in Depth**   | 클라이언트 검증 + 서버(Fastify) 검증을 병행한다                 |

---

## 2. XSS (Cross-Site Scripting) 방지

### 2.1 React의 기본 보호 활용

```tsx
// React는 JSX 내 값을 자동 이스케이프한다. 이것만으로 대부분의 XSS를 방지할 수 있다.
const StudentName = ({ name }: { name: string }) => {
  return <span>{name}</span>; // 자동 이스케이프 -- 안전
};
```

### 2.2 dangerouslySetInnerHTML 사용 금지

```tsx
// 절대 금지 -- 이 프로젝트에서 HTML을 직접 렌더링할 이유가 없다
<div dangerouslySetInnerHTML={{ __html: userInput }} />; // 금지

// 시험 문제에 HTML/마크다운이 포함되는 경우에도 서버에서 안전한 텍스트로 변환하여 전달한다.
// 불가피하게 HTML 렌더링이 필요하면 DOMPurify로 새니타이징한 후 사용한다.
import DOMPurify from "dompurify";

const sanitized = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "sub", "sup"],
  ALLOWED_ATTR: [],
});
```

### 2.3 URL 기반 XSS 방지

```tsx
// href에 사용자 입력이 들어가는 경우 javascript: 프로토콜을 차단한다
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};
```

### 2.4 이벤트 핸들러 주의사항

```tsx
// 동적으로 생성된 문자열을 이벤트 핸들러에 넣지 않는다
// Bad
<button onClick={() => eval(dynamicString)}>실행</button>

// Good
<button onClick={() => handleAction(actionType)}>실행</button>
```

---

## 3. 입력값 검증

### 3.1 클라이언트 검증 (UX 용도)

키오스크 환경에서 사용자에게 즉각적인 피드백을 주기 위한 목적이다. 보안 목적이 아님에 주의한다.

```tsx
// 학생 정보 입력 검증
const studentSchema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름이 너무 깁니다")
    .regex(/^[가-힣a-zA-Z\s]+$/, "이름에 특수문자를 사용할 수 없습니다"),
  studentId: z
    .string()
    .min(1, "학번을 입력해주세요")
    .max(20, "학번이 너무 깁니다")
    .regex(/^[0-9-]+$/, "학번 형식이 올바르지 않습니다"),
});
```

### 3.2 답안 제출 검증

```tsx
// 답안 데이터 검증 -- 조작된 데이터 전송 방지
const answerSchema = z.object({
  questionId: z.number().int().positive(),
  selectedOption: z.number().int().min(1).max(5).nullable(), // 미응답 허용
});

const submissionSchema = z.object({
  studentName: z.string().min(1).max(50),
  studentId: z.string().min(1).max(20),
  answers: z.array(answerSchema),
});
```

### 3.3 서버 검증 필수

> **중요:** 클라이언트 검증은 우회 가능하다. Fastify 서버에서 동일한 스키마로 반드시 재검증해야 한다. 클라이언트 검증은 UX 향상 용도일 뿐이다.

---

## 4. 환경 변수 관리

### 4.1 Vite 환경 변수 규칙

Vite는 `VITE_` prefix가 있는 변수만 클라이언트 번들에 포함한다. Next.js의 `NEXT_PUBLIC_`과 동일한 역할이다.

```bash
# 클라이언트에 노출됨 (VITE_ prefix)
VITE_API_URL=http://localhost:3001

# 클라이언트에 노출되지 않음 (빌드 시 또는 서버에서만 사용)
API_SECRET_KEY=sk_live_xxxxx
```

### 4.2 환경 변수 접근 방식

```typescript
// Vite에서 환경 변수 접근
const apiUrl = import.meta.env.VITE_API_URL;

// process.env 사용 금지 -- Vite에서는 import.meta.env를 사용한다
// const apiUrl = process.env.VITE_API_URL; // 동작하지 않음
```

### 4.3 환경 변수 검증

```typescript
// 앱 시작 시 필수 환경 변수 존재 여부를 확인한다
const requiredEnvVars = ["VITE_API_URL"] as const;

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`필수 환경 변수 ${envVar}가 설정되지 않았습니다.`);
  }
}
```

### 4.4 .env 파일 관리

```bash
# .gitignore에 반드시 포함
.env
.env.local
.env.*.local
```

### 4.5 노출 금지 항목

```
VITE_ prefix로 노출하면 안 되는 것들:
- DB 접속 정보
- API 시크릿 키
- 서버 내부 URL (admin, 내부 서비스 등)
- 암호화 키
```

---

## 5. CORS 설정

### 5.1 Fastify 서버 CORS 설정 원칙

```
- 개발 환경: http://localhost:5173 (Vite 기본 포트) 허용
- 프로덕션: 배포된 도메인만 명시적으로 허용
- Access-Control-Allow-Origin: '*' 사용 금지 (프로덕션)
```

### 5.2 프론트엔드에서의 API 요청

```typescript
// API 클라이언트 설정
const apiClient = {
  baseUrl: import.meta.env.VITE_API_URL,

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return response.json();
  },
};
```

### 5.3 주의사항

```
- 이 프로젝트는 인증이 없으므로 credentials: "include" 설정이 불필요하다
- Fastify 서버의 CORS 설정과 프론트엔드 요청이 일치하는지 확인한다
- 프록시 설정(vite.config.ts의 server.proxy)으로 개발 시 CORS를 우회할 수도 있다
```

---

## 6. Anti-Patterns

### 이 프로젝트에서 절대 하지 말 것

```tsx
// 1. dangerouslySetInnerHTML 사용
<div dangerouslySetInnerHTML={{ __html: anyVariable }} />

// 2. eval 또는 Function 생성자 사용
eval(userInput);
new Function(userInput)();

// 3. 시험 답안/점수를 클라이언트에서 계산
// 채점은 반드시 서버에서 수행한다. 클라이언트는 답안 제출만 담당한다.
const score = answers.filter((a) => a.selected === a.correct).length; // 금지

// 4. 환경 변수에 민감 정보를 VITE_ prefix로 노출
// VITE_DB_PASSWORD=xxx  // 절대 금지

// 5. 콘솔에 민감 정보 로깅
console.log("학생 답안:", answers); // 프로덕션 빌드에서 제거해야 함

// 6. 인라인 스타일에 사용자 입력 삽입
<div style={{ background: `url(${userInput})` }} /> // XSS 가능

// 7. 시험 정답을 클라이언트에 전송
// API 응답에 정답이 포함되면 개발자 도구로 확인 가능하다.
// 정답은 채점 시점에만 서버에서 처리한다.
```

---

## 7. Quick Reference

### 안전한 패턴

| 상황                   | 방법                                     |
| ---------------------- | ---------------------------------------- |
| 텍스트 렌더링          | JSX `{variable}` 사용 (자동 이스케이프)  |
| 입력값 검증            | Zod 스키마 + 서버 재검증                 |
| API URL 관리           | `VITE_API_URL` 환경 변수                 |
| API 통신               | fetch + Content-Type: application/json   |
| 에러 표시              | 사용자 친화적 메시지 (내부 정보 미노출)  |
| 프로덕션 콘솔 로그     | 빌드 시 제거 또는 조건부 로깅            |

### 금지 목록

```
- dangerouslySetInnerHTML
- eval / new Function
- VITE_ prefix로 시크릿 노출
- 클라이언트에서 채점 로직 수행
- 시험 정답을 API 응답에 포함
- innerHTML 직접 조작
- 프로덕션에서 console.log로 학생 데이터 출력
```

### 보안 체크리스트

- [ ] `dangerouslySetInnerHTML` 사용하지 않았는가?
- [ ] 모든 입력값에 Zod 검증이 적용되었는가?
- [ ] `VITE_` prefix 환경 변수에 민감 정보가 없는가?
- [ ] `.env` 파일이 `.gitignore`에 포함되었는가?
- [ ] 시험 정답이 클라이언트에 노출되지 않는가?
- [ ] 채점 로직이 서버에서만 수행되는가?
- [ ] 프로덕션 빌드에서 console.log가 제거되었는가?
- [ ] Fastify CORS 설정이 허용된 origin만 포함하는가?
- [ ] API 에러 응답에 서버 내부 정보가 노출되지 않는가?
