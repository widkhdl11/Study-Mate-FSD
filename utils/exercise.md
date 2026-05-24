# 한정판 굿즈 응모 시스템 — 4단계 R/W 매핑 워크시트

## 📌 시나리오 요약

K-pop 굿즈 쇼핑몰. 매월 1일 정오에 한정판 상품 응모 이벤트.

- 응모 시작 시간부터 정확히 **10분간** 접수
- 응모권 1장당 **포인트 1000점** 차감, 한꺼번에 여러 장 구매 가능
- **한 유저는 한 이벤트당 최대 3장**까지
- 응모 종료 후 추첨으로 당첨자 결정 (재고보다 응모자 많을 수 있음)
- 예상 동시 접속자 **5만 명**, 첫 10초에 트래픽 집중

## 🎯 분석 대상 액션

**`purchase_tickets(event_id, quantity)`** — 유저가 응모권 N장 구매

이 액션이 하는 일:

- `events.total_tickets_sold` += quantity
- `tickets` 테이블에 quantity 개의 행 INSERT
- `user_points.balance` -= (ticket_price × quantity)
- `point_transactions`에 차감 이력 INSERT

---

## 📋 스키마 (참고용)

```sql
events (
  id, product_name, total_stock, ticket_price,
  max_tickets_per_user, starts_at, ends_at,
  status,                    -- 'scheduled' | 'open' | 'closed' | 'drawn'
  total_tickets_sold
)

tickets (
  id, event_id, user_id, purchased_at,
  is_winner                  -- NULL → 추첨 후 true/false
)

user_points (
  user_id, balance, updated_at
)

point_transactions (
  id, user_id, amount, reason, reference_id, created_at
)
```

---

## ✅ 3단계 — 불변식 24개 (확정판, 참조용)

### A. 사전 조건 (액션 시작 시 만족해야 함)

| ID  | 불변식                                                | 깨지면                    |
| --- | ----------------------------------------------------- | ------------------------- |
| P1  | `events.id`가 존재함                                  | 존재하지 않는 이벤트 응모 |
| P2  | `events.status = 'open'`                              | 모집 중 아닌 이벤트 응모  |
| P3  | 액션 실행 시점 ∈ [`starts_at`, `ends_at`)             | 시간 외 응모              |
| P4  | `quantity` ≥ 1                                        | 0개 또는 음수 응모        |
| P5  | `quantity` ≤ `max_tickets_per_user`                   | 단일 요청 한도 초과       |
| P6  | (기존 보유 수) + `quantity` ≤ `max_tickets_per_user`  | 누적 한도 초과            |
| P7  | `user_points.balance` ≥ (`ticket_price` × `quantity`) | 잔액 부족                 |
| P8  | `user_points.user_id`가 존재함                        | 유령 유저                 |

### B. 사후 조건 (액션 종료 후 만족해야 함)

| ID  | 불변식                                                        | 깨지면       |
| --- | ------------------------------------------------------------- | ------------ |
| Q1  | `tickets` 신규 행 = 정확히 `quantity`개                       | 부분 INSERT  |
| Q2  | 각 신규 `tickets` 행의 `event_id`, `user_id`가 요청값과 일치  | 잘못된 행    |
| Q3  | 각 신규 `tickets` 행의 `is_winner`는 NULL                     | 추첨 전 결정 |
| Q4  | `user_points.balance` 변화량 = -(`ticket_price` × `quantity`) | 차감액 오류  |
| Q5  | `user_points.balance` ≥ 0                                     | 음수 잔액    |
| Q6  | `point_transactions` 신규 행 (정책 결정: 1개 또는 quantity개) | 이력 누락    |
| Q7  | `point_transactions.amount` 합 = balance 변화량               | 이력 ≠ 결과  |
| Q8  | `events.total_tickets_sold` 증가량 = `quantity`               | 카운터 오류  |

### C. 시스템 전역 불변식

| ID  | 불변식                                                          | 깨지면             |
| --- | --------------------------------------------------------------- | ------------------ |
| G1  | `user_points.balance` ≥ 0 항상                                  | 음수 잔액 (재앙급) |
| G2  | `events.total_tickets_sold` = `COUNT(tickets WHERE event_id=X)` | 카운터 드리프트    |
| G3  | `SUM(point_transactions WHERE user_id=U)` = `balance`           | 이력 일관성 깨짐   |
| G4  | 한 유저의 한 이벤트당 `COUNT(tickets) ≤ max_tickets_per_user`   | 한도 초과          |
| G5  | `events.status != 'open'`일 때 `tickets` 신규 행 생성 X         | 부정 응모          |

