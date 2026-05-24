# features/

> **사용자 시나리오 단위**의 응집된 코드. "사용자가 하는 한 가지 일"이 한 폴더.

## 역할

"좋아요 토글", "참여 신청 수락", "게시글 작성" 같은 **하나의 사용자 시나리오**를 단위로,
그 시나리오에만 쓰이는 모든 것(UI + 훅 + 액션 + UseCase)을 한 폴더에 모은다.

→ **`features/` 폴더 = 앱이 할 수 있는 일의 명세서**.

## 구조

```
features/participant-accept/
  ui/AcceptButton.tsx            ← 클릭 가능한 UI
  model/useAcceptParticipant.ts  ← React Query mutation 훅
  api/acceptParticipantAction.ts ← 'use server' (얇은 어댑터)
  application/                   ← (선택) 복잡한 시나리오만
    acceptParticipantUseCase.ts
  index.ts                       ← 외부 노출용 re-export
```

## 폴더별 규칙

### `ui/`

- 그 시나리오 전용 UI (버튼, 폼 등).
- mutation 훅(`useMutation`)을 호출.
- 폼 상태, 낙관적 업데이트 등 시나리오 상태 보관.

### `model/`

- React Query mutation 훅.
- 옵티미스틱 업데이트, 캐시 무효화, 토스트 등.

### `api/`

- Next.js Server Action (`'use server'`).
- **얇은 어댑터**: 인증, `revalidatePath`, `ActionResponse` 변환만.
- 비즈니스 로직은 `application/` (또는 entity 호출).

### `application/` (선택)

- UseCase 함수 (`Deps` 클로저 + `Result` 반환).
- **만들 때만**: 복잡 시나리오(분기 3개+, 외부 호출 2개+)일 때.
- 단순 시나리오는 이 폴더 자체를 만들지 않음.

## UseCase 추출 3원칙

UseCase로 추출한다면 반드시 다음 3원칙을 지킨다. 안 지키면 분리 의미 없음.

1. **부수효과를 받는다, 일으키지 않는다** — `Deps`를 파라미터로 받기. `createClient`, `new Date()` 직접 호출 X.
2. **Next.js를 모른다** — `revalidatePath`, `redirect`는 액션에만. UseCase는 결과만 반환.
3. **Throw 대신 `Result` 반환** — 에러를 타입에 드러냄.

## 의존성 규칙

- features는 **`entities/`, `shared/`만 import** 가능.
- features 간 import 금지 (`features/post-create`가 `features/post-edit` 못 부름).
- widgets/app은 features를 자유롭게 import.

## 예정 feature 목록

```
post-create / post-edit / post-delete / post-like-toggle / post-view-track
participant-apply / participant-accept / participant-reject / participant-remove
study-create / study-edit / study-delete
auth-login / auth-logout
notification-mark-read
chat-send
ai-recommend
```

## 첫 작업

`features/participant-accept/` 부터.
가장 검증 단계가 많고 학습 가치가 큰 시나리오.
(단, entity가 먼저 만들어진 다음 작업)
