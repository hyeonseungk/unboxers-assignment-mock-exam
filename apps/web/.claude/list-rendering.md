# List Rendering Guidelines

React + Vite + Tailwind CSS v4 환경에서의 리스트 렌더링 가이드라인입니다.
모의고사 웹앱(18-27인치 터치스크린)에서 다루는 주요 리스트: 문항 목록(25문항), OMR 답안 리스트, 채점 결과 리스트.

## Related Guides

- `.claude/performance.md`: memoization, 렌더링 최적화를 함께 검토할 때 참고
- `.claude/keyboard-handling.md`: 선택 가능한 리스트, 접근성을 맞출 때 참고
- `.claude/state-management.md`: 리스트 상태(답안 선택 등) 관리 패턴 참고
- `.claude/form-handling.md`: OMR 답안 입력 등 폼과 리스트가 결합되는 패턴 참고

---

## 1. 기본 패턴

### 1.1 원칙

| 원칙 | 설명 |
|------|------|
| **map으로 렌더링** | 25문항 규모이므로 단순 `map` 사용. 가상화 불필요 |
| **고유한 key** | 문항 번호(`questionNumber`) 또는 서버 ID 사용 |
| **컴포넌트 분리** | 리스트 컨테이너와 개별 아이템 컴포넌트를 분리 |
| **타입 안전성** | 리스트 아이템 인터페이스를 명시적으로 정의 |

> **25문항 규모의 리스트는 가상화(@tanstack/react-virtual 등)가 불필요합니다.** DOM 노드 수가 충분히 적으므로 단순 `map` 렌더링이 최적입니다. 성능 최적화는 측정 후에만 도입하세요.

### 1.2 문항 목록 렌더링

```tsx
interface Question {
  id: string;
  questionNumber: number; // 1~25
  text: string;
  options: string[]; // 보기 (5지선다)
}

interface QuestionListProps {
  questions: Question[];
  currentQuestionNumber: number;
  onQuestionSelect: (questionNumber: number) => void;
}

const QuestionList = ({
  questions,
  currentQuestionNumber,
  onQuestionSelect,
}: QuestionListProps) => {
  return (
    <ol className="space-y-2 p-4">
      {questions.map((question) => (
        <li key={question.questionNumber}>
          <QuestionItem
            question={question}
            isActive={question.questionNumber === currentQuestionNumber}
            onSelect={() => onQuestionSelect(question.questionNumber)}
          />
        </li>
      ))}
    </ol>
  );
};
```

### 1.3 OMR 답안 그리드

```tsx
interface Answer {
  questionNumber: number;
  selectedOption: number | null; // null이면 미응답
}

interface OmrGridProps {
  answers: Answer[];
  onAnswerChange: (questionNumber: number, option: number) => void;
}

const OmrGrid = ({ answers, onAnswerChange }: OmrGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-3 p-4">
      {answers.map((answer) => (
        <OmrCell
          key={answer.questionNumber}
          answer={answer}
          onChange={(option) => onAnswerChange(answer.questionNumber, option)}
        />
      ))}
    </div>
  );
};
```

### 1.4 구분선과 간격

```tsx
// divide-y: 아이템 간 구분선
<ul className="divide-y divide-gray-200">
  {questions.map((q) => (
    <li key={q.questionNumber} className="py-4">
      <QuestionItem question={q} />
    </li>
  ))}
</ul>

// space-y: 아이템 간 간격
<ul className="space-y-3 p-4">
  {questions.map((q) => (
    <li key={q.questionNumber}>
      <QuestionItem question={q} />
    </li>
  ))}
</ul>
```

---

## 2. key 관리

### 2.1 key 선택 기준

| 데이터 | key 값 | 이유 |
|--------|--------|------|
| 문항 목록 | `questionNumber` | 1~25로 고유하고 불변 |
| OMR 답안 | `questionNumber` | 문항 번호와 1:1 대응 |
| 보기(선지) | `${questionNumber}-${optionIndex}` | 문항 내에서 순서 고정 |
| 채점 결과 | `questionNumber` | 문항 번호 기준 |
| Skeleton 로더 | `index` (예외 허용) | 정적, 재정렬 없음 |

