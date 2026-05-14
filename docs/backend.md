# Backend Guide

## 현재 상태

백엔드 MVP 코드가 `apps/server`에 있다.

## 목표 구조

백엔드는 별도 Express 프로젝트로 구성한다.

```text
apps/server/
```

## 기술 후보

- Node.js
- Express
- PostgreSQL
- Redis optional cache
- Swagger UI

## 현재 구조

```text
apps/server/
  .env.example
  package.json
  sql/schema.sql
  src/
    cache.js
    db.js
    index.js
    openapi.js
    posts.js
    schema.js
    validators.js
  test/
    validators.test.js
```

## API 목표

```text
GET    /api/health
GET    /api/openapi.json
GET    /api-docs
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
```

## Swagger UI

API 명세와 수동 테스트는 Swagger UI로 확인한다.

```text
http://localhost:3001/api-docs
http://localhost:3001/api/openapi.json
```

Nginx reverse proxy를 사용할 때는 다음 경로로 접근한다.

```text
http://localhost:8080/api-docs
```

## Redis Cache

Redis는 optional cache다. `REDIS_URL`이 없거나 Redis 연결에 실패해도 서버는 PostgreSQL만으로 동작해야 한다.

캐시 대상:

- `GET /api/posts`: 게시글 목록 캐시
- `GET /api/posts/:id`: 게시글 상세 캐시

캐시 무효화:

- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

## 데이터 저장

초기 학습 단계부터 PostgreSQL을 사용한다.
게시글 데이터는 PostgreSQL 테이블에 저장하고, Express API는 DB 연결 계층을 통해 데이터를 읽고 쓴다.

예상 테이블:

```sql
CREATE TABLE posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

장점:

- 실제 웹 서비스에 가까운 데이터 저장 흐름을 배울 수 있다.
- 로컬 개발과 배포 환경의 DB 연결 방식을 함께 연습할 수 있다.
- 이후 인증, 검색, 페이지네이션 같은 기능으로 확장하기 쉽다.

주의:

- 로컬 PostgreSQL 설치 또는 Render PostgreSQL 준비가 필요하다.
- DB 접속 정보는 `.env` 또는 배포 환경변수에만 둔다.
- 스키마 변경이나 마이그레이션은 사용자 승인 후 진행한다.

## 환경변수

예상 환경변수:

```text
PORT=3001
DATABASE_URL=postgresql://board_user:change_me@localhost:5432/board_app
DB_HOST=localhost
DB_PORT=5432
DB_USER=board_user
DB_PASSWORD=change_me
DB_NAME=board_app
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=30
```

`DATABASE_URL`과 개별 DB 환경변수 중 하나의 방식을 선택한다.
초기 구현에서는 초보자가 이해하기 쉬운 개별 DB 환경변수 방식을 우선 검토한다.

## 예상 명령

```bash
npm run dev:server
npm --workspace apps/server start
npm test
```

서버 실행 전 `apps/server/.env`를 생성하고 `DATABASE_URL`을 설정해야 한다.

## 검증 기준

- 서버 실행 확인
- `/api/health` 응답 확인
- 게시글 생성/조회/수정/삭제 API 확인
- 잘못된 입력에 대한 기본 오류 응답 확인
- PostgreSQL 연결 확인
- Redis 연결 확인 또는 disabled 상태 확인
- 게시글 CRUD 결과가 PostgreSQL 테이블에 반영되는지 확인
- Swagger UI에서 API 명세 확인

현재 확인:

- `npm test`: pass
- PostgreSQL 연결: 미검증
- dev server 실행: 미검증
- API CRUD 런타임 검증: 미검증
