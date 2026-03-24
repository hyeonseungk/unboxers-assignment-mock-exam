# 코드 문서화 가이드라인

코드 문서화는 **미래의 읽는 사람(리뷰어, 동료, 3개월 후의 나)이 코드의 의도를 빠르게 파악**하도록 돕는 행위입니다.

입사 과제에서 문서화 품질은 곧 커뮤니케이션 역량의 지표입니다. 과도하지 않으면서도, 필요한 곳에 정확히 존재하는 문서화가 핵심입니다.

---

## 1. 문서화 원칙

### 1.1 Self-Documenting Code 우선

주석보다 **코드 자체가 의도를 드러내는 것**이 최우선입니다. 주석이 필요하다고 느낀다면, 먼저 변수명/함수명/타입명을 개선할 수 있는지 검토합니다.

```typescript
// Bad: 주석으로 보충해야 읽히는 코드
// 남은 시간을 계산한다
const t = d - Date.now();

// Good: 코드 자체가 의도를 전달
const remainingTimeMs = deadline - Date.now();
```

### 1.2 핵심 원칙 요약

| 원칙 | 설명 |
| --- | --- |
| **Code = What, Comment = Why** | 코드가 하는 일을 설명하지 말고, 왜 그렇게 했는지 설명 |
| **타입이 곧 문서** | TypeScript 타입 시스템을 적극 활용하여 명세를 표현 |
| **죽은 코드 금지** | 주석 처리된 코드는 삭제 (Git이 기억함) |
| **주석도 유지보수 대상** | 코드 변경 시 관련 주석도 함께 갱신 |
| **비즈니스 로직은 한글** | 도메인 규칙, 정책 설명은 한글로 작성 |

### 1.3 입사 과제에서의 문서화 전략

입사 과제 코드는 **리뷰어가 처음 보는 코드**입니다. 다음을 염두에 둡니다.

- **설계 의도가 드러나야 한다**: 왜 이 구조를 선택했는지
- **도메인 맥락이 전달되어야 한다**: 모의고사 앱 특유의 비즈니스 규칙
- **읽는 흐름이 자연스러워야 한다**: 파일 구조, 네이밍, 타입이 일관되게 정리
- **과시용 주석은 배제한다**: 간결하되 빠뜨리지 않는 것이 목표

---

## 2. 코드 주석

### 2.1 주석을 작성해야 하는 경우

#### 비즈니스 로직/도메인 규칙

```typescript
const calculateScore = (answers: UserAnswer[], exam: Exam): number => {
  // 모의고사 채점 정책: 정답은 +1점, 오답은 0점 (감점 없음)
  // 빈 답안(미응시)도 0점 처리
  return answers.reduce((score, answer) => {
    const question = exam.questions.find((q) => q.id === answer.questionId);
    return score + (answer.selectedOption === question?.correctOption ? 1 : 0);
  }, 0);
};
```

#### 비자명한 기술적 결정

```typescript
// NOTE: React 18 StrictMode에서 useEffect가 2회 실행되므로
// 타이머 초기화 로직에 cleanup 함수 필수
useEffect(() => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}, [tick]);
```

#### 워크어라운드/우회 처리

```typescript
// HACK: Safari에서 position: sticky와 overflow: auto 조합 시
// 스크롤 영역 내 sticky 요소가 동작하지 않는 이슈 우회
// See: https://bugs.webkit.org/show_bug.cgi?id=XXXXX
const containerStyle = {
  WebkitOverflowScrolling: 'touch',
  overflowY: 'auto' as const,
};
```

#### 정규식 패턴

```typescript
// 시간 형식 검증: MM:SS (00:00 ~ 99:59)
// 모의고사 타이머 표시에 사용
const TIME_FORMAT_REGEX = /^[0-9]{2}:[0-5][0-9]$/;
```

#### 매직 넘버의 상수화

```typescript
const EXAM_TIME_LIMIT_SECONDS = 3600; // 모의고사 제한시간 60분
const QUESTION_NAVIGATION_DEBOUNCE_MS = 150; // 문제 이동 버튼 연타 방지
const AUTO_SAVE_INTERVAL_MS = 30_000; // 답안 자동 저장 주기 30초
```

### 2.2 주석을 작성하지 말아야 하는 경우

#### 코드가 이미 설명하는 내용

