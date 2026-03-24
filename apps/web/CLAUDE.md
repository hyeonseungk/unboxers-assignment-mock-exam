# 모의고사 웹앱 (apps/web)

## 필수 참고 자료

모든 작업을 수행하기 전에 반드시 프로젝트 루트의 `README.md` 파일을 참고하세요.
GitHub 원본: https://github.com/hyeonseungk/unboxers-assignment-mock-exam

---

## 프로젝트 개요

베이스 수학학원에서 **18-27인치 터치스크린**을 이용해 시험을 응시하는 **모의고사 웹앱**입니다.
학생들이 지면에 문제를 풀고, 답안을 앱에서 OMR 마킹하여 채점과 결과 확인을 온라인으로 진행합니다.

### 3단계 흐름

1. **튜토리얼**: 시험 응시 안내 및 OMR 카드 작성 방법 안내
2. **답안지 마킹**: OMR 카드에 답안 입력 + 남은 시간 표시
3. **채점 및 결과 확인**: 답안 제출 후 채점 결과 확인

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프론트엔드 | React + Vite |
| 패키지 관리 | pnpm (workspace 모노레포) |
| 스타일링 | Tailwind CSS v4 |
| 데이터 관리 | TanStack Query |
| 라우팅 | React Router |
| 폼 처리 | useState (추가 라이브러리 없음) |
| 테스트 | Vitest + React Testing Library |

---

## 서버 & API

서버는 `apps/server`에 이미 구현되어 있습니다 (`Fastify + Prisma + SQLite`).

