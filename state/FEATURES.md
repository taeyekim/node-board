# Features

## 2026-05-15 Final Update

- Post category is now stored in PostgreSQL through Prisma.
- Post view count is now stored in PostgreSQL and increments on detail reads.
- Comments are now stored in PostgreSQL and connected to posts and users.
- Post list API now supports server-side search, category filtering, sorting, and pagination.
- React board UI now uses real category, view count, comment count, and pagination values from the API.
- React detail view now supports comment display, authenticated comment creation, and comment deletion.
- Browser E2E smoke test now covers register, create, detail view, comment, update, search, and delete.
- Redis and Nginx Docker Compose runtime were verified successfully.
- Render deployment blueprint and Vercel frontend env example were added.
- GitHub Actions CI workflow was added.

## Current Feature Status

- JWT auth: passing
- Protected post create/update/delete: passing
- Public post list/detail: passing
- Category: passing
- View count: passing
- Comments/comment count: passing
- Search/sort/pagination API: passing
- Frontend API integration: passing
- Redis local runtime: passing
- Nginx local reverse proxy: passing
- Vercel/Render deployment: prepared, not deployed
- CI: configured, remote run pending after push

## 2026-05-15 Update

- PostgreSQL schema is now managed by Prisma Migrate.
- Local migration `20260514085950_init` created the `posts` table.
- Local migration `20260515002744_add_auth_users` created users and connected posts to authors.
- User confirmed backend, frontend, and CRUD flow worked after migration.
- React UI was redesigned with Tailwind CSS application UI patterns.
- `npm run build`: pass after UI redesign.
- React UI was redesigned again as a Korean community-style board.
- Frontend runtime endpoint `http://localhost:5173` returned HTTP 200.
- Backend health endpoint returned `database: ok`.
- JWT register/login/me API implemented.
- Post create/update/delete now require JWT authentication.
- Frontend login/register/logout flow implemented.
- Auth runtime smoke tests passed on temporary port `3301`.

## 2026-05-14 Update

- PostgreSQL schema management changed from manual SQL to Prisma Migrate.
- Express API code now uses Prisma Client for post CRUD.
- Runtime database verification was completed locally by the user after migration.

기능 상태는 코드 작성 여부가 아니라 검증 결과를 기준으로 기록한다.

## Status Legend

- `pending`: 아직 시작하지 않음
- `implemented`: 구현됨, 검증 전
- `passing`: 검증 통과
- `failed`: 검증 실패
- `unverified`: 검증하지 못함
- `deferred`: 보류

## Feature List

### Harness Documentation

Behavior:
AI 에이전트가 작업 규칙, 상태, 검증 루틴을 저장소 문서로 확인할 수 있다.

Verification:
- `AGENTS.md`가 200줄 이하인지 확인
- `docs/`, `rules/`, `state/`, `examples/` 문서가 존재하는지 확인
- 세션 시작/종료 루틴이 문서화되어 있는지 확인

State:
passing

### React Frontend

Behavior:
사용자는 React 화면에서 게시글 목록, 상세, 작성, 수정, 삭제 흐름을 사용할 수 있다.

Verification:
- `apps/web` 빌드 통과
- 주요 화면 렌더링 확인
- Express API 연동 확인
- `npm run build`: pass
- 주요 화면 렌더링: 미검증
- Express API 연동: 미검증

State:
implemented

### Express API

Behavior:
React 프론트엔드가 게시글 CRUD API를 호출할 수 있다.

Verification:
- 서버 실행 확인
- `/api/health` 확인
- 게시글 CRUD API 확인
- 입력 검증 유닛 테스트: pass
- 서버 실행: 미검증
- `/api/health`: 미검증
- 게시글 CRUD API: 미검증

State:
implemented

### PostgreSQL Database

Behavior:
게시글 데이터가 PostgreSQL 테이블에 저장되고 서버 재시작 후에도 유지된다.

Verification:
- PostgreSQL 연결 확인
- 게시글 작성 후 PostgreSQL 테이블 반영 확인
- 서버 재시작 후 데이터 유지 확인

State:
pending

### Redis Cache

Behavior:
게시글 목록과 상세 조회는 Redis 캐시를 사용할 수 있고, 게시글 생성/수정/삭제 시 관련 캐시가 무효화된다. Redis가 없어도 PostgreSQL CRUD는 계속 동작한다.

Verification:
- Redis 없이 서버 시작 가능 확인
- Redis 실행 상태에서 `GET /api/posts` cache miss/hit 확인
- POST/PUT/DELETE 후 캐시 무효화 확인
- Redis 패키지 설치: pass
- Redis 런타임 검증: 미검증

State:
implemented

### Swagger API Docs

Behavior:
사용자는 Swagger UI에서 API 명세를 확인하고 게시글 API를 직접 테스트할 수 있다.

Verification:
- `/api/openapi.json` 응답 확인
- `/api-docs` 화면 접근 확인
- Swagger UI에서 CRUD 요청 확인
- OpenAPI document import: pass
- `swagger-ui-express` import: pass
- `/api-docs` 런타임 접근: 미검증

State:
implemented

### Nginx Reverse Proxy

Behavior:
Nginx가 React build 정적 파일을 서빙하고 `/api`, `/api-docs` 요청을 Express 서버로 프록시한다.

Verification:
- `npm run build` 후 `npm run infra:up` 실행
- `http://localhost:8080` 접근 확인
- `http://localhost:8080/api/health` 프록시 확인
- `http://localhost:8080/api-docs` 접근 확인
- `docker compose config`: pass
- `npm run infra:up`: failed, Docker daemon 미실행

State:
implemented

### Tailwind Frontend

Behavior:
Tailwind CSS 기반의 무난한 게시판 UI를 제공한다.

Verification:
- 주요 화면 스타일 확인
- 모바일/데스크톱 레이아웃 확인
- 무료 공식 문서/예시 기준 사용 여부 확인
- `@tailwindcss/vite` 기반 빌드: pass
- 브라우저 스타일 확인: 미검증

State:
implemented

### Deployment Practice

Behavior:
React 프론트엔드는 Vercel에, Express API는 Render에 배포한다.

Verification:
- Vercel 프론트엔드 배포 URL 확인
- Render 백엔드 배포 URL 확인
- 배포 백엔드와 Render PostgreSQL 연결 확인
- 배포 환경에서 Redis 사용 여부 결정
- 배포 환경에서 CRUD 흐름 확인

State:
pending
