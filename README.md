# Node.js Express Board Practice

Node.js, Express, React, Tailwind CSS로 간단한 게시판을 만들고 배포를 연습하는 저장소다.

현재는 MVP 구현 후 로컬 PostgreSQL 런타임 검증을 준비하는 단계다.

## 목표

- Node.js와 Express 기초 학습
- Vite + React 프론트엔드 구성
- Express REST API 구성
- PostgreSQL 기반 게시글 저장
- Redis 기반 optional cache 연습
- Swagger UI 기반 API 명세와 수동 테스트
- Nginx reverse proxy 로컬 인프라 연습
- Tailwind CSS 기반의 무난한 UI 구성
- Vercel과 Render를 사용한 빠른 배포 연습
- AI 에이전트가 세션을 이어받아도 맥락을 복구할 수 있는 문서 유지

## 예상 구조

```text
apps/
  web/
  server/
docs/
rules/
state/
examples/
AGENTS.md
README.md
```

## 현재 상태

- 앱 코드: `apps/web`, `apps/server`에 MVP 구현됨
- 패키지 설정: npm workspaces 구성됨
- 테스트 설정: 서버 입력 검증 유닛 테스트 있음
- 로컬 인프라 설정: Docker Compose 기반 Redis/Nginx 설정 있음
- 배포 설정: 없음
- npm 명령: 확인됨

자세한 진행 상태는 `state/PROGRESS.md`를 확인한다.

## 다음 예상 단계

1. 로컬 PostgreSQL DB와 사용자 생성
2. `apps/server/.env` 생성
3. Express dev server 실행 및 DB 연결 확인
4. Redis/Nginx Docker Compose 실행 확인
5. React dev server 또는 Nginx proxy에서 CRUD 흐름 확인
6. Swagger UI에서 API 수동 테스트
7. Vercel/Render 배포 문서화

## 주요 명령

```bash
npm run dev:server
npm run dev:web
npm test
npm run build
npm run infra:up
npm run infra:down
```
