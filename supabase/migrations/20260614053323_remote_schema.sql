


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_participant_to_chat"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  study_chat_id BIGINT;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- 해당 스터디의 그룹 채팅방 ID 찾기
    SELECT id INTO study_chat_id
    FROM chats
    WHERE study_id = NEW.study_id AND is_group = true
    LIMIT 1;
    
    -- 채팅방에 참여자 추가
    IF study_chat_id IS NOT NULL THEN
      INSERT INTO chat_participants (chat_id, user_id)
      VALUES (study_chat_id, NEW.user_id)
      ON CONFLICT (chat_id, user_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."add_participant_to_chat"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."studies" (
    "id" bigint NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "study_category" "text" NOT NULL,
    "region" "text" NOT NULL,
    "status" "text" DEFAULT 'recruiting'::"text",
    "max_participants" integer NOT NULL,
    "current_participants" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_capacity" CHECK (("current_participants" <= "max_participants")),
    CONSTRAINT "studies_status_check" CHECK (("status" = ANY (ARRAY['recruiting'::"text", 'closed'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."studies" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_study_with_host"("p_creator_id" "uuid", "p_title" "text", "p_description" "text", "p_region" "text", "p_study_category" "text", "p_max_participants" integer) RETURNS "public"."studies"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_study    studies;
  new_chat_id  bigint;
  creator_info record;
BEGIN
  INSERT INTO studies (creator_id, title, description, region, study_category,
                       max_participants, current_participants, status)
  VALUES (p_creator_id, p_title, p_description, p_region, p_study_category,
          p_max_participants, 0, 'recruiting')
  RETURNING * INTO new_study;

  SELECT username, email INTO creator_info FROM profiles WHERE id = p_creator_id;

  INSERT INTO participants (study_id, user_id, status, username, user_email, role)
  VALUES (new_study.id, p_creator_id, 'accepted', creator_info.username, creator_info.email, 'host');

  INSERT INTO chats (study_id, creator_id, is_group, name)
  VALUES (new_study.id, p_creator_id, true, new_study.title)
  RETURNING id INTO new_chat_id;

  INSERT INTO chat_participants (chat_id, user_id)
  VALUES (new_chat_id, p_creator_id);

  -- 카운트 트리거가 current_participants를 1로 올렸으므로 다시 읽어 정확한 행 반환 (gotcha 3)
  SELECT * INTO new_study FROM studies WHERE id = new_study.id;
  RETURN new_study;
END;
$$;


ALTER FUNCTION "public"."create_study_with_host"("p_creator_id" "uuid", "p_title" "text", "p_description" "text", "p_region" "text", "p_study_category" "text", "p_max_participants" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_post_views"("post_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE posts
  SET views_count = views_count + 1  
  WHERE id = post_id;
END;
$$;


ALTER FUNCTION "public"."increment_post_views"("post_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_post_like"("p_post_id" bigint, "p_user_id" "uuid") RETURNS TABLE("liked" boolean, "new_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_existing_like BIGINT;
  v_new_count BIGINT;
  v_liked BOOLEAN;
BEGIN
  -- 기존 좋아요 확인
  SELECT id INTO v_existing_like
  FROM likes
  WHERE post_id = p_post_id AND user_id = p_user_id;
  
  IF v_existing_like IS NOT NULL THEN
    -- ✅ 좋아요 취소
    DELETE FROM likes WHERE id = v_existing_like;
    
    -- likes_count 감소
    UPDATE posts
    SET likes_count = GREATEST(likes_count - 1, 0)  -- 음수 방지
    WHERE id = p_post_id
    RETURNING likes_count INTO v_new_count;
    
    v_liked := FALSE;
  ELSE
    -- ✅ 좋아요 추가
    INSERT INTO likes (post_id, user_id) 
    VALUES (p_post_id, p_user_id);
    
    -- likes_count 증가
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE id = p_post_id
    RETURNING likes_count INTO v_new_count;
    
    v_liked := TRUE;
  END IF;
  
  -- 결과 반환
  RETURN QUERY SELECT v_liked, v_new_count;
END;
$$;


ALTER FUNCTION "public"."toggle_post_like"("p_post_id" bigint, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_points_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.points != OLD.points THEN
    INSERT INTO points_history (user_id, amount, reason)
    VALUES (NEW.id, NEW.points - OLD.points, 'Manual adjustment');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."track_points_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_chat_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE chats 
  SET last_message = NEW.content,
      last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_chat_last_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_post_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_study_participants_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_count INTEGER;
  v_max INTEGER;
  v_status TEXT;
  v_study_id BIGINT;
BEGIN
  v_study_id := COALESCE(NEW.study_id, OLD.study_id);

  -- accepted 인원 COUNT
  SELECT COUNT(*) INTO v_count
  FROM participants
  WHERE study_id = v_study_id
    AND status = 'accepted';

  -- 정원 및 현재 상태 조회
  SELECT max_participants, status INTO v_max, v_status
  FROM studies
  WHERE id = v_study_id;

  -- 정원 초과 시 거절
  IF v_count > v_max THEN
    RAISE EXCEPTION '정원 초과';
  END IF;

  -- 카운트 갱신 + status 동기화 (closed는 보존)
  UPDATE studies
  SET 
    current_participants = v_count,
    updated_at = NOW(),
    status = CASE
      WHEN v_status = 'closed' THEN 'closed'
      WHEN v_count >= max_participants THEN 'completed'
      ELSE 'recruiting'
    END
  WHERE id = v_study_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_study_participants_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_study_status_on_max_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.max_participants <> OLD.max_participants THEN
        IF NEW.max_participants < NEW.current_participants THEN
            RAISE EXCEPTION '정원을 현재 참여자 수(%) 미만으로 설정할 수 없습니다', NEW.current_participants;
        END IF;
        IF NEW.status <> 'closed' THEN
            IF NEW.current_participants >= NEW.max_participants THEN
                NEW.status := 'completed';
            ELSE
                NEW.status := 'recruiting';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_study_status_on_max_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" bigint NOT NULL,
    "chat_id" bigint NOT NULL,
    "sender_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


ALTER TABLE "public"."chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."chat_participants" (
    "id" bigint NOT NULL,
    "chat_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "last_read_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_participants" OWNER TO "postgres";


ALTER TABLE "public"."chat_participants" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chat_participants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" bigint NOT NULL,
    "study_id" bigint,
    "is_group" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "creator_id" "uuid" DEFAULT "auth"."uid"(),
    "name" character varying,
    "last_message" "text",
    "last_message_at" timestamp with time zone
);


ALTER TABLE "public"."chats" OWNER TO "postgres";


ALTER TABLE "public"."chats" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chats_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" bigint NOT NULL,
    "post_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."likes" OWNER TO "postgres";


ALTER TABLE "public"."likes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "is_read" boolean DEFAULT false,
    "is_deleted" boolean DEFAULT false,
    "reference_type" "text",
    "reference_id" bigint,
    "sender_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."participants" (
    "id" bigint NOT NULL,
    "study_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_email" "text" NOT NULL,
    "role" character varying DEFAULT 'common'::character varying,
    "username" "text",
    "avatar_url" "text" DEFAULT ''::"text",
    CONSTRAINT "participants_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."participants" OWNER TO "postgres";


ALTER TABLE "public"."participants" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."participants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."points_history" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "reason" "text" NOT NULL,
    "reference_type" "text",
    "reference_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."points_history" OWNER TO "postgres";


ALTER TABLE "public"."points_history" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."points_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" bigint NOT NULL,
    "author_id" "uuid" NOT NULL,
    "study_id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "image_url" "jsonb" NOT NULL,
    "likes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "views_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


ALTER TABLE "public"."posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "points" integer DEFAULT 0,
    "gender" "text",
    "birth_date" "date",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bio" "text" DEFAULT '간단한 자기소개를 입력해주세요.'::"text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE "public"."studies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."studies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_participants"
    ADD CONSTRAINT "chat_participants_chat_id_user_id_key" UNIQUE ("chat_id", "user_id");



ALTER TABLE ONLY "public"."chat_participants"
    ADD CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_study_id_user_id_key" UNIQUE ("study_id", "user_id");



ALTER TABLE ONLY "public"."points_history"
    ADD CONSTRAINT "points_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."studies"
    ADD CONSTRAINT "studies_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_chat_messages_chat" ON "public"."chat_messages" USING "btree" ("chat_id");



CREATE INDEX "idx_chat_messages_created" ON "public"."chat_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_chat_participants_chat" ON "public"."chat_participants" USING "btree" ("chat_id");



CREATE INDEX "idx_chat_participants_user" ON "public"."chat_participants" USING "btree" ("user_id");



CREATE INDEX "idx_chats_study" ON "public"."chats" USING "btree" ("study_id");



CREATE INDEX "idx_likes_post" ON "public"."likes" USING "btree" ("post_id");



CREATE INDEX "idx_likes_user" ON "public"."likes" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_created" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_participants_status" ON "public"."participants" USING "btree" ("study_id", "status");



CREATE INDEX "idx_participants_study" ON "public"."participants" USING "btree" ("study_id");



CREATE INDEX "idx_participants_user" ON "public"."participants" USING "btree" ("user_id");



CREATE INDEX "idx_points_history_created" ON "public"."points_history" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_points_history_user" ON "public"."points_history" USING "btree" ("user_id");



CREATE INDEX "idx_posts_author" ON "public"."posts" USING "btree" ("author_id");



CREATE INDEX "idx_posts_created" ON "public"."posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_posts_study" ON "public"."posts" USING "btree" ("study_id");



CREATE INDEX "idx_studies_created" ON "public"."studies" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_studies_creator" ON "public"."studies" USING "btree" ("creator_id");



CREATE INDEX "idx_studies_status" ON "public"."studies" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "add_participant_to_chat_trigger" AFTER INSERT OR UPDATE ON "public"."participants" FOR EACH ROW EXECUTE FUNCTION "public"."add_participant_to_chat"();



CREATE OR REPLACE TRIGGER "on_new_message" AFTER INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_chat_last_message"();



CREATE OR REPLACE TRIGGER "track_points_change_trigger" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."track_points_change"();



CREATE OR REPLACE TRIGGER "trigger_participants_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."participants" FOR EACH ROW EXECUTE FUNCTION "public"."update_study_participants_count"();



CREATE OR REPLACE TRIGGER "trigger_status_on_max_change" BEFORE UPDATE ON "public"."studies" FOR EACH ROW EXECUTE FUNCTION "public"."update_study_status_on_max_change"();



CREATE OR REPLACE TRIGGER "update_chats_updated_at" BEFORE UPDATE ON "public"."chats" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_participants_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."participants" FOR EACH ROW EXECUTE FUNCTION "public"."update_study_participants_count"();



CREATE OR REPLACE TRIGGER "update_participants_updated_at" BEFORE UPDATE ON "public"."participants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_studies_updated_at" BEFORE UPDATE ON "public"."studies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chat_participants"
    ADD CONSTRAINT "chat_participants_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_participants"
    ADD CONSTRAINT "chat_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."likes"
    ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."participants"
    ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."points_history"
    ADD CONSTRAINT "points_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."studies"
    ADD CONSTRAINT "studies_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."add_participant_to_chat"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_participant_to_chat"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_participant_to_chat"() TO "service_role";



GRANT ALL ON TABLE "public"."studies" TO "anon";
GRANT ALL ON TABLE "public"."studies" TO "authenticated";
GRANT ALL ON TABLE "public"."studies" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_study_with_host"("p_creator_id" "uuid", "p_title" "text", "p_description" "text", "p_region" "text", "p_study_category" "text", "p_max_participants" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_study_with_host"("p_creator_id" "uuid", "p_title" "text", "p_description" "text", "p_region" "text", "p_study_category" "text", "p_max_participants" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_study_with_host"("p_creator_id" "uuid", "p_title" "text", "p_description" "text", "p_region" "text", "p_study_category" "text", "p_max_participants" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_post_views"("post_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_post_views"("post_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_post_views"("post_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_post_like"("p_post_id" bigint, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_post_like"("p_post_id" bigint, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_post_like"("p_post_id" bigint, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_points_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_points_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_points_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_chat_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_chat_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_chat_last_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_study_participants_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_study_participants_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_study_participants_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_study_status_on_max_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_study_status_on_max_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_study_status_on_max_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chat_messages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."chat_participants" TO "anon";
GRANT ALL ON TABLE "public"."chat_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_participants" TO "service_role";



GRANT ALL ON SEQUENCE "public"."chat_participants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chat_participants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chat_participants_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."chats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chats_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."likes" TO "anon";
GRANT ALL ON TABLE "public"."likes" TO "authenticated";
GRANT ALL ON TABLE "public"."likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."likes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."participants" TO "anon";
GRANT ALL ON TABLE "public"."participants" TO "authenticated";
GRANT ALL ON TABLE "public"."participants" TO "service_role";



GRANT ALL ON SEQUENCE "public"."participants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."participants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."participants_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."points_history" TO "anon";
GRANT ALL ON TABLE "public"."points_history" TO "authenticated";
GRANT ALL ON TABLE "public"."points_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."points_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."points_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."points_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."studies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."studies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."studies_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Enable read access for all users"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (true);



  create policy "anaonymous_image_c 1hys5dx_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'post-images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "anaonymous_image_r 1hys5dx_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'post-images'::text));



  create policy "anon-select vejz8c_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'profile-images'::text));



  create policy "authenticated-cud vejz8c_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'profile-images'::text));



  create policy "authenticated-cud vejz8c_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'profile-images'::text));



  create policy "authenticated-cud vejz8c_2"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'profile-images'::text));



  create policy "authenticated-cud vejz8c_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'profile-images'::text));



  create policy "authenticated_user_ud 1hys5dx_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'post-images'::text) AND (( SELECT auth.uid() AS uid) = (owner_id)::uuid)));



  create policy "delete 1hys5dx_0"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'post-images'::text));



  create policy "delete 1hys5dx_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'post-images'::text));



