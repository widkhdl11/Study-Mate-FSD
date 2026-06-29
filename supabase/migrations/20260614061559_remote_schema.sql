alter table "public"."participants" drop constraint "participants_status_check";

drop function if exists "public"."update_post_likes_count"();

alter table "public"."participants" add constraint "participants_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'kicked'::text]))) not valid;

alter table "public"."participants" validate constraint "participants_status_check";


