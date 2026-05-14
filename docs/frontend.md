# Frontend Guide

## 현재 상태

프론트엔드 MVP 코드가 `apps/web`에 있다.

## 목표 구조

프론트엔드는 별도 React 프로젝트로 구성한다.

```text
apps/web/
```

## 기술 후보

- Vite
- React
- Tailwind CSS

## Vite 설명

Vite는 React 같은 프론트엔드 앱을 빠르게 개발하고 빌드하기 위한 도구다.

역할:

- 개발 서버 실행
- 파일 저장 시 빠른 화면 갱신
- 배포용 정적 파일 빌드
- React 템플릿 기반 프로젝트 생성 지원

예상 명령:

```bash
npm create vite@latest apps/web -- --template react
npm run dev
npm run build
npm run preview
```

현재 npm 명령은 확인되었다.

## 현재 구조

```text
apps/web/
  index.html
  package.json
  vite.config.js
  src/
    App.jsx
    api.js
    index.css
    main.jsx
```

## 화면 목표

- 게시글 목록
- 게시글 상세
- 게시글 작성
- 게시글 수정
- 삭제 확인 흐름

## API 연동

React 앱은 Express API와 통신한다.

예상 API:

```text
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id
```

## Tailwind CSS

Tailwind CSS는 무료 공식 문서와 예시를 기준으로 사용한다.
Tailwind UI 같은 유료 컴포넌트는 사용자 승인 없이 사용하지 않는다.

현재 구성은 `@tailwindcss/vite` 플러그인과 `@import "tailwindcss";` 방식을 사용한다.

## 주요 명령

```bash
npm run dev:web
npm run build
```

## 검증 기준

- `npm run build` 통과
- 주요 화면 렌더링 확인
- API 호출 성공 확인
- 모바일/데스크톱 기본 레이아웃 확인
- 게시글 CRUD 사용자 흐름 확인

현재 확인:

- `npm run build`: pass
- dev server 렌더링: 미검증
- API 연동 사용자 흐름: 미검증

## 배포 방향

프론트엔드는 Vercel에 배포한다.

예상 설정:

```text
Root Directory: apps/web
Build Command: npm run build
Output Directory: dist
```

배포 환경에서는 백엔드 API 주소를 환경변수로 주입한다.

```text
VITE_API_BASE_URL=https://render-backend-url.example.com
```
