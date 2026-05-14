# Progress

## Current Status

하네스 문서 초기화가 완료되었다.
Vite + React 프론트엔드와 Express + PostgreSQL 백엔드 MVP 코드가 생성되었다.
Redis optional cache, Swagger UI, Nginx reverse proxy 설정이 구현되었다.
배포 설정은 아직 생성하지 않았다.
데이터 저장 방향은 PostgreSQL로 변경되었고, 배포 방향은 Vercel + Render로 정리되었다.

## Active Work

PostgreSQL/Redis/Nginx 로컬 런타임 검증 대기.

## Completed

- 하네스 문서 15개 생성
- `AGENTS.md` 200줄 이하 조건 확인: 66줄
- `docs/`, `rules/`, `state/`, `examples/` 문서 구조 생성 확인
- 데이터 저장 방향을 JSON 파일에서 MySQL로 변경한 뒤 PostgreSQL로 다시 변경
- 배포 방향을 Vercel 프론트엔드 + Render 백엔드 중심으로 정리
- npm workspaces 구성
- `apps/server` Express API MVP 구현
- `apps/web` React + Tailwind MVP 구현
- 서버 유닛 테스트 통과
- 프론트 빌드 통과
- Redis optional cache 코드 추가
- Swagger UI와 OpenAPI JSON 추가
- Docker Compose 기반 Redis/Nginx 설정 추가
- Nginx reverse proxy 설정 추가
- OpenAPI document import 확인
- `swagger-ui-express` import 확인
- `docker compose config` 통과

## Pending

- PostgreSQL 로컬 DB 생성
- `apps/server/.env` 생성
- Express dev server 실행 확인
- `/api/health` DB 연결 확인
- Redis cache 연결 확인
- Swagger UI 접근 확인
- Nginx reverse proxy 접근 확인
- React dev server 실행 확인
- 게시글 CRUD 사용자 흐름 확인
- Vercel/Render 배포 방식 확정

## Blocked

- 실제 DB 접속 정보가 아직 없어 런타임 DB 검증을 진행하지 못함
- Docker Compose 기반 Redis/Nginx 런타임 검증은 아직 수행하지 않음
- `npm run infra:up`은 Docker daemon 미실행으로 실패함

## Last Session Notes

- 저장소 루트에는 `.git`만 확인됨
- `package.json`, README, Docker, `.env`, 테스트 설정 없음
- `main` 브랜치에 아직 커밋 없음
- Node.js `v24.14.0` 확인됨
- AWS EC2는 배포 후보에서 제외하기로 함
- PostgreSQL을 게시판 데이터 저장소로 사용하기로 함
- 빠른 배포를 위해 Vercel과 Render를 우선 사용하기로 함
- Node.js `v24.15.0`, npm `11.12.1`, PostgreSQL `18.3` 확인
- `npm test` pass
- `npm run build` pass
- Redis와 Swagger UI는 코드 구현됨, 런타임 검증 전
- Nginx/Docker Compose 설정은 생성됨, 런타임 검증 전
- `docker compose config` pass
- `npm run infra:up` failed: Docker daemon 미실행

## Next Suggested Step

Docker Desktop을 실행하고 로컬 PostgreSQL에 `board_app` DB와 개발 사용자를 만든 뒤 `apps/server/.env`를 설정해 Redis/Nginx 포함 런타임 검증을 진행한다.
