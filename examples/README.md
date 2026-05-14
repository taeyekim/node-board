# Examples

이 문서는 AI 에이전트에게 요청할 때 사용할 수 있는 예시와 검증 기록 예시를 담는다.

## 작업 요청 예시

```text
Express API에 게시글 목록 조회 기능을 추가하고 싶어.
먼저 관련 파일을 조사하고, 수정할 파일과 검증 방법을 제안해줘.
승인 전에는 파일을 수정하지 마.
```

## React 작업 요청 예시

```text
React 앱에 게시글 목록 화면을 추가하고 싶어.
Tailwind CSS로 단순하게 구성하고, API 연동 방식과 검증 방법을 먼저 제안해줘.
```

## 컨펌 요청 예시

```text
다음 파일을 수정하려고 합니다.

- apps/server/src/routes/posts.js
- apps/server/src/db.js
- state/FEATURES.md

리스크:
- PostgreSQL 접속 정보는 환경변수로만 관리해야 합니다.
- 스키마 변경은 기존 데이터에 영향을 줄 수 있습니다.
- API 응답 구조가 정해지면 이후 프론트엔드와 맞춰야 합니다.

이대로 진행해도 될까요?
```

## 검증 기록 예시

```text
Layer 1:
- apps/web npm run build: pass
- apps/server npm test: unavailable, 스크립트 없음

Layer 2:
- Express dev server 실행: pass
- GET /api/health: pass
- PostgreSQL 연결: pass
- Redis 연결: pass 또는 disabled 기록
- Swagger UI 접근: pass
- Nginx proxy 접근: pass
- React dev server 실행: pass

Layer 3:
- 게시글 작성 후 목록 반영: pass
- 게시글 수정: unverified
- 게시글 삭제: unverified
```

## 완료 보고 예시

```text
수정 파일:
- apps/web/src/pages/PostList.jsx
- apps/server/src/routes/posts.js
- state/FEATURES.md

변경 내용:
- 게시글 목록 API 추가
- React 목록 화면 추가
- 기능 상태를 implemented로 기록

검증:
- apps/web npm run build 실행 확인
- GET /api/posts 수동 확인
- 삭제 흐름은 아직 미검증
```
