# widgets/

> **페이지의 큰 블록**. 여러 entities + features를 조립한 단위.

## 역할

한 페이지의 일부분이지만 여러 도메인/시나리오를 조합한 **큰 영역**을 담는다.

- 게시글 상세의 사이드바
- 스터디 상세의 탭 영역
- 사이트 헤더/푸터
- 게시글 목록 영역

→ 현재 코드의 `*Section.tsx` 파일들이 보통 widget이 된다.

## 구조

```
widgets/post-detail-sidebar/
  ui/SidebarSection.tsx        ← 큰 레이아웃
  index.ts                     ← public API
```

### 내부 구성 예시

```tsx
// widgets/post-detail-sidebar/ui/SidebarSection.tsx
export function SidebarSection({ post, participant }) {
  return (
    <Card>
      <StudyStatusBadge status={post.study.status} />        {/* entity */}
      <StudyTitle title={post.study.title} />                {/* entity */}
      <StudyCapacityIndicator capacity={post.study.capacity} />  {/* entity */}
      <UserBadge user={post.author} />                       {/* entity */}
      <ApplyButton studyId={post.study.id} />                {/* feature */}
    </Card>
  );
}
```

## 폴더별 규칙

### `ui/`

- 큰 레이아웃 컴포넌트.
- entities/features를 조립하는 역할.
- 자체 비즈니스 로직 없음. mutation도 호출하지 않음.
- 가끔 오케스트레이션용 `useState` (탭 인덱스 등).

## 의존성 규칙

- widgets는 **`features/`, `entities/`, `shared/`** 모두 import 가능.
- widgets 간 import 금지.
- app(page)은 widgets를 자유롭게 import.

## 예정 widget 목록

```
post-detail-sidebar
post-detail-main
post-detail-relations
post-list
study-detail-header
study-detail-tabs
site-header
site-footer
main-page-recommendations
```

## 첫 작업

`widgets/post-detail-sidebar/` 부터.
현재 `components/posts/detail/SidebarSection.tsx`(115줄, 5가지 책임 혼재)를
entity + feature + widget으로 분리하면서 패턴 정립.
(단, entity의 표현 컴포넌트들이 먼저 만들어진 다음 작업)