### 2.2 올바른 key 사용

```tsx
// Good - 문항 번호(고유 + 불변)
{questions.map((q) => (
  <QuestionItem key={q.questionNumber} question={q} />
))}

// Good - 서버 ID가 있는 경우
{questions.map((q) => (
  <QuestionItem key={q.id} question={q} />
))}

// Good - 복합 key (보기 렌더링)
{question.options.map((option, index) => (
  <OptionButton key={`${question.questionNumber}-${index}`} option={option} />
))}
```

### 2.3 index를 key로 써도 되는 경우

index를 key로 사용할 수 있는 **세 가지 조건**을 모두 만족해야 합니다:

1. 리스트가 정적이다 (추가/삭제/재정렬 없음)
2. 아이템에 안정적인 고유 ID가 없다
3. 아이템에 제어 상태(input, checkbox 등)가 없다

```tsx
// OK - Skeleton 로더 (정적, 상태 없음)
{Array.from({ length: 25 }).map((_, i) => (
  <SkeletonQuestionCard key={i} />
))}

// Bad - 답안 리스트에 index 사용 (선택 상태가 있음)
{answers.map((answer, index) => (
  <OmrCell key={index} answer={answer} /> // 위험: 상태가 엉킬 수 있음
))}
```

---

## 3. 조건부 렌더링

### 3.1 상태별 분기 (Loading / Empty / Error / Data)

```tsx
interface ExamResultListProps {
  results: ExamResult[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const ExamResultList = ({
  results,
  isLoading,
  isError,
  onRetry,
}: ExamResultListProps) => {
  // 1. 로딩 상태
  if (isLoading) {
    return <ResultListSkeleton />;
  }

  // 2. 에러 상태
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-gray-500">결과를 불러오지 못했습니다.</p>
        <button
          onClick={onRetry}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 3. 빈 상태
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-lg text-gray-400">아직 응시한 시험이 없습니다.</p>
      </div>
    );
  }

  // 4. 데이터 렌더링
  return (
    <ul className="space-y-3 p-4">
      {results.map((result) => (
        <li key={result.questionNumber}>
          <ResultCard result={result} />
        </li>
      ))}
    </ul>
  );
};
```

> **분기 순서**: Loading -> Error -> Empty -> Data 순서를 일관되게 유지합니다. Early return 패턴을 사용하여 가독성을 높이세요.

### 3.2 Skeleton UI

```tsx
const ResultListSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 25 }).map((_, i) => (
      <div key={i} className="animate-pulse rounded-lg bg-gray-100 p-4">
        <div className="h-4 w-1/4 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
      </div>
    ))}
  </div>
);
```

### 3.3 아이템 내부 조건부 렌더링

```tsx
interface ResultCardProps {
  result: ExamResult;
}

const ResultCard = ({ result }: ResultCardProps) => {
  const isCorrect = result.selectedOption === result.correctOption;
  const isUnanswered = result.selectedOption === null;

  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        isUnanswered
          ? "border-gray-200 bg-gray-50"
          : isCorrect
            ? "border-green-300 bg-green-50"
            : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {result.questionNumber}번
        </span>
        {isUnanswered ? (
          <span className="text-sm text-gray-400">미응답</span>
        ) : isCorrect ? (
          <span className="text-sm font-semibold text-green-600">O</span>
        ) : (
          <span className="text-sm font-semibold text-red-600">X</span>
        )}
      </div>
    </div>
  );
};
```

### 3.4 빈 상태 메시지 패턴

빈 상태는 맥락에 맞는 안내 메시지를 제공합니다:

```tsx
// 문항 목록 빈 상태 (시험 데이터 로드 실패)
const EmptyQuestionList = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <p className="text-lg text-gray-400">문항을 불러올 수 없습니다.</p>
    <p className="text-sm text-gray-300">시험 데이터를 확인해주세요.</p>
  </div>
);

// 채점 결과 빈 상태 (아직 미응시)
const EmptyResultList = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <p className="text-lg text-gray-400">아직 응시한 시험이 없습니다.</p>
    <p className="text-sm text-gray-300">시험을 선택하여 응시해보세요.</p>
  </div>
);
```

