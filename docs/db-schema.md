# DB 스키마 — 테이블 · 트리거 · 함수

> 원본: `supabase/migrations/20260614053323_remote_schema.sql` (db pull 스냅샷).
> 변경 시 이 문서도 같이 갱신. (cleanup 후 상태 기준 — 중복 카운트 트리거 / orphan `update_post_likes_count` 제거됨)

---

## 1. 테이블

| 테이블 | 핵심 컬럼 | 용도 |
|---|---|---|
| **profiles** | id(uuid=auth.users.id), username, email, points, gender, birth_date, avatar_url, bio | 사용자 프로필 (auth 확장) |
| **studies** | id, creator_id→profiles, title, description, study_category, region, **status**(recruiting/closed/completed), **max_participants**, **current_participants**, timestamps | 스터디 본체. `check_capacity`(current≤max), status CHECK |
| **participants** | id, study_id→studies, user_id→profiles, **status**(pending/accepted/rejected), **role**(common/host), user_email·username·avatar_url(비정규화), timestamps | 스터디 참여자. status CHECK = pending/accepted/rejected |
| **posts** | id, author_id→profiles, study_id→studies, title, content, image_url(jsonb), likes_count, comments_count, views_count, timestamps | 모집글 |
| **likes** | id, post_id→posts, user_id→profiles, created_at | 글 좋아요 |
| **chats** | id, study_id→studies, is_group, creator_id, name, **last_message**, last_message_at, timestamps | 채팅방 (스터디별 그룹챗) |
| **chat_participants** | id, chat_id→chats, user_id→profiles, last_read_at | 채팅방 참여자 |
| **chat_messages** | id, chat_id→chats, sender_id→profiles, content, created_at | 채팅 메시지 |
| **notifications** | id, user_id→profiles, type, title, content, is_read, is_deleted, reference_type, reference_id, sender_id | 알림 |
| **points_history** | id, user_id→profiles, amount, reason, reference_type, reference_id | 포인트 변동 이력 |

### FK 삭제 동작 (ON DELETE)
- `studies` 삭제 → **CASCADE**: participants, posts, chats
- `chats` 삭제 → **CASCADE**: chat_participants, chat_messages
- `posts` 삭제 → **CASCADE**: likes
- `profiles` 삭제 → **CASCADE**: participants, likes, points_history, chat_participants / **SET NULL**: chat_messages.sender_id, notifications.sender_id
- → **스터디 삭제 한 방으로 참여자·글·채팅·메시지까지 정리됨** (앱은 `deleteStudy`만 호출)

---

## 2. 트리거 (DB 이벤트 자동 발동)

| 트리거 | 테이블 / 이벤트 | 실행 함수 | 동작 | 관련 기능 |
|---|---|---|---|---|
| `trigger_participants_count` | participants / AFTER INS·DEL·UPD | `update_study_participants_count` | **accepted 수** COUNT → `studies.current_participants` 갱신 + status 동기화(완료/모집중, closed 보존). 정원 초과 시 EXCEPTION | 스터디 정원·상태 |
| `trigger_status_on_max_change` | studies / BEFORE UPD | `update_study_status_on_max_change` | max_participants 변경 시 status 재계산. 현재 인원 미만으로 줄이면 EXCEPTION | 스터디 수정 |
| `add_participant_to_chat_trigger` | participants / AFTER INS·UPD | `add_participant_to_chat` | status가 accepted로 바뀌면 해당 스터디 그룹챗에 참여자 추가(ON CONFLICT DO NOTHING) | 채팅 |
| `on_new_message` | chat_messages / AFTER INS | `update_chat_last_message` | `chats.last_message`, `last_message_at` 갱신 | 채팅 |
| `track_points_change_trigger` | profiles / AFTER UPD | `track_points_change` | points 변경 시 `points_history`에 기록 | 포인트 (⚠️ 검토중) |
| `update_*_updated_at` (×5) | chats·participants·posts·profiles·studies / BEFORE UPD | `update_updated_at_column` | `updated_at = NOW()` | 공통 |

---

## 3. RPC 함수 (앱이 `sb.rpc(...)`로 명시 호출)

| 함수 | 인자 → 반환 | 동작 | 호출처 |
|---|---|---|---|
| `create_study_with_host` | (creator_id, title, description, region, study_category, max_participants) → studies | 한 트랜잭션에 **스터디 + 호스트 participant(accepted) + 그룹챗 + 호스트 챗참여** 생성 (SECURITY DEFINER) | `entities/study/api/StudyRepository` (createStudyWithHost) |
| `increment_post_views` | (post_id) → void | `posts.views_count + 1` | `actions/postAction` (increaseViewCount) → useTrackPostView |
| `toggle_post_like` | (post_id, user_id) → (liked, new_count) | likes insert/delete + `posts.likes_count` 증감 (음수 방지) | `actions/postAction` (toggleLike) → usePost |

---

## 4. 메모 / 주의

- **status를 DB가 소유**: 스터디 `status`(recruiting/completed)는 위 두 트리거가 실질적으로 관리. 도메인(`StudyStatus`)에도 전이 규칙이 있어 **이중 관리(split-brain)** 상태 — 분석 단계에서 "누가 주인인지" 정리 대상. 지금 트리거를 빼면 status를 아무도 안 바꾸므로 주의.
- **participants 비정규화**: username/user_email/avatar_url은 조회 효율용 복사본. 도메인 `Participant`는 이 컬럼들을 모름(profiles 책임).
- ⚠️ **participants.status CHECK = pending/accepted/rejected 만 허용**. 도메인 ParticipantStatus의 kick/withdraw 결과를 DB에 저장할 때 이 3개를 벗어나면 제약 위반 → 매핑(toString) 일치 확인 필요.
- ⚠️ **포인트 기능**: `track_points_change` + `points_history`는 points가 *변경될 때만* 동작. 포인트 적립 로직이 앱에 없으면 dormant. 기능 유지/폐기 결정 필요.
- **notifications는 study/post에 FK 없음** → 스터디/글 삭제 시 관련 알림은 자동 정리 안 됨(dangling 가능). 알림은 ephemeral이라 보통 방치, 필요 시 별도 정리.
