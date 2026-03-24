# Package Manager & Dependency Guidelines

이 프로젝트는 **pnpm**을 공식 패키지 매니저로 사용하며, **pnpm workspace** 기반 모노레포로 구성되어 있습니다.

루트 `package.json`에 `"packageManager": "pnpm@10.30.3"`이 명시되어 있으므로, Corepack을 통해 팀 전체가 동일한 pnpm 버전을 사용합니다.

---

## 1. 패키지 매니저: pnpm

### 1.1 Core Principles

| Principle | Description |
|---|---|
| **Content-Addressable Storage** | 글로벌 스토어에 패키지를 한 번만 저장하고, 프로젝트마다 하드링크로 참조하여 디스크 공간을 절약 |
| **Strict by Default** | phantom dependency(선언하지 않은 패키지 접근)를 차단하여 의존성 안전성 보장 |
| **Single Lock File** | `pnpm-lock.yaml`이 의존성 버전의 유일한 진실 (Single Source of Truth) |
| **Deterministic Install** | 언제, 어디서, 누가 설치해도 동일한 결과 |
| **Minimal Dependencies** | 필요한 최소한의 의존성만 추가 |

### 1.2 pnpm vs npm vs yarn

| 항목 | pnpm | npm | yarn |
|---|---|---|---|
| 설치 속도 | 매우 빠름 (하드링크) | 보통 | 빠름 |
| 디스크 사용량 | 매우 적음 (글로벌 스토어 공유) | 많음 (프로젝트별 복사) | 보통 |
| phantom dependency | 차단 (strict) | 허용 (hoisting) | 허용 (hoisting) |
| 모노레포 지원 | 네이티브 (workspace) | workspaces | workspaces |
| Lock 파일 | `pnpm-lock.yaml` | `package-lock.json` | `yarn.lock` |

### 1.3 Corepack을 통한 버전 고정

```bash
# Corepack 활성화 (Node.js 16.9+ 내장)
corepack enable

# 프로젝트 디렉토리에서 pnpm 실행 시 자동으로 10.30.3 사용
pnpm install
```

`package.json`의 `"packageManager"` 필드가 Corepack에게 정확한 pnpm 버전을 알려줍니다. 별도로 pnpm을 전역 설치할 필요가 없습니다.

---

## 2. 모노레포 구조

### 2.1 디렉토리 레이아웃

```
unboxers-assignment-mock-exam/          # 루트 (workspace root)
├── package.json                        # packageManager, 루트 스크립트
├── pnpm-workspace.yaml                 # workspace 패키지 선언
├── pnpm-lock.yaml                      # 단일 lock 파일 (모든 패키지 통합)
├── apps/
│   ├── web/                            # 프론트엔드: React + Vite
│   │   └── package.json
│   └── server/                         # 백엔드: Fastify + Prisma
│       └── package.json
```

### 2.2 pnpm-workspace.yaml

```yaml
packages:
  - apps/*
```

`apps/` 하위의 모든 디렉토리가 workspace 패키지로 인식됩니다. 각 패키지는 독립적인 `package.json`을 가지며, 의존성은 개별적으로 관리됩니다.

### 2.3 루트 package.json의 역할

```json
{
  "name": "unboxers-assignment-mock-exam",
  "private": true,
  "packageManager": "pnpm@10.30.3",
  "scripts": {
    "dev": "pnpm --filter server dev",
    "db:generate": "pnpm --filter server db:generate",
    "db:push": "pnpm --filter server db:push",
    "db:seed": "pnpm --filter server db:seed"
  }
}
```

- `private: true`: npm 레지스트리 배포 방지 (workspace root 필수)
- `packageManager`: Corepack용 pnpm 버전 고정
- `--filter <패키지명>`: 특정 workspace 패키지의 스크립트를 루트에서 실행

### 2.4 Lock 파일 관리

pnpm workspace에서는 **루트에 단일 `pnpm-lock.yaml`**만 존재합니다.

- 모든 workspace 패키지의 의존성 정보가 하나의 lock 파일에 통합
- 개별 패키지 디렉토리에 별도의 lock 파일이 생기면 안 됨
- `pnpm-lock.yaml`은 반드시 git에 커밋

---

## 3. 의존성 관리

### 3.1 dependencies vs devDependencies

