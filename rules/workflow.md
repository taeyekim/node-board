# Workflow Rules

## WIP 제한

WIP는 1이다.
한 번에 하나의 active 작업만 둔다.

## 작업 상태

- `pending`: 아직 시작하지 않음
- `active`: 현재 진행 중
- `blocked`: 외부 결정 또는 오류로 막힘
- `implemented`: 코드 작성 완료, 검증 전
- `passing`: 검증 통과
- `failed`: 검증 실패
- `deferred`: 보류

## 작업 시작 절차

1. 요구사항 요약
2. 관련 파일 조사
3. 수정 범위 설명
4. 리스크 설명
5. 사용자 컨펌

컨펌 전에는 파일을 생성, 수정, 삭제하지 않는다.

## 작업 중 절차

- 승인된 범위 밖으로 나가지 않는다.
- 별도 문제를 발견하면 즉시 수정하지 않고 기록한다.
- 새로운 의사결정이 필요하면 `state/DECISIONS.md`에 기록한다.
- 기능 상태는 `state/FEATURES.md`에 기록한다.

## 작업 종료 절차

Clean Exit Checklist:

- Build passes
- Tests pass or unavailable reason recorded
- Feature list updated
- Progress updated
- Decisions updated if needed
- No debug artifacts
- Startup path documented or verified