### D. 원자성/동시성 불변식

| ID  | 불변식                                          | 깨지면                  |
| --- | ----------------------------------------------- | ----------------------- |
| A1  | 포인트 차감과 응모권 INSERT는 원자적            | 돈만 빠지고 응모권 없음 |
| A2  | 동일 요청(멱등성 키 동일)이 두 번 처리되지 않음 | 더블 결제               |
| A3  | 동시 요청들 사이에서 G1, G4가 모두 유지됨       | 동시성 race             |

---

# ✏️ 4단계 — R/W 매핑 (여기부터 작성)

## 4-a. 액션 내부 R/W

이 액션 한 번이 어떤 자원을 R/W하는지. **불변식을 보호하려면 어떤 자원을 봐야 하는가**를 출발점으로.

| 자원 (테이블.컬럼)                 |   R    |   W    | 어떤 불변식 때문에?      | 비고 |
| ---------------------------------- | :----: | :----: | ------------------------ | ---- |
| `events.id`                        | 유저들 |   x    | 이벤트가 존재하는지 체크 |      |
| `events.status`                    | 유저들 | 호스트 | 이벤트 상태 체크         |      |
| `events.starts_at`                 | 유저들 |   x    | 이벤트 가능 여부 확인    |      |
| `events.ends_at`                   | 유저들 |   x    | 이벤트 가능여부확인      |      |
| `events.ticket_price`              | 유저들 |   x    | 이벤트 응모 가격 확인    |      |
| `events.max_tickets_per_user`      |        |        |                          |      |
| `events.total_tickets_sold`        |        |        |                          |      |
| `events.total_stock`               |        |        |                          |      |
| `tickets` (기존 행 조회)           |        |        |                          |      |
| `tickets` (신규 INSERT)            |        |        |                          |      |
| `user_points.user_id`              |        |        |                          |      |
| `user_points.balance`              |        |        |                          |      |
| `point_transactions` (신규 INSERT) |        |        |                          |      |
| `NOW()` (DB 시각)                  |        |        |                          |      |
| (그 외 떠오르는 거)                |        |        |                          |      |

**의심 포인트**:

- R+W가 같이 있는 자원 = 위험 지점
- W가 있는 자원 = 다른 액션과 경쟁 가능

---

## 4-b. 시스템 전체 W

각 자원을, 이 시스템의 **어떤 액션이든** W할 수 있는지. (이 액션만 보는 게 아님)

**참고 — 이 시스템에 존재하는 다른 액션들**:

- 관리자: 이벤트 생성 / 수정 / 시작 / 종료 / 추첨 실행
- 자동 스케줄러: 시간 도달 시 status 전환
- 유저: 응모권 구매(이 액션) / 다른 액션으로 포인트 사용 / 포인트 적립
- 추첨 시스템: `tickets.is_winner` 결정
- 환불 시스템: 미당첨자 포인트 복구

| 자원                           | 누가 W? (모든 액션) |
| ------------------------------ | ------------------- |
| `events.id`                    |                     |
| `events.status`                |                     |
| `events.starts_at` / `ends_at` |                     |
| `events.ticket_price`          |                     |
| `events.max_tickets_per_user`  |                     |
| `events.total_tickets_sold`    |                     |
| `events.total_stock`           |                     |
| `tickets` (행)                 |                     |
| `tickets.is_winner`            |                     |
| `user_points.balance`          |                     |
| `point_transactions`           |                     |

---

## 4-c. 교차 검토 (TOCTOU 식별)

"내가 R하는 걸, 다른 액션이 동시에 W할 수 있나?"

| 내가 R하는 자원 | 누가 동시에 W? | 시나리오 | 위험도 |
| --------------- | -------------- | -------- | :----: |
|                 |                |          |        |
|                 |                |          |        |
|                 |                |          |        |
|                 |                |          |        |
|                 |                |          |        |

**위험도 기준**:

- ⚠️ 발생 드묾 + 영향 약함
- ⚠️⚠️ 흔함 또는 영향 큼
- ⚠️⚠️⚠️ 매우 흔함 + 재앙급