```typescript
// Bad
// 현재 문제 인덱스를 1 증가시킨다
setCurrentQuestionIndex((prev) => prev + 1);

// Good: 주석 없이도 의도가 명확
setCurrentQuestionIndex((prev) => prev + 1);
```

#### 더 나은 네이밍으로 대체 가능한 경우

```typescript
// Bad
// 데이터를 처리한다
const result = processData(data);

// Good
const sortedExamResults = sortByScoreDescending(rawExamResults);
```

#### 주석 처리된 코드 (Ghost Code)

```typescript
// Bad: Git History에 맡기세요
const handleSubmit = () => {
  // const oldAnswers = legacyFormat(answers);
  // submitLegacy(oldAnswers);
  submitExamAnswers(answers);
};
```

### 2.3 주석 배치 규칙

```typescript
// Good: 주석은 대상 코드 바로 윗줄에
// 시험 종료 시 미응답 문항을 빈 답안으로 채워 제출
const filledAnswers = fillEmptyAnswers(answers, exam.questions);

// Bad: 라인 끝 주석 (코드 변경 시 정렬이 깨짐)
const filledAnswers = fillEmptyAnswers(answers, exam.questions); // 빈 답안 채우기

// Bad: 주석과 코드 사이에 빈 줄 (연관성 불명확)
// 시험 종료 시 미응답 문항을 빈 답안으로 채워 제출

const filledAnswers = fillEmptyAnswers(answers, exam.questions);
```

### 2.4 표준 태그

| 태그 | 용도 | 예시 |
| --- | --- | --- |
| `TODO` | 추후 구현 예정 | `// TODO: 서버 API 연동 후 Mock 데이터 제거` |
| `FIXME` | 알려진 버그/수정 필요 | `// FIXME: 문제 수가 0일 때 division by zero` |
| `HACK` | 임시 우회 코드 | `// HACK: Vite HMR 관련 이슈 우회` |
| `NOTE` | 주의사항/엣지케이스 | `// NOTE: 시험 시간 0초일 때도 제출 허용` |

---

## 3. TypeScript 타입을 문서화 도구로 활용

TypeScript의 타입 시스템은 그 자체로 가장 신뢰할 수 있는 문서입니다. 런타임에 검증되지 않는 주석과 달리, 타입은 **컴파일러가 정확성을 보장**합니다.

### 3.1 타입으로 의도를 표현하기

#### 유니온 타입으로 허용 값 명시

```typescript
// Bad: 주석으로 허용 값을 설명
/** status는 'not_started', 'in_progress', 'completed' 중 하나 */
type ExamStatus = string;

// Good: 타입 자체가 허용 값을 문서화
type ExamStatus = 'not_started' | 'in_progress' | 'completed';
```

#### 브랜드 타입으로 도메인 개념 구분

```typescript
// 단순 number 대신 도메인 의미가 담긴 타입
type QuestionId = number & { readonly __brand: 'QuestionId' };
type ExamId = number & { readonly __brand: 'ExamId' };

// 컴파일 타임에 잘못된 ID 전달을 방지
const getQuestion = (id: QuestionId): Question => { /* ... */ };
```

#### 제네릭으로 관계 표현

```typescript
// API 응답 구조를 타입으로 문서화
interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: number;
}

// 사용처에서 어떤 데이터가 오는지 타입만으로 파악 가능
type ExamListResponse = ApiResponse<Exam[]>;
type ExamDetailResponse = ApiResponse<Exam>;
```

### 3.2 인터페이스/타입에 JSDoc 주석 활용

타입 필드에 JSDoc 주석을 달면 IDE에서 hover 시 설명이 표시됩니다.

```typescript
/** 모의고사 문제 */
interface Question {
  /** 문제 고유 식별자 */
  id: number;
  /** 문제 본문 텍스트 */
  content: string;
  /** 선택지 목록 (최소 2개, 최대 5개) */
  options: Option[];
  /** 정답 선택지 번호 (1부터 시작) */
  correctOption: number;
}

/** 사용자가 제출한 답안 */
interface UserAnswer {
  questionId: number;
  /** 선택한 옵션 번호. null이면 미응답 */
  selectedOption: number | null;
}
```

**작성 기준**: 필드명만으로 의미가 명확하면 주석을 생략합니다. `id`, `content` 같은 자명한 필드는 생략해도 무방하지만, `correctOption`처럼 "1부터 시작"이라는 도메인 규약이 있으면 반드시 표기합니다.

### 3.3 함수 시그니처를 문서처럼 설계

