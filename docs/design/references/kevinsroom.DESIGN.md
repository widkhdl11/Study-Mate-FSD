# DESIGN.md — 케빈스룸 (Kevin's Room)

> 대상: https://www.kevinsroom.co.kr/ · 분석일 2026-08-01
> 방법: 실제 브라우저(Chrome)로 페이지 로드 후 DOM·computed style 측정 + 화면 관찰.
> 모든 수치에 **근거 유형(Evidence)·신뢰도(Confidence)** 표기. 미검증 항목은 명시.

---

## 요약 스펙

| 항목 | 값 | 근거 | 신뢰도 |
| --- | ---: | --- | --- |
| 제품 성격 | 커스텀 굿즈 **제작 플랫폼**(B2B 대량 + B2C) | Observed / Inferred | High / Medium |
| 본문 폰트 | `Pretendard Variable` (한글 웹폰트) | Measured | High |
| 본문 크기/행간 | 17px / 28.9px (≈1.7) | Measured | High |
| 기본 텍스트 색 | `#1F2933` (rgb 31,41,51) | Measured | High |
| 브랜드 메인 블루 | `#2F58E0` (히어로 배경·주요 CTA, 8회 검출) | Measured | High |
| 블루 다크 변주 | `#1D40B4` · `#0E44B7` · `#002AA1` | Measured | High |
| 액센트 레드 | MOQ 배지의 비비드 레드 (정확 hex 미측정) | Observed | Medium |
| 중립 배지 | 배경 `#F0F4F9` / 텍스트 `#7B8794` | Measured | High |
| 헤더 | `position: fixed`, 높이 **69px**, 히어로 위 투명 | Measured | High |
| 헤더 스크롤 상태 | 흰 배경 + 다크 아이콘으로 전환 | Observed | High |
| 히어로 | 풀뷰포트(911px) 블루 배경 + 3D 아이소메트릭 일러스트 | Measured / Observed | High |
| 상품 그리드 | 데스크톱 **4열**, 카드 폭 ≈251px | Measured / Observed | High |
| 콘텐츠 정렬 폭 | 약 1080~1200px (중앙 정렬) | Estimated | Medium |
| 홈 총 길이 | ≈8,872px (롱 싱글 스크롤) | Measured | High |
| 디자인 장르 | 3D 캐릭터 일러스트 주도 · 미니멀 크롬 (명명된 단일 양식 아님) | Inferred | Medium |
| hover/전환/반응형 | 스크롤 헤더 외 미검증 | Unknown | Low |

---

## 1. Overview & Design Intent

- **핵심 성격**: "케빈스룸 굿즈 제작 플랫폼"(문서 `<h1>` = `케빈스룸 굿즈 제작 플랫폼`, Measured). 단순 리테일이 아니라 **커스텀 굿즈 대량 제작**을 파는 서비스형 커머스. 상품마다 **MOQ(최소 주문 수량: 1,000 / 500 / 100개)**를 전면에 노출 → B2B 발주 성격 강함. 동시에 위시·장바구니 등 B2C 커머스 UI도 병행. (Observed / Inferred)
- **브랜드 톤**: 파란 정복을 입고 돋보기를 든 3D 캐릭터("케빈"), 건물 일러스트("kevin's room"), 택배차·캐릭터 가족 등으로 **친근하고 이야기 있는 브랜드**를 연출. 카피 "Check in story, check out goods", "오늘은 [ 실용적인 ] 굿즈가 필요하세요?"처럼 **호텔 체크인/탐정 dossier 은유**를 사용. (Observed / Inferred)
- **IA(정보구조, Observed/Inferred)**: 히어로 캐러셀(회전 브래킷 단어) → 브랜드 스토리 스크롤 리빌("이런 굿즈 고민, 해봤다면?") → 서비스 가치 소구("아이디어만 있는데, 제작이 될까요?") → 상품 컬렉션(NEW/BEST/LIKES 탭) → 상시 전환 유도(견적요청·카톡·소량제작·나만의 캐릭터). 상단 네비게이션은 **햄버거 뒤로 숨김** + 위시/장바구니/검색/계정 아이콘만 노출.

## 2. Key Features & Functional Components

