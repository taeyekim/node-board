# Decisions

이 문서는 중요한 결정과 이유를 기록한다.

## 2026-05-11

### Decision: Repository is the spec 문서 구조를 먼저 만든다

Reason:
기능 구현 전에 실행 방법, 작업 규칙, 상태 관리, 검증 루틴을 저장소에 남겨 새 세션에서도 맥락을 복구할 수 있게 하기 위함이다.

Status:
승인됨. 하네스 문서 생성 완료.

### Decision: WIP는 1로 제한한다

Reason:
작업 범위를 작게 유지하고 승인된 범위 밖으로 확장하지 않기 위함이다.

Status:
승인됨.

### Decision: 프론트엔드는 Vite + React로 별도 구성한다

Reason:
React 학습과 Express API 학습을 분리할 수 있고, Vite는 빠른 개발 서버와 단순한 빌드 흐름을 제공한다.

Status:
승인됨.

### Decision: 백엔드는 Express REST API로 구성한다

Reason:
React 프론트엔드와 API 서버의 역할을 분리해 학습하기 위함이다.

Status:
승인됨.

### Decision: 초기 데이터 저장은 JSON 파일을 사용한다

Reason:
DB 없이도 데이터 영속성을 연습할 수 있고, 초보자에게 메모리 저장보다 학습 가치가 있다.

Status:
Superseded. MySQL을 사용하기로 방향을 변경했다.

### Decision: 초기 데이터 저장은 MySQL을 사용한다

Reason:
실제 웹 서비스에 가까운 DB 연결, 테이블 설계, CRUD 흐름을 학습하기 위함이다.

Status:
Superseded. Render 배포 편의성과 신생 프로젝트 선호도를 고려해 PostgreSQL로 변경했다.

### Decision: 초기 데이터 저장은 PostgreSQL을 사용한다

Reason:
Render에서 관리형 PostgreSQL을 쉽게 사용할 수 있고, Vercel + Render 배포 흐름과 잘 맞는다. 요즘 신생 프로젝트에서 PostgreSQL 선호도가 높아 학습 가치도 크다.

Status:
승인됨.

### Decision: AWS EC2는 초기 배포 대상에서 제외한다

Reason:
초기 학습 단계에서는 SSH, 보안 그룹, 프로세스 관리, HTTPS 등 운영 부담이 크다. 대신 Vercel과 Render를 우선 사용한다.

Status:
승인됨.

### Decision: 초기 배포는 Vercel과 Render를 사용한다

Reason:
Vercel은 Vite + React 프론트엔드 배포가 단순하고, Render는 Express 백엔드 배포를 빠르게 연습하기 좋다. AWS EC2보다 운영 부담이 적어 초기 학습에 적합하다.

Status:
승인됨.

### Decision: Redis는 optional cache로 사용한다

Reason:
게시글 목록/상세 조회 캐시와 캐시 무효화 흐름을 학습하되, Redis 장애가 핵심 CRUD 동작을 막지 않게 하기 위함이다.

Status:
승인됨.

### Decision: Nginx는 로컬 reverse proxy 연습용으로 사용한다

Reason:
Vercel/Render 배포와 별개로, 정적 파일 서빙과 `/api` 프록시 흐름을 실습하기 위함이다.

Status:
승인됨.

### Decision: Swagger UI로 API 명세와 수동 테스트를 제공한다

Reason:
초보 학습 단계에서 API 구조를 눈으로 확인하고 브라우저에서 직접 요청을 테스트할 수 있게 하기 위함이다.

Status:
승인됨.