- 서버 주소: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/swagger`

### API 엔드포인트

#### `GET /api/exams` — 시험 정보 조회

```json
{
  "message": "Exam retrieved successfully",
  "data": {
    "title": "모의고사 응시 테스트",
    "description": "모의고사 웹앱 과제용으로 구성한 시험입니다.",
    "supervisorName": "배이수",
    "totalQuestions": 25,
    "totalScore": 100
  }
}
```

#### `POST /api/exams/submit` — 답안 제출 & 채점

**Request:**
```json
{
  "name": "홍길동",
  "school": "베이스고",
  "grade": 1,
  "studentNumber": 12,
  "seatNumber": 3,
  "answers": [
    { "answerType": "objective", "number": 1, "answer": 3 },
    { "answerType": "subjective", "number": 1, "answer": "6" }
  ]
}
```

- `answers`: 빈 배열 허용 (미제출 시 전체 `unanswered` 처리)
- `answerType`: `"objective"` 또는 `"subjective"`

**Response:**
```json
{
  "message": "Exam submitted successfully",
  "data": {
    "title": "모의고사 응시 테스트",
    "score": 5,
    "correctCount": 2,
    "wrongCount": 0,
    "unansweredCount": 23,
    "results": [
      { "answerType": "objective", "number": 1, "result": "correct" },
      { "answerType": "subjective", "number": 1, "result": "correct" }
    ]
  }
}
```

### 시험 구성

- 객관식 14문항 (5지선다, 배점 2~5.5점)
- 주관식 11문항 (숫자 답안, 배점 3~8점)
- 총 25문항, 만점 100점

---

## 실행 방법

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

---

## 가이드라인

`apps/web/.claude/` 디렉토리에 각 영역별 가이드라인이 있습니다. 작업 시 관련 가이드라인을 참고하세요.

| 파일 | 설명 |
|------|------|
| `navigation.md` | React Router 라우팅 |
| `screen-layout.md` | 터치스크린 레이아웃 |
| `ui-component.md` | 컴포넌트 설계 (OMR, 타이머 등) |
| `form-handling.md` | 폼 처리 (학생 정보, 답안 입력) |
| `state-management.md` | 상태 관리 전략 |
| `server-request.md` | API 통신 (TanStack Query) |
| `error-handling.md` | 에러 처리 |
| `design-color.md` | 색상 시스템 & 디자인 토큰 |
| `typography-i18n.md` | 타이포그래피 |
| `modal-dialog.md` | 모달/다이얼로그 |
| `keyboard-handling.md` | 키보드 & 터치 입력 |
| `animation-gesture.md` | 애니메이션 & 제스처 |
| `list-rendering.md` | 리스트 렌더링 |
| `performance.md` | 성능 최적화 |
| `testing.md` | 테스트 (Vitest) |
| `logging.md` | 로깅 |
| `security.md` | 보안 |
| `image.md` | 이미지 처리 |
| `package-manager.md` | pnpm 패키지 관리 |
| `utility.md` | 유틸리티 함수 |
| `documentation.md` | 코드 문서화 |
| `analytics.md` | 분석/추적 (선택사항) |

---

## 작업별 참고 가이드라인

작업을 수행할 때 아래 매핑을 참고하여 관련 가이드라인 파일을 **반드시 읽은 후** 작업하세요.

### 페이지/라우트 작업

| 작업 | 참고 가이드라인 |
|------|----------------|
| 새 페이지 추가, 라우트 설정 | `navigation.md`, `screen-layout.md` |
| 페이지 레이아웃 구성 | `screen-layout.md`, `design-color.md` |
| 페이지 간 이동, 리다이렉트 | `navigation.md`, `state-management.md` |

### UI 컴포넌트 작업

| 작업 | 참고 가이드라인 |
|------|----------------|
| OMR 카드, 버블 선택 UI | `ui-component.md`, `keyboard-handling.md`, `design-color.md` |
| 타이머 컴포넌트 | `ui-component.md`, `state-management.md`, `typography-i18n.md` |
| 버튼, 입력 필드 등 공통 UI | `ui-component.md`, `design-color.md`, `animation-gesture.md` |
| 모달/확인 다이얼로그 | `modal-dialog.md`, `keyboard-handling.md` |
| 리스트/테이블 렌더링 | `list-rendering.md`, `performance.md` |
| 애니메이션, 전환 효과 | `animation-gesture.md`, `performance.md` |
| 아이콘, 이미지 사용 | `image.md` |

### 데이터/상태 작업

| 작업 | 참고 가이드라인 |
|------|----------------|
| API 호출 (시험 조회, 답안 제출) | `server-request.md`, `error-handling.md` |
| 전역/로컬 상태 설계 | `state-management.md` |
| 답안 데이터 관리, 학생 정보 | `state-management.md`, `form-handling.md` |

### 폼/입력 작업

| 작업 | 참고 가이드라인 |
|------|----------------|
| 학생 정보 입력 폼 | `form-handling.md`, `keyboard-handling.md`, `security.md` |
| OMR 답안 마킹 (객관식/주관식) | `form-handling.md`, `ui-component.md`, `keyboard-handling.md` |
| 입력값 검증 | `form-handling.md`, `security.md` |

### 스타일링 작업

| 작업 | 참고 가이드라인 |
|------|----------------|
| 색상, 테마 설정 | `design-color.md` |
| 폰트, 텍스트 스타일 | `typography-i18n.md` |
| 반응형/터치스크린 대응 | `screen-layout.md`, `ui-component.md` |
| Tailwind CSS 설정 | `design-color.md`, `screen-layout.md` |

### 품질/인프라 작업

| 작업 | 참고 가이드라인 |
|------|----------------|
| 테스트 작성 | `testing.md` |
| 에러 핸들링, Error Boundary | `error-handling.md`, `logging.md` |
| 성능 최적화, 번들 분석 | `performance.md` |
| 보안 점검 | `security.md` |
| 유틸리티 함수 작성 | `utility.md` |
| 패키지 설치, 의존성 관리 | `package-manager.md` |
| 코드 주석, 문서화 | `documentation.md` |
| 로깅 추가 | `logging.md` |
| 분석/이벤트 추적 | `analytics.md` |

### 주요 기능 구현 시 참고 가이드라인 조합

| 기능 | 참고 가이드라인 (우선순위순) | Figma 이미지 |
|------|---------------------------|-------------|
| **튜토리얼 페이지** | `screen-layout.md` → `navigation.md` → `animation-gesture.md` → `ui-component.md` | `1. tutorial/` 전체 |
| **OMR 답안 마킹 페이지** | `ui-component.md` → `form-handling.md` → `keyboard-handling.md` → `state-management.md` → `design-color.md` | `during-test-1.png` |
| **채점 결과 페이지** | `server-request.md` → `ui-component.md` → `list-rendering.md` → `design-color.md` → `animation-gesture.md` | `test-result-1.png` ~ `test-result-3.png` |
| **학생 정보 입력** | `form-handling.md` → `keyboard-handling.md` → `modal-dialog.md` → `security.md` | `during-test-1.png` (OMR 좌측 학생정보 영역) |
| **시험 타이머** | `state-management.md` → `ui-component.md` → `typography-i18n.md` → `design-color.md` | `tutorial-10.png`, `during-test-1.png` (하단 타이머 바) |
| **답안 제출 흐름** | `server-request.md` → `error-handling.md` → `modal-dialog.md` → `state-management.md` | `test-result-1.png` ~ `test-result-2.png` |

---

## 핵심 원칙

- **터치스크린 우선**: 최소 44px 터치 타겟, `active:` 피드백, hover 의존 금지
- **단순한 구조**: 3단계 흐름에 집중, 오버엔지니어링 금지
- **인증 없음**: 학생 정보는 폼 입력으로만 수집
- **Figma 기반**: `figma-image/` 디렉토리의 디자인 파일을 참고하여 구현
- **채점은 서버에서**: 클라이언트에 정답 데이터를 노출하지 않음

---

## Figma 디자인 레퍼런스

경로: `figma-image/`

**작업 규칙**: UI 관련 작업 시 반드시 해당 단계의 Figma 이미지를 `Read` 도구로 확인한 후 작업하세요.

### 공통 레이아웃 요소

- **튜토리얼 헤더**: 좌측 로고 아이콘, 중앙 "모의고사 모드" 타이틀, 우측 "신학철 학생 ▼" 드롭다운 + "홈으로" 버튼
- **시험 응시/결과 헤더**: 우상단 "종료하기 ↗" 버튼만 표시
- **배경**: 연한 회색 계열

### 1단계: 튜토리얼 (`1. tutorial/`)

총 10개 이미지이지만, 실제로는 **5개 스텝**으로 구성됩니다. 일부 이미지는 같은 스텝 내의 상태 변화를 나타냅니다.

#### 스텝 1: 시작 화면 (tutorial-1.png)

- 시험지 일러스트 + "모의고사 모드는 처음이시죠?" 안내 메시지
- 하단 버튼: "튜토리얼 건너뛰기"(회색) + "다음"(검정)

#### 스텝 2: OMR 개념 소개 (tutorial-2.png)

- 시험지+OMR카드 일러스트 + "실제 시험지에 문제를 풀고 화면에 표시된 OMR카드에 답을 마킹해요"
- 하단 버튼: "이전으로" + "튜토리얼 건너뛰기" + "다음" (이후 모든 스텝 동일)

#### 스텝 3: 객관식 마킹 인터랙티브 연습 (tutorial-3.png ~ tutorial-5.png)

하나의 인터랙티브 화면에서 사용자 동작에 따라 상태가 변합니다.

| 이미지 | 상태 | 설명 |
|--------|------|------|
| `tutorial-3.png` | 초기 상태 | 전체 OMR 버블 그리드 표시, "**15번** 문제에 **3번**으로 답안을 마킹해보세요" 안내, "다음" 버튼 비활성화(회색) |
| `tutorial-4.png` | 마킹 완료 후 | 15번 3번에 마킹(검정 채움), "마킹한 곳을 한 번 더 터치하면 지울 수 있어요" 안내, "다음" 버튼 비활성화 |
| `tutorial-5.png` | 해제 완료 후 | "2개 이상의 답안을 골라야 하는 문제에서는 두 답안 모두 마킹하면 돼요" 안내, "다음" 버튼 활성화(파란색) |

#### 스텝 4: 주관식 입력 인터랙티브 연습 (tutorial-6.png ~ tutorial-9.png)

좌측에 주관식 문항 리스트, 우측에 숫자 키패드가 배치된 인터랙티브 화면입니다.

| 이미지 | 상태 | 설명 |
|--------|------|------|
| `tutorial-6.png` | 초기 상태 | 주관식 11문항 리스트 + 숫자 키패드(√, /, -, 1~9, 0, ⌫), "**4번** 문제의 답안을 입력해볼까요?" 안내, "다음" 버튼 비활성화 |
| `tutorial-7.png` | 문항 선택 후 | 4번 문항 선택 상태(파란 테두리), 키패드 상단에 입력 필드 표시, "아무 숫자나 입력하고 **완료** 버튼을 눌러서 답안을 작성해요" |
| `tutorial-8.png` | 숫자 입력 후 | 입력값 표시, 키패드에 "완료" 버튼(파란색) 등장 |
| `tutorial-9.png` | 입력 완료 후 | 답안 저장됨, "입력한 답안을 수정하려면 해당 문제를 다시 한 번 터치해요" 안내, "다음" 버튼 활성화(파란색) |

#### 스텝 5: 시간 제한 경고 안내 (tutorial-10.png)

- **빨간색 경고 테마** (다른 스텝과 색상 톤이 다름)
- 타이머 바: "시험 종료까지 남은 시간 **5초**" + 시험 시간 60분 표시 + "문제가 생겼나요?" 버튼
- "시간이 모두 지나면 시험은 종료되고 OMR카드는 자동으로 제출돼요"
- 하단 버튼: "이전으로" + "시험 화면으로 이동"(검정) — "튜토리얼 건너뛰기" 대신 최종 진입 버튼으로 변경됨

### 2단계: 시험 응시 (`2. during-test/`)

#### 시험 응시 메인 화면 (during-test-1.png)

전체 OMR 카드와 숫자 키패드가 한 화면에 배치됩니다.

**OMR 카드 구성 (좌측~중앙)**:
- 좌측 상단: 시험 제목 ("TEN-UP 모의고사"), 학생정보 영역 (학교, 이름, 학년/반, 좌석번호) — 이미 입력된 상태로 표시
- 좌측 하단: 베이스 수학학원 로고 + "학생답안 입력용 OMR 카드" 안내 텍스트
- 중앙: **객관식 답안** 버블 그리드 (번호별 5지선다 버블)
- 우측: **주관식 답안** 입력 필드 리스트

**숫자 키패드 (우측)**:
- 키: √, /, -, 1~9, 0, ⌫
- 주관식 문항 선택 시 활성화

**하단 타이머 바**:
- "시험이 곧 시작됩니다..." + "**3분 17초** 뒤 시작" 카운트다운
- 시험 시간 표시 (60분)
- "문제가 생겼나요?" 버튼

**우상단**: "종료하기 ↗" 버튼

### 3단계: 채점 결과 (`3. test-result/`)

| 이미지 | 화면 | 설명 |
|--------|------|------|
| `test-result-1.png` | 제출 완료 | OMR 카드가 배경에 흐리게 표시, 중앙에 "제출 완료! 고생 많았어요. 결과를 바로 확인해볼까요?" + "결과 보기" 버튼(검정) |
| `test-result-2.png` | 스캔 애니메이션 | OMR 카드 위에 빨간색 스캔 라인이 위에서 아래로 이동하는 애니메이션, "OMR 카드 스캔중... 곧 결과가 나와요", 하단에 재미 요소 텍스트 |
| `test-result-3.png` | 결과 확인 | **자유 디자인** — 피그마에 "결과 확인 화면 (자유 디자인)"으로 표시됨. API 응답 데이터(점수, 정답/오답/미답 수, 문항별 결과)를 자유롭게 디자인 |

---

### 작업 시 Figma 이미지 참고 매핑

아래 매핑에 따라 작업 전 관련 이미지를 **반드시** `Read` 도구로 읽고 참고하세요.

| 작업 | 참고할 Figma 이미지 |
|------|-------------------|
| 튜토리얼 전체 흐름 | `1. tutorial/tutorial-1.png` ~ `tutorial-10.png` |
| 튜토리얼 시작/소개 화면 | `tutorial-1.png`, `tutorial-2.png` |
| 객관식 OMR 버블 마킹 UI | `tutorial-3.png` ~ `tutorial-5.png`, `during-test-1.png` |
| 주관식 답안 입력 UI / 숫자 키패드 | `tutorial-6.png` ~ `tutorial-9.png`, `during-test-1.png` |
| 타이머 / 시간 제한 UI | `tutorial-10.png`, `during-test-1.png` |
| 시험 응시 메인 화면 / OMR 카드 레이아웃 | `during-test-1.png` |
| 학생 정보 영역 | `during-test-1.png` (OMR 좌측 상단) |
| 답안 제출 후 흐름 | `test-result-1.png`, `test-result-2.png` |
| 채점 결과 화면 | `test-result-3.png` (자유 디자인) |
| 상단 헤더 / 네비게이션 바 | `tutorial-1.png` (튜토리얼용), `during-test-1.png` (시험용) |
| 버튼 스타일 참고 | `tutorial-1.png`(기본: 검정/회색), `tutorial-5.png`(활성: 파란색), `tutorial-10.png`(경고: 빨간색) |