---

## 4. 선택 가능한 리스트

### 4.1 단일 선택 (보기 선택)

모의고사의 핵심 인터랙션: 5지선다 보기 중 하나를 선택합니다.

```tsx
interface OptionSelectProps {
  questionNumber: number;
  options: string[];
  selectedOption: number | null;
  onSelect: (optionIndex: number) => void;
}

const OptionSelect = ({
  questionNumber,
  options,
  selectedOption,
  onSelect,
}: OptionSelectProps) => {
  return (
    <ol className="space-y-2">
      {options.map((option, index) => (
        <li key={`${questionNumber}-${index}`}>
          <button
            onClick={() => onSelect(index)}
            className={`w-full rounded-lg p-4 text-left transition-colors ${
              selectedOption === index
                ? "border-2 border-blue-500 bg-blue-50"
                : "border-2 border-transparent bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <span className="mr-3 font-medium">
              {String.fromCharCode(0x2460 + index)} {/* ①②③④⑤ */}
            </span>
            {option}
          </button>
        </li>
      ))}
    </ol>
  );
};
```

### 4.2 OMR 카드 (문항 네비게이션)

터치스크린에서 문항 간 빠른 이동을 위한 OMR 스타일 그리드:

```tsx
interface OmrNavigationProps {
  totalQuestions: number;
  answers: (number | null)[]; // 각 문항의 선택된 답안 (null이면 미응답)
  currentQuestion: number;
  onNavigate: (questionNumber: number) => void;
}

const OmrNavigation = ({
  totalQuestions,
  answers,
  currentQuestion,
  onNavigate,
}: OmrNavigationProps) => {
  return (
    <div className="grid grid-cols-5 gap-2 p-4">
      {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
        (qNum) => {
          const isAnswered = answers[qNum - 1] !== null;
          const isCurrent = qNum === currentQuestion;

          return (
            <button
              key={qNum}
              onClick={() => onNavigate(qNum)}
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isCurrent
                  ? "bg-blue-600 text-white"
                  : isAnswered
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {qNum}
            </button>
          );
        }
      )}
    </div>
  );
};
```

---

## 5. 그룹화된 리스트

### 5.1 과목별 문항 그룹

```tsx
interface SubjectGroup {
  subject: string;
  questions: Question[];
}