| Type | 용도 | Production 포함 | 예시 |
|---|---|---|---|
| `dependencies` | 런타임에 필요한 패키지 | Yes | react, fastify, zod |
| `devDependencies` | 개발/빌드 시에만 필요 | No | typescript, @types/*, prisma |

### 3.2 Semantic Versioning (SemVer)

```
MAJOR.MINOR.PATCH
  |     |     +-- 버그 수정 (하위 호환)
  |     +-------- 기능 추가 (하위 호환)
  +-------------- Breaking Changes (호환성 깨짐)
```

| Specifier | Example | Matches | Use Case |
|---|---|---|---|
| Exact | `"1.2.3"` | 1.2.3 only | 핵심 프레임워크 (react, vite) |
| Caret `^` | `"^1.2.3"` | 1.x.x (>=1.2.3) | 일반 라이브러리 |
| Tilde `~` | `"~1.2.3"` | 1.2.x (>=1.2.3) | 보수적 업데이트 |

### 3.3 패키지 추가 전 체크리스트

새 패키지를 추가하기 전에 반드시 검토:

- 직접 구현하는 것보다 패키지가 나은가?
- 이미 설치된 패키지로 해결 가능하지 않은가?
- 번들 사이즈 증가 대비 가치가 있는가?
- npm 주간 다운로드 수가 충분한가? (최소 10,000+)
- 최근 6개월 내 업데이트가 있는가?
- TypeScript 지원이 되는가?
- 라이선스가 적합한가? (MIT, Apache 2.0 권장)

### 3.4 루트 의존성 vs 패키지 의존성

| 위치 | 용도 | 예시 |
|---|---|---|
| 루트 `package.json` | 모든 패키지가 공통으로 사용하는 개발 도구 | prettier, lint-staged |
| `apps/web/package.json` | 프론트엔드 전용 의존성 | react, vite |
| `apps/server/package.json` | 백엔드 전용 의존성 | fastify, @prisma/client |

> **원칙:** 의존성은 실제로 사용하는 패키지의 `package.json`에 선언합니다. "편의상 루트에 몰아넣기"는 안티패턴입니다.

---

## 4. 유용한 명령어

### 4.1 의존성 설치

```bash
# 모든 workspace 패키지의 의존성 설치 (루트에서 실행)
pnpm install

# 특정 패키지에 의존성 추가
pnpm --filter web add react
pnpm --filter web add -D @types/react

# 루트에 개발 의존성 추가 (공통 도구)
pnpm add -Dw prettier

# 특정 버전 설치
pnpm --filter server add zod@3.24.2

# Exact 버전으로 설치 (caret/tilde 없이)
pnpm --filter web add --save-exact react@19.0.0
```

### 4.2 스크립트 실행

```bash
# 특정 패키지의 스크립트 실행
pnpm --filter web dev
pnpm --filter server build

# 모든 workspace 패키지에서 동일 스크립트 실행
pnpm -r run build

# 루트에 정의된 스크립트 실행
pnpm dev              # = pnpm --filter server dev (루트 scripts에 정의됨)
pnpm db:generate      # = pnpm --filter server db:generate
```

### 4.3 의존성 확인 및 관리

```bash
# 업데이트 가능한 패키지 확인
pnpm outdated

# 특정 패키지의 업데이트 가능 여부
pnpm --filter web outdated

# 의존성 트리 확인
pnpm ls
pnpm --filter server ls

# 특정 패키지가 어디서 사용되는지 확인
pnpm why <package-name>

# 패키지 제거
pnpm --filter web remove <package-name>

# 보안 취약점 확인
pnpm audit
pnpm audit --prod     # production 의존성만
```

### 4.4 캐시 및 초기화

```bash
# pnpm 스토어 정리 (참조되지 않는 패키지 제거)
pnpm store prune

# node_modules 재설치 (문제 발생 시)
rm -rf node_modules apps/*/node_modules
pnpm install

