# Infrastructure Guide

## 2026-05-15 Runtime Verification

Docker Compose Redis/Nginx runtime has been verified.

Verified commands and checks:

```bash
npm run build
docker compose config
npm run infra:up
```

Runtime checks:

```text
http://localhost:8080 -> 200
http://localhost:8080/api/health -> status=ok, database=ok, cache=ok
http://localhost:8080/api/openapi.json -> 200
```

After verification, containers were stopped with:

```bash
npm run infra:down
```

Note:
The non-escalated shell showed Docker config/API permission warnings. Running Docker commands with Docker API permission succeeded.

## 2026-05-15 Deployment Preparation

Render backend preparation:

- `render.yaml` added at the repository root.
- `apps/server` has `npm run prisma:deploy` for production migration deploy.
- Render start command runs migrations before `npm start`.

Required Render environment variables:

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
REDIS_URL
CACHE_TTL_SECONDS
```

Vercel frontend preparation:

- `apps/web/.env.example` added.
- Set `VITE_API_BASE_URL` to the Render backend URL.

## 현재 상태

로컬 인프라 연습용 Docker Compose 설정이 있다.

현재 있음:

- `docker-compose.yml`
- `nginx/default.conf`
- `apps/server/.env.example`

현재 없음:

- `.env`
- Dockerfile
- CI 설정
- 배포 설정

## 배포 방향

AWS EC2는 사용하지 않는다.

초기 배포 조합:

- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

로컬 인프라 연습:

- Redis: Docker Compose
- Nginx reverse proxy: Docker Compose

Railway와 AWS는 현재 초기 구현 범위에서 제외한다.

## Vercel

Vite + React 정적 프론트엔드 배포 후보로 사용한다.

예상 설정:

- Root Directory: `apps/web`
- Build Command: `npm run build`
- Output Directory: `dist`

## Render

Express API 배포 후보로 사용한다.

예상 설정:

- Root Directory: `apps/server`
- Build Command: `npm install`
- Start Command: `npm start`

## PostgreSQL

초기 개발은 로컬 PostgreSQL을 사용한다.
배포 단계에서는 Render PostgreSQL을 사용한다.

Render는 관리형 PostgreSQL을 제공하므로 Express 백엔드와 연결하기 쉽다.
초기 배포에서는 Render PostgreSQL의 `DATABASE_URL`을 백엔드 환경변수로 연결한다.

## Redis

Redis는 로컬 Docker Compose로 실행한다.
서버는 `REDIS_URL`이 설정되어 있으면 Redis 캐시를 사용하고, 연결 실패 시 PostgreSQL만으로 계속 동작한다.

```text
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=30
```

## Nginx

Nginx는 로컬 reverse proxy 연습용이다.

```text
http://localhost:8080/
  /              -> React build 정적 파일
  /api/          -> Express API
  /api-docs/     -> Swagger UI
```

프론트 정적 파일을 Nginx로 보기 전에 먼저 빌드한다.

```bash
npm run build
npm run infra:up
```

## 로컬 PostgreSQL 설치

Windows에서는 PostgreSQL 공식 다운로드 페이지에서 안내하는 EDB Interactive Installer를 우선한다.
공식 문서 기준으로 이 Installer에는 PostgreSQL Server, pgAdmin, StackBuilder가 포함된다.

설치 후 확인 명령:

```powershell
psql --version
```

초기 개발 DB 예시:

```sql
CREATE DATABASE board_app;
CREATE USER board_user WITH PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE board_app TO board_user;
```

실제 비밀번호는 저장소에 기록하지 않는다.
위 SQL은 개발용 예시이며, 실행 전 사용자 승인을 받아야 한다.

백엔드 배포 환경변수 예시:

```text
PORT=10000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CACHE_TTL_SECONDS=30
CORS_ORIGIN=https://vercel-frontend-url.example.com
```

## 환경변수 원칙

- 민감정보는 저장소에 커밋하지 않는다.
- 필요한 환경변수는 `.env.example`에 이름과 설명만 기록한다.
- 실제 값은 로컬 `.env` 또는 배포 플랫폼 환경변수에 둔다.
- `.env` 생성 또는 변경은 사용자 승인 후 진행한다.

## GitHub Repository

GitHub 저장소를 만들기 전 확인할 항목:

- repository name
- public/private 여부
- 원격 저장소 URL
- 초기 커밋 범위

민감정보가 들어가는 `.env`는 커밋하지 않는다.
현재 `.gitignore`는 `.env`와 `.env.*`를 제외하고 `.env.example`만 허용한다.

## 로컬 실행

서버 실행 전 `apps/server/.env`가 필요하다.

예시:

```text
DATABASE_URL=postgresql://board_user:your_password@localhost:5432/board_app
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=30
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
PORT=3001
```

실행 명령:

```bash
npm run dev:server
npm run dev:web
npm run infra:up
```

현재 런타임 검증은 아직 수행하지 않았다.
`docker compose config`는 통과했지만, `npm run infra:up`은 Docker daemon 미실행으로 실패했다.