const GroupedQuestionList = ({
  groups,
}: {
  groups: SubjectGroup[];
}) => {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.subject}>
          <h3 className="sticky top-0 bg-white px-4 py-2 text-sm font-semibold text-gray-500">
            {group.subject} ({group.questions.length}문항)
          </h3>
          <ul className="divide-y divide-gray-100">
            {group.questions.map((q) => (
              <li key={q.questionNumber} className="px-4 py-3">
                <QuestionItem question={q} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
```

### 5.2 채점 결과 요약 + 상세 리스트

```tsx
interface GradingResult {
  questionNumber: number;
  isCorrect: boolean;
  selectedOption: number | null;
  correctOption: number;
}

const GradingResultView = ({
  results,
}: {
  results: GradingResult[];
}) => {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const unansweredCount = results.filter(
    (r) => r.selectedOption === null
  ).length;

  return (
    <div className="space-y-4">
      {/* 요약 헤더 */}
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
        <span className="text-sm text-gray-500">
          총 {results.length}문항
        </span>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">정답 {correctCount}</span>
          <span className="text-red-600">
            오답 {results.length - correctCount - unansweredCount}
          </span>
          <span className="text-gray-400">미응답 {unansweredCount}</span>
        </div>
      </div>

      {/* 상세 결과 리스트 */}
      <ul className="space-y-2">
        {results.map((result) => (
          <li key={result.questionNumber}>
            <ResultCard result={result} />
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 6. Anti-Patterns

### key로 index 사용 (동적 리스트)

```tsx
// Bad - 답안 변경/재정렬 시 상태 꼬임
{answers.map((answer, index) => (
  <OmrCell key={index} answer={answer} />
))}

// Good - 문항 번호로 안정적인 key
{answers.map((answer) => (
  <OmrCell key={answer.questionNumber} answer={answer} />
))}
```

### 리스트 내부에서 직접 복잡한 로직 작성

```tsx
// Bad - map 내부에서 복잡한 계산
<ul>
  {questions.map((q) => {
    const relatedAnswers = answers.filter((a) => a.questionNumber === q.questionNumber);
    const isCorrect = relatedAnswers[0]?.selectedOption === q.correctOption;
    const category = categories.find((c) => c.id === q.categoryId);
    return (
      <li key={q.questionNumber}>
        {/* 복잡한 렌더링... */}
      </li>
    );
  })}
</ul>

// Good - 데이터 가공을 사전에 처리
const enrichedQuestions = useMemo(() => {
  return questions.map((q) => ({
    ...q,
    answer: answerMap.get(q.questionNumber) ?? null,
    isCorrect: answerMap.get(q.questionNumber)?.selectedOption === q.correctOption,
    category: categoryMap.get(q.categoryId),
  }));
}, [questions, answerMap, categoryMap]);

<ul>
  {enrichedQuestions.map((q) => (
    <li key={q.questionNumber}>
      <EnrichedQuestionCard question={q} />
    </li>
  ))}
</ul>
```

### 불필요한 Fragment 래핑

```tsx
// Bad - 불필요한 Fragment
{questions.map((q) => (
  <React.Fragment key={q.questionNumber}>
    <QuestionItem question={q} />
  </React.Fragment>
))}

// Good - 직접 key 전달
{questions.map((q) => (
  <QuestionItem key={q.questionNumber} question={q} />
))}

// OK - Fragment가 필요한 경우 (형제 요소 여러 개 반환)
{questions.map((q) => (
  <React.Fragment key={q.questionNumber}>
    <QuestionItem question={q} />
    <Divider />
  </React.Fragment>
))}
```

### 인라인 스타일 객체 매 렌더마다 생성

```tsx
// Bad - 매 렌더마다 새 객체 생성
<div style={{ height: questions.length * 60 }}>

// Good - useMemo로 안정화 또는 Tailwind 클래스 사용
const containerStyle = useMemo(
  () => ({ height: questions.length * 60 }),
  [questions.length]
);
<div style={containerStyle}>
```

---

## Quick Reference

### 기본 리스트 (map)

```tsx
<ul className="space-y-3">
  {questions.map((q) => (
    <li key={q.questionNumber}>
      <QuestionItem question={q} />
    </li>
  ))}
</ul>
```

### 구분선 있는 리스트

```tsx
<ul className="divide-y divide-gray-200">
  {results.map((r) => (
    <li key={r.questionNumber} className="py-4">
      <ResultCard result={r} />
    </li>
  ))}
</ul>
```

### 그리드 (OMR 카드)

```tsx
<div className="grid grid-cols-5 gap-2">
  {Array.from({ length: 25 }, (_, i) => i + 1).map((qNum) => (
    <OmrButton key={qNum} questionNumber={qNum} />
  ))}
</div>
```

### 조건부 렌더링 순서

```tsx
if (isLoading) return <Skeleton />;
if (isError) return <ErrorView onRetry={retry} />;
if (items.length === 0) return <EmptyState />;
return <List items={items} />;
```

---

## PR Checklist

- [ ] key가 고유하고 안정적인 값(문항 번호, 서버 ID)을 사용하는가?
- [ ] index를 key로 사용한 경우, 정적 + 상태 없음 조건을 만족하는가?
- [ ] Loading / Error / Empty 상태가 모두 처리되어 있는가?
- [ ] 빈 상태 메시지가 맥락에 맞는 안내를 제공하는가?
- [ ] map 내부에 복잡한 로직이 없고, 사전 가공된 데이터를 사용하는가?
- [ ] 리스트 컨테이너와 아이템 컴포넌트가 적절히 분리되어 있는가?
- [ ] Tailwind의 `divide-y` 또는 `space-y`를 적절히 사용했는가?
- [ ] 터치스크린 사용성을 고려하여 충분한 터치 영역(최소 44px)이 확보되어 있는가?
