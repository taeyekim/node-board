# Testing Guide

## 2026-05-15 Verified Commands

GitHub Actions CI was added at `.github/workflows/ci.yml`.

CI runs on:

- pull requests
- pushes to `main`

CI checks:

- `npm ci`
- `npm --workspace apps/server exec prisma validate`
- `npm --workspace apps/server run prisma:generate`
- `npm --workspace apps/server run prisma:deploy`
- `npm test`
- `npm run build`

The CI job starts a PostgreSQL service container and sets `DATABASE_URL` for Prisma validation and migration checks.

Current verification commands:

```bash
npm test
npm run build
npm --workspace apps/server exec prisma migrate status
npm run test:e2e
docker compose config
npm run infra:up
npm run infra:down
```

Current results:

- `npm test`: pass
- `npm run build`: pass
- `prisma migrate status`: database schema is up to date
- `npm run test:e2e`: pass
- `docker compose config`: pass, with Docker config access warnings in the non-escalated shell
- Redis/Nginx runtime: pass after Docker API permission
- Nginx static root, `/api/health`, and `/api/openapi.json`: pass

`npm run test:e2e` starts the Express server and Vite dev server, runs a Chromium flow for register/create/detail/comment/update/search/delete, then cleans up the spawned processes.

## Prisma Verification

When the backend schema changes, verify Prisma before runtime testing.

```bash
npm --workspace apps/server exec prisma -- validate
npm --workspace apps/server run prisma:generate
npm --workspace apps/server run prisma:migrate -- --name init
```

`prisma migrate dev` changes the local database schema, so run it only after the target `DATABASE_URL` is confirmed.

## 현재 상태

서버 유닛 테스트와 프론트 빌드 검증 명령이 있다.

## 완료 판정

기능 완료는 코드 작성이 아니라 검증 통과를 기준으로 한다.

## Layer 1: 정적 검증

예상 검증:

```bash
npm run build
npm test
```

현재 확인:

- `npm test`: pass
- `npm run build`: pass
- `docker compose config`: pass
- `npm run infra:up`: failed, Docker daemon 미실행
- OpenAPI document import: pass
- `swagger-ui-express` import: pass
- lint: 스크립트 없음
- typecheck: 스크립트 없음

## Layer 2: 런타임 검증

예상 검증:

- Express dev server 실행
- `/api/health` 확인
- React dev server 실행
- React에서 API 호출 확인
- PostgreSQL 연결 확인
- Redis 연결 또는 disabled 상태 확인
- 게시글 CRUD 결과가 PostgreSQL에 반영되는지 확인
- Swagger UI 접근 확인
- Nginx reverse proxy 접근 확인

## Layer 3: 사용자 흐름 검증

예상 검증:

- 게시글 목록 접근
- 게시글 작성
- 작성한 게시글 상세 확인
- 게시글 수정
- 게시글 삭제
- 삭제 후 목록 반영 확인
- 서버 재시작 후 PostgreSQL 데이터 유지 확인
- Redis 캐시 hit/miss 확인
- Swagger UI에서 CRUD 요청 확인
- `http://localhost:8080`에서 Nginx proxy 흐름 확인

자동 E2E가 없으면 수동 검증 결과를 기록한다.

현재 Layer 2와 Layer 3는 PostgreSQL DB 생성, `.env` 설정, Docker Compose 실행 전이라 미검증이다.

## 기록 원칙

검증 결과는 `state/FEATURES.md`와 `state/PROGRESS.md`에 반영한다.

검증하지 못한 항목은 다음처럼 쓴다.

```text
State: unverified
Reason: 아직 테스트 스크립트가 없음
```