```typescript
// Bad: 파라미터가 무엇을 의미하는지 시그니처만으로 알 수 없음
const navigate = (n: number, s: boolean) => { /* ... */ };

// Good: 파라미터명과 타입이 곧 문서
const navigateToQuestion = (
  questionIndex: number,
  shouldScrollToTop: boolean,
) => { /* ... */ };

// Better: 옵션 객체로 의도를 더 명확하게
interface NavigationOptions {
  questionIndex: number;
  scrollToTop?: boolean;
  highlightOnArrive?: boolean;
}

const navigateToQuestion = (options: NavigationOptions) => { /* ... */ };
```

### 3.4 enum 대신 const 객체 + 타입 추출

```typescript
// 모의고사 난이도
const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];
// 결과: 'easy' | 'medium' | 'hard'
```

이 패턴은 값과 타입을 동시에 제공하며, tree-shaking에도 유리합니다.

---

## 4. JSDoc 작성 가이드

### 4.1 기본 원칙

- TypeScript 타입이 충분한 문서 역할을 하므로, **JSDoc은 선택 사항**
- `@param`, `@returns`의 타입 정보는 TypeScript가 이미 제공하므로 중복 기재하지 않음
- JSDoc은 **비즈니스 로직이 복잡하거나, 사용 맥락 전달이 필요한 경우**에만 작성

### 4.2 함수 문서화

```typescript
/**
 * 모의고사 결과를 채점하여 점수와 등급을 반환합니다.
 *
 * @description
 * - 정답 수 기준으로 점수를 계산하고, 과목별 통과 여부를 판별
 * - 전 과목 60점 이상 + 평균 70점 이상이면 합격
 * - 채점 결과는 서버에도 저장되어야 하므로 API 호출 포함
 *
 * @param answers - 사용자가 제출한 답안 배열
 * @param exam - 채점 대상 모의고사 정보
 * @returns 채점 결과 (점수, 등급, 과목별 상세)
 *
 * @example
 * ```typescript
 * const result = gradeExam(submittedAnswers, currentExam);
 * console.log(result.totalScore); // 85
 * console.log(result.passed);     // true
 * ```
 */
const gradeExam = (answers: UserAnswer[], exam: Exam): GradeResult => {
  // ...
};
```

**간단한 유틸리티 함수는 한 줄 설명이면 충분합니다.**

```typescript
/** 초 단위 시간을 MM:SS 형식 문자열로 변환합니다. */
const formatTime = (seconds: number): string => {
  // ...
};
```

### 4.3 주요 태그 용법

```typescript
/**
 * 한 줄 요약 (필수)
 *
 * @description 상세 설명이 필요한 경우에만 작성
 * @param name - 파라미터 설명 (타입은 TypeScript가 제공)
 * @returns 반환값 설명
 * @throws {ErrorType} 에러 발생 조건
 * @example 사용 예시
 * @see 참조 링크 또는 관련 함수
 * @deprecated 대체 수단 안내
 */
```

---

## 5. README 작성

### 5.1 프로젝트 README

입사 과제의 README는 **리뷰어가 프로젝트를 이해하고 실행하는 데 필요한 최소한의 정보**를 제공합니다.

**필수 포함 항목:**

| 섹션 | 내용 |
| --- | --- |
| 프로젝트 개요 | 무엇을 하는 앱인지 한두 문장으로 |
| 기술 스택 | 사용한 주요 라이브러리와 선택 이유 (간략히) |
| 실행 방법 | 환경 설정부터 `pnpm dev`까지 단계별 안내 |
| 프로젝트 구조 | 디렉토리 구조와 각 폴더의 역할 |
| 주요 설계 결정 | 아키텍처, 상태 관리, 스타일링 등의 선택 근거 |

**지양할 것:**

- 뻔한 내용의 나열 ("React는 UI 라이브러리입니다")
- 미구현 기능을 구현한 것처럼 기술
- 과도하게 긴 설명 (리뷰어의 시간을 존중)

### 5.2 README 작성 예시 구조

```markdown
# 모의고사 웹앱

[프로젝트 한 줄 설명]

## 기술 스택

| 분류 | 기술 | 선택 이유 |
| --- | --- | --- |
| UI | React 19 + Vite | ... |
| 상태 관리 | ... | ... |
| 스타일링 | ... | ... |

## 시작하기

### 사전 요구사항
- Node.js >= 20
- pnpm >= 10

### 설치 및 실행
(단계별 명령어)

## 프로젝트 구조
(주요 디렉토리와 파일의 역할)

## 주요 설계 결정
(아키텍처 선택의 근거를 간결하게)
```