# 전체 캐시 클리어 + 재설치
rm -rf node_modules apps/*/node_modules
pnpm store prune
pnpm install
```

### 4.5 --filter 패턴 정리

| 패턴 | 설명 |
|---|---|
| `--filter web` | `name`이 `web`인 패키지 |
| `--filter server` | `name`이 `server`인 패키지 |
| `--filter ./apps/web` | 경로 기반 필터 |
| `--filter web...` | `web` 패키지와 그 의존 패키지 모두 |
| `-r` (recursive) | 모든 workspace 패키지 |

> **참고:** `--filter`의 값은 `package.json`의 `name` 필드와 매칭됩니다. 이 프로젝트에서는 `unboxers-assignment-mock-exam-server` 같은 전체 이름 또는 고유한 부분 문자열을 사용할 수 있습니다.

---

## 5. Anti-Patterns

### 5.1 절대 하지 말 것

| Anti-Pattern | 문제 | 올바른 방법 |
|---|---|---|
| `npm install` 사용 | `package-lock.json` 생성, lock 파일 충돌 | `pnpm install` 사용 |
| `yarn add` 사용 | `yarn.lock` 생성, 패키지 매니저 혼용 | `pnpm add` 사용 |
| 루트에서 `pnpm add <pkg>` (-w 없이) | 에러 발생 (workspace root 보호) | `pnpm add -Dw <pkg>` 또는 `--filter` 사용 |
| 의존성을 루트에 몰아넣기 | phantom dependency, 패키지 간 경계 모호 | 사용하는 패키지의 `package.json`에 선언 |
| `pnpm-lock.yaml` gitignore | 설치 비결정성, "내 컴퓨터에서는 되는데?" | 반드시 git에 커밋 |
| `node_modules/` 직접 수정 | 다음 install에서 덮어씌워짐 | `package.json` 또는 `.pnpmfile.cjs`로 해결 |
| `sudo pnpm install` | 권한 문제 전파 | fnm/nvm으로 Node 관리, sudo 불필요 |
| 전역 설치 남용 (`pnpm add -g`) | 프로젝트 재현성 저하 | `pnpm dlx`로 일회성 실행, 또는 devDependencies에 추가 |

### 5.2 Lock 파일 충돌 해결

```bash
# pnpm-lock.yaml 충돌 시: 한쪽을 선택한 후 재생성
git checkout --theirs pnpm-lock.yaml   # 또는 --ours
pnpm install

# 위 방법으로 해결 안 되면: lock 파일 삭제 후 재생성
rm pnpm-lock.yaml
pnpm install
```

> **주의:** lock 파일을 삭제하고 재생성하면 모든 의존성이 최신 허용 범위 내 버전으로 갱신됩니다. 재생성 후 반드시 빌드 및 테스트를 수행하세요.

### 5.3 Peer Dependency 충돌

```bash
# 충돌 원인 확인
pnpm why <conflicting-package>

# 해결 방법 1: 호환 버전으로 맞추기 (권장)
pnpm --filter web add <package>@<compatible-version>

# 해결 방법 2: package.json의 pnpm.overrides 사용
```

```json
{
  "pnpm": {
    "overrides": {
      "some-package": "^2.0.0"
    }
  }
}
```

---

## 6. Quick Reference

### PR 체크리스트

- `pnpm-lock.yaml`이 함께 커밋되었는가?
- `package-lock.json`이나 `yarn.lock`이 실수로 포함되지 않았는가?
- 새 패키지가 올바른 workspace 패키지의 `package.json`에 추가되었는가?
- dependencies / devDependencies 구분이 맞는가?
- 불필요한 패키지가 포함되지 않았는가?
- `pnpm audit --prod`에서 High/Critical 취약점이 없는가?
- 패키지 추가 사유가 PR 설명에 포함되었는가?

### Command Cheat Sheet

```bash
# --- 설치 ---
pnpm install                        # 전체 의존성 설치
pnpm --filter web add <pkg>         # web 패키지에 의존성 추가
pnpm --filter web add -D <pkg>      # web 패키지에 개발 의존성 추가
pnpm --filter server add <pkg>      # server 패키지에 의존성 추가
pnpm add -Dw <pkg>                  # 루트에 개발 의존성 추가

# --- 실행 ---
pnpm --filter web dev               # web 개발 서버
pnpm --filter server dev            # server 개발 서버
pnpm -r run build                   # 모든 패키지 빌드

# --- 확인 ---
pnpm outdated                       # 업데이트 가능 패키지
pnpm --filter web ls                # web 의존성 트리
pnpm why <pkg>                      # 패키지 사용처 추적
pnpm audit --prod                   # 보안 점검 (prod만)

# --- 정리 ---
pnpm --filter web remove <pkg>      # 패키지 제거
pnpm store prune                    # 글로벌 스토어 정리
pnpm dlx <pkg>                      # 일회성 CLI 도구 실행

# --- 트러블슈팅 ---
rm -rf node_modules apps/*/node_modules && pnpm install  # 클린 재설치
```

### npm 명령어 -> pnpm 매핑

| npm | pnpm | 비고 |
|---|---|---|
| `npm install` | `pnpm install` | |
| `npm ci` | `pnpm install --frozen-lockfile` | CI/CD 환경에서 사용 |
| `npm install <pkg>` | `pnpm add <pkg>` | |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` | |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` | |
| `npm run <script>` | `pnpm <script>` 또는 `pnpm run <script>` | `run` 생략 가능 |
| `npm ls` | `pnpm ls` | |
| `npm outdated` | `pnpm outdated` | |
| `npm audit` | `pnpm audit` | |
| `npx <cmd>` | `pnpm dlx <cmd>` | 일회성 실행 |
| `npm cache clean --force` | `pnpm store prune` | |
