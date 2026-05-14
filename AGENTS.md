# AGENTS.md

이 문서는 AI 에이전트가 이 저장소에서 작업할 때 가장 먼저 읽는 라우터 문서다.
자세한 규칙은 `docs/`, `rules/`, `state/` 문서를 따른다.

## 핵심 원칙

- Repository is the spec: 저장소 안의 문서와 코드가 현재 기준이다.
- WIP는 1이다. 한 번에 하나의 작업만 진행한다.
- 코드 작성 완료는 기능 완료가 아니다.
- 기능 상태는 검증 조건을 통과했을 때만 `passing`으로 바꾼다.
- 사용자 승인 없이 파일 생성, 수정, 삭제, 패키지 설치, 의존성 변경, DB 변경, 배포 설정 변경을 하지 않는다.
- 모르면 추측하지 말고 모른다고 말한다.
- 확인하지 않은 실행 결과를 확인한 것처럼 말하지 않는다.

## 세션 시작 루틴

1. `AGENTS.md`를 읽는다.
2. `state/PROGRESS.md`를 읽는다.
3. `state/DECISIONS.md`를 읽는다.
4. 현재 active 작업이 있는지 확인한다.

active 작업이 있으면 새 작업을 시작하지 말고 기존 작업 상태와 다음 검증 조건을 먼저 확인한다.

## 작업 시작 전

1. 요구사항을 요약한다.
2. 관련 파일을 조사한다.
3. 수정 범위와 리스크를 설명한다.
4. 사용자 컨펌을 받는다.

컨펌 전에는 실제 파일 변경을 하지 않는다.

## 작업 중

- 승인된 범위 안에서만 작업한다.
- 발견한 별도 문제는 즉시 수정하지 말고 기록한다.
- 검증 전 리팩토링을 하지 않는다.
- 임시 코드, 디버그 로그, 테스트 우회 코드를 남기지 않는다.

## 완료 판정

- Layer 1: lint, typecheck, build 같은 정적 검증
- Layer 2: dev server, API health check 같은 런타임 검증
- Layer 3: 실제 사용자 흐름 기반 E2E 또는 수동 검증

검증하지 못한 항목은 `미검증`으로 남긴다.

## Clean Exit Checklist

- Build passes
- Tests pass or unavailable reason recorded
- Feature list updated
- Progress updated
- Decisions updated if needed
- No debug artifacts
- Startup path documented or verified

## 문서 라우터

- 프론트엔드: `docs/frontend.md`
- 백엔드: `docs/backend.md`
- 인프라/배포: `docs/infra.md`
- 검증 루틴: `docs/testing.md`
- MCP/외부 도구: `docs/mcp.md`
- 보안 규칙: `rules/security.md`
- 코드 스타일: `rules/style.md`
- 작업 흐름: `rules/workflow.md`
- 진행 상태: `state/PROGRESS.md`
- 의사결정: `state/DECISIONS.md`
- 기능 상태: `state/FEATURES.md`
- 품질 상태: `state/QUALITY.md`