---

## 6. 컴포넌트 문서화

### 6.1 Props 인터페이스가 곧 문서

React 컴포넌트의 가장 효과적인 문서화는 **Props 타입을 명확하게 정의**하는 것입니다.

```typescript
interface ExamTimerProps {
  /** 제한 시간 (초 단위) */
  timeLimitSeconds: number;
  /** 시간 만료 시 호출되는 콜백 */
  onTimeUp: () => void;
  /** 남은 시간이 이 값(초) 이하일 때 경고 스타일 적용 */
  warningThresholdSeconds?: number;
  /** 타이머 일시정지 여부 */
  isPaused?: boolean;
}
```

위 인터페이스만으로 컴포넌트의 동작 방식과 사용법을 파악할 수 있습니다.

### 6.2 복잡한 컴포넌트에만 JSDoc 추가

단순 UI 컴포넌트는 Props 타입만으로 충분합니다. JSDoc은 **비즈니스 로직이 내포되거나 사용 맥락 전달이 필요한 경우**에만 작성합니다.

```typescript
// 단순 컴포넌트: Props 타입만으로 충분
interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  onOptionSelect: (optionIndex: number) => void;
}

export const QuestionCard = ({ question, selectedOption, onOptionSelect }: QuestionCardProps) => {
  // ...
};
```

```typescript
/**
 * 문제 번호 네비게이션 그리드
 *
 * @description
 * 전체 문제 번호를 그리드로 표시하며, 각 번호의 상태(미응답/응답완료/현재문제)를
 * 시각적으로 구분합니다. 문제 번호 클릭 시 해당 문제로 이동합니다.
 *
 * @example
 * ```tsx
 * <QuestionNavigator
 *   totalQuestions={50}
 *   currentIndex={3}
 *   answeredIndices={[0, 1, 2, 5]}
 *   onNavigate={(index) => setCurrentIndex(index)}
 * />
 * ```
 */
export const QuestionNavigator = (props: QuestionNavigatorProps) => {
  // ...
};
```

### 6.3 Custom Hook 문서화

Custom Hook은 **사용 방법과 반환값의 의미**가 명확해야 합니다.

```typescript
/**
 * 모의고사 타이머를 관리하는 Hook
 *
 * @param timeLimitSeconds - 제한 시간 (초)
 * @param onTimeUp - 시간 만료 콜백
 * @returns 타이머 상태와 제어 함수
 *
 * @example
 * ```tsx
 * const { remainingSeconds, isRunning, pause, resume } = useExamTimer(3600, handleTimeUp);
 * ```
 */
const useExamTimer = (
  timeLimitSeconds: number,
  onTimeUp: () => void,
): ExamTimerState => {
  // ...
};
```

반환 타입을 명시적 인터페이스로 정의하면 추가 문서화 없이도 의도가 전달됩니다.

```typescript
interface ExamTimerState {
  /** 남은 시간 (초) */
  remainingSeconds: number;
  /** 타이머 동작 중 여부 */
  isRunning: boolean;
  /** 타이머 일시정지 */
  pause: () => void;
  /** 타이머 재개 */
  resume: () => void;
  /** 타이머 초기화 */
  reset: () => void;
}
```

---

## 7. Anti-Patterns

### 7.1 과도한 주석 (Over-Documentation)

```typescript
// Bad: 모든 줄에 주석을 다는 것은 오히려 가독성을 해침
const ExamPage = () => {
  // 현재 문제 인덱스 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  // 사용자 답안 상태
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  // 시험 데이터를 fetch
  const { data: exam } = useQuery({ queryKey: ['exam'], queryFn: fetchExam });

  // 다음 문제로 이동하는 함수
  const goToNext = () => {
    // 현재 인덱스가 마지막이 아니면
    if (currentIndex < exam.questions.length - 1) {
      // 인덱스를 1 증가
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // ...
};
```

**위 코드에서 모든 주석을 제거해도 의미가 명확합니다.** 변수명과 함수명이 충분히 설명적이기 때문입니다.

### 7.2 거짓말하는 주석

```typescript
// Bad: 코드를 수정했지만 주석은 갱신하지 않음
// 정답이면 +2점
return isCorrect ? 1 : 0; // 실제로는 +1점
```