---

## 4-d. 의심 반복 — 빠뜨린 것 찾기

체크리스트:

- [ ] 시간(`NOW()`)을 가변 자원으로 봤나? (시간 자체가 흘러서 starts_at/ends_at 경계 넘어감)
- [ ] "기존 보유 수" R을 명시했나? (P6 보호용)
- [ ] `events.total_tickets_sold`의 R+W 동시성 (5만 명 경쟁)을 인식했나?
- [ ] 본인의 다른 탭/세션에서 동시에 다른 액션을 일으킬 가능성을 봤나?
- [ ] 부분 INSERT 가능성을 봤나? (quantity=3인데 2개만 INSERT되는)
- [ ] 더블 클릭/재시도로 같은 요청이 두 번 올 가능성을 봤나?
- [ ] 외부 시스템(추첨, 환불)이 동시에 같은 행을 만질 가능성을 봤나?
- [ ] "관리자가 응모 도중 이벤트 종료" 시나리오를 봤나?
- [ ] "관리자가 응모 도중 max_tickets_per_user를 줄임" 시나리오를 봤나?

---

## 📝 메모 / 추가 의심 / 정책 결정 필요 사항

> 작성하면서 떠오르는 정책 결정 사항이나 도메인 모호함을 여기에 적기.

예시:

- 잔액 부족 시: 전부 거부? 가능한 만큼만? → 정책 결정 필요
- `point_transactions`: 응모권 1장당 1행? 구매 1회당 1행? → 정책 결정 필요
- 멱등성 키: 클라이언트에서 보내나? → 정책 결정 필요

---

## 🎯 4단계 완료 후 다음 단계

이 표 다 채우면 다음으로:

- **5단계**: 각 불변식이 어떤 레이스 패턴(Lost Update / TOCTOU / Write Skew / Double Submit / Counter Drift)에서 깨지는지
- **6단계**: 각 불변식, DB냐 서버냐 (5질문 의사결정 트리)
- **7단계**: 구현 (SQL/RPC/서버 코드)
- **8단계**: 검증 표 (각 불변식이 코드에서 어떻게 지켜지나)

[메타]
SoC

[원칙들]

- 추상화
  ├─ 추상화 수준 일관성 ✅ (본인 학습)
  ├─ 의도 드러나는 이름 ✅ (직관으로 학습)
  ├─ CQS (명령-질의 분리)
  └─ 함수 인자 최소화 (직관)
- 정보 은닉
  ├─ 최소 노출 ✅ (private 학습)
  ├─ 깊은 모듈
  └─ 디미터 법칙
- 캡슐화
  ├─ 묻지 말고 시켜라 (직관)
  └─ 불변성 ✅ (const 학습)

[척도]

- 결합도, 응집도, SRP ✅ (학습 완료)

[설계 원칙]

- SOLID
  ├─ S (단일 책임) ✅
  ├─ O (개방-폐쇄) ✅ 일부
  ├─ L (리스코프 치환)
  ├─ I (인터페이스 분리)
  └─ D (의존성 역전) ✅
- GRASP — 9개 중 6개 ✅

[코드 휴리스틱]

- DRY, KISS, YAGNI
- 합성 > 상속
- 4개 신호 ✅ (본인이 학습)

[최상위 — 메타 원칙]
관심사의 분리 (SoC)

        ↓ 구체적 도구로 적용

[원칙 — 어떻게 분리하나]

- 추상화 (본질만 노출, 세부 숨김)
- 정보 은닉 (내부 구현 보호)
- 캡슐화 (데이터+동작 묶기)

          ↓ 데이터에 적용

[패턴]

- ADT (데이터를 동작으로 정의)
- 모듈화

          ↓ 측정/평가

[척도]

- 결합도 (모듈 사이)
- 응집도 (모듈 안)
- 단일 책임 (SRP)

          ↓ 구체적 기법

[설계 원칙들]

- SOLID
- GRASP
- 디자인 패턴

[본인이 실제로 한 순서]
결합도/응집도 (구체적) — 5일에 걸쳐 학습
↓ 학습 끝에 자각
SRP, GRASP, SOLID 일부 (직관으로 도달)
↓ 어제 질문
SoC (메타 원칙 — "이게 뿌리구나" 자각)
↓ 오늘 질문
ADT (또 다른 메타 원칙)