- **고정 헤더(69px)**: 히어로 위에서는 투명·흰 아이콘, 스크롤 시 흰 배경·다크 아이콘으로 전환. 좌측 햄버거, 우측 위시리스트·장바구니·검색·계정 아이콘. (Measured 높이/position, Observed 색 전환)
- **히어로 캐러셀**: 풀뷰포트 블루 배경 + 3D 아이소메트릭 건물/캐릭터 일러스트. 좌우 화살표, 중앙 카피의 `[ ]` 안 단어가 회전(실용적인 ↔ 개성있는). (Observed)
- **스크롤 스토리텔링 섹션**: 흰 배경·다크 텍스트로 문장이 순차 노출되는 브랜드 설득 구간. (Observed; 개별 전환 타이밍은 Unknown)
- **상품 컬렉션 그리드**: 4열 카드. 각 카드 = 테마 커버(돋보기+서류 dossier 모티프, 빨간 MOQ 배지·별점) + 하위 상품 리스트(썸네일·상품명·위시 하트+수치·`최소수량` 배지·최소수량 단가). NEW/BEST/LIKES 탭 토글(블루 활성 pill). (Observed / Measured)
- **플로팅 액션 레일(우측 고정)**: 견적요청 / 카톡 문의 / 소량 제작 / 나만의 캐릭터 — 블루 원형 버튼 + 다크 버튼. 커스텀 제작 리드 확보 동선. (Observed)

## 3. Visual & Layout Specifications

- **타이포그래피** (Measured): `Pretendard Variable` 폴백 체인(-apple-system → Apple SD Gothic Neo → Noto Sans KR …). 본문 17px/행간 28.9px, 색 `#1F2933`. `<h1>` 34px / weight 700 / 행간 57.8px. 루트 `html { font-size: 8.5px }` — 비정상적으로 작은 base(‑rem 스케일링/반응형 트릭으로 추정, Inferred).
- **색상** (Measured 별도 표기):
  - 브랜드 블루 `#2F58E0` (지배색, 히어로 배경 rgb 47,88,224). 다크 변주 `#1D40B4`·`#0E44B7`·`#002AA1`(깊이/그라디언트/hover 추정, Inferred). `#007AFF`(iOS 시스템 블루) 소량 검출.
  - 중립: 텍스트 `#1F2933`, 보조 배지 텍스트 `#7B8794` / 배경 `#F0F4F9`.
  - 액센트 레드: MOQ 배지 비비드 레드 — **화면 관찰만**, 정확 hex 미측정(Observed).
- **레이아웃** (Measured/Estimated): 히어로는 풀블리드(docWidth ≈1915px). 콘텐츠 섹션은 중앙 정렬 약 1080~1200px(Estimated). 상품 그리드 데스크톱 4열, 카드 폭 ≈251px(Measured).
- **컴포넌트 디테일** (Measured): `최소수량` 배지 = 배경 `#F0F4F9` / 텍스트 `#7B8794` / border-radius 2.55px / font-size 11px. (카드 컨테이너 자체는 투명 배경·무테·무그림자 — 이미지와 텍스트로만 구성, Observed/Measured)

## 4. Accessibility & Interaction Details

- **대비**: 본문 `#1F2933` on 화이트 ≈ 12:1 이상으로 양호(계산값, High). 히어로 블루 `#2F58E0` on 화이트 텍스트 ≈ 5.0:1 → 대형 텍스트 기준 통과(Estimated, Medium). `최소수량` 배지 `#7B8794` on `#F0F4F9`는 ≈3:1 부근으로 소형 텍스트 대비 경계선(Estimated, Medium).
- **확인된 인터랙션**: 헤더 스크롤 투명→불투명 전환(Observed). 히어로 캐러셀 화살표 + 브래킷 단어 회전(Observed).
- **미검증(Unknown)**: 카드/버튼 hover 상태, 스크롤 리빌 애니메이션 타이밍/이징, 모바일·태블릿 브레이크포인트, 포커스 링/키보드 네비게이션, `prefers-reduced-motion` 대응 — 직접 테스트·측정하지 않음.

## 5. Validation & Verification Summary

- **사용한 근거 유형**: Measured(브라우저 computed style·getBoundingClientRect·색 검출) 다수, Observed(스크린샷 관찰), Estimated(정렬 폭·일부 대비), Inferred(디자인 의도·장르·rem 트릭).
- **측정 방식**: Chrome 실제 로드 후 JS로 computed style 추출. 뷰포트 1920×911(dpr 1) 데스크톱 단일 조건.
- **미검증 목록**: hover/애니메이션 전환값, 반응형 브레이크포인트, 접근성 포커스/모션 대응, MOQ 배지·플로팅 버튼의 정확 색 hex, 캐러셀 자동재생 여부, 햄버거 내부 전체 네비게이션 구조.
- **주의**: 최초 진입 시 튜토리얼 모달이 뜸("그냥 둘러보기"로 닫고 분석). 단일 세션·단일 뷰포트 결과이므로 반응형/상호작용 세부는 추가 검증 필요.