코드와 불일치하는 주석은 주석이 없는 것보다 나쁩니다. **주석을 작성했다면, 코드 변경 시 함께 갱신하는 것은 의무입니다.**

### 7.3 JSDoc 타입 중복

```typescript
// Bad: TypeScript 타입과 JSDoc 타입이 중복
/**
 * @param {number} questionIndex - 문제 인덱스
 * @param {string} answer - 선택한 답
 * @returns {boolean} 정답 여부
 */
const checkAnswer = (questionIndex: number, answer: string): boolean => {
  // ...
};

// Good: JSDoc에서 타입을 중복 명시하지 않음
/**
 * @param questionIndex - 문제 인덱스
 * @param answer - 선택한 답
 * @returns 정답 여부
 */
const checkAnswer = (questionIndex: number, answer: string): boolean => {
  // ...
};
```

### 7.4 의미 없는 파일 헤더

```typescript
// Bad: 파일명으로 이미 알 수 있는 정보
/**
 * ExamTimer 컴포넌트
 * @author 홍길동
 * @created 2026-03-24
 */

// Good: 파일 헤더가 필요한 경우 (복잡한 모듈)
/**
 * @packageDocumentation
 * 모의고사 채점 엔진
 *
 * 과목별 가중치 적용, 부분점수 계산, 합격 판정 등
 * 채점 관련 핵심 비즈니스 로직을 포함합니다.
 */
```

### 7.5 TODO 남발

```typescript
// Bad: 구체적이지 않은 TODO
// TODO: 나중에 고치기
// TODO: 리팩토링 필요
// TODO: 더 좋은 방법 찾기

// Good: 실행 가능한 TODO
// TODO: 서버 API 구현 후 Mock 데이터 제거 — GET /api/exams/:id 연동
// FIXME: 문제 수가 100개 이상일 때 네비게이터 그리드 레이아웃 깨짐
```

---

## 8. Quick Reference

### 주석 작성 판단 기준

```
코드를 작성했다
  │
  ├─ 이 코드가 무엇을 하는지 설명이 필요한가?
  │    ├─ Yes → 더 나은 이름(변수명/함수명)으로 해결되는가?
  │    │         ├─ Yes → 이름 개선 (주석 불필요)
  │    │         └─ No  → Why(이유)를 주석으로 작성
  │    └─ No  → 주석 불필요
  │
  └─ 비즈니스 규칙이나 도메인 정책이 포함되어 있는가?
       ├─ Yes → 정책의 출처/근거를 주석으로 기록
       └─ No  → 주석 불필요
```

### 적절한 주석 vs 과도한 주석 판별

| 상황 | 적절한 문서화 | 과도한 문서화 |
| --- | --- | --- |
| `useState` 선언 | 없음 | `// 상태를 선언한다` |
| 채점 로직 | `// 정답 +1점, 오답 0점 (감점 없음)` | 매 줄마다 주석 |
| Props 인터페이스 | 비자명한 필드에만 JSDoc | 모든 필드에 JSDoc |
| 유틸 함수 | 함수명이 설명적이면 생략 | 모든 함수에 상세 JSDoc |
| API 호출 | 비정상 케이스 처리에 주석 | 성공 케이스까지 주석 |
| 상수 | 도메인 의미가 있으면 한 줄 주석 | `// 상수를 정의한다` |

### JSDoc 태그 요약

```typescript
/** 한 줄 요약 */

/**
 * 한 줄 요약 (첫 줄, 필수)
 *
 * @description 상세 설명 (복잡한 로직에만)
 * @param name - 파라미터 설명
 * @returns 반환값 설명
 * @throws {ErrorType} 에러 조건
 * @example 사용 예시
 * @see 관련 참조
 * @deprecated 대체 수단
 */
```

### 코드 리뷰 체크리스트

- [ ] 더 나은 변수명/함수명으로 주석을 대체할 수 있는가?
- [ ] 비즈니스 로직에 Why가 설명되어 있는가?
- [ ] TypeScript 타입이 의도를 충분히 표현하는가?
- [ ] 주석 처리된 코드(Ghost Code)가 남아있지 않는가?
- [ ] 코드 변경 시 관련 주석도 함께 갱신했는가?
- [ ] JSDoc에 TypeScript 타입과 중복되는 정보가 없는가?
- [ ] TODO/FIXME가 구체적이고 실행 가능한가?
