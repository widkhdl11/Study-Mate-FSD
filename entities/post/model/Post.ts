import { StudyId, StudyIdError } from "@/entities/study/model/StudyId";
import { UserId, UserIdError } from "@/entities/user/model/UserId";
import { Brand } from "@/shared/kernel/Id";
import { err, ok, Result } from "@/shared/kernel/Result";
import { ImageUrl } from "@/shared/lib/file";
import { PostId, PostIdError } from "./PostId";

/**
 * 비즈니스 규칙
 * 1. 게시글은 제목, 내용, 이미지, 좋아요, 댓글, 조회수, 생성일, 수정일을 가진다.
 * 2. 게시글은 무조건 하나의 본인 생성 스터디 ID를 가져야 한다.
 * 3. 스터디가 삭제 되면 게시글도 삭제 되어야 한다.
 * 4. ImageUrl은 ImageUrl 타입의 배열을 가져야 한다.
 * 5. counts들은 숫자 타입이어야 한다.
 * 6. 게시글 수정 및 삭제는 본인만 가능하다.
 */

export type Post = Brand<
  Readonly<{
    id: PostId;
    authorId: UserId;
    studyId: StudyId;
    title: string;
    content: string;
    imageUrl: ImageUrl[];
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    createdAt: Date;
    updatedAt: Date;
}>, "Post">

export type PostInsert = Brand<
  Readonly<{
    authorId: UserId;
    studyId: StudyId;
    title: string;
    content: string;
    imageUrl: ImageUrl[] | null;
}>, "PostInsert">

export type DeletePostIntent = Brand<
  Readonly<{ id: PostId }>,
  "DeletePostIntent"
>;

export type PostError =
| { readonly kind: "EmptyValue"; readonly cause: string }
| { readonly kind: "InvalidValue"; readonly cause: string }

// 도메인 재구성 오류
export type PostFromRowError =
| { readonly kind: "InvalidId"; readonly cause: PostIdError }
| { readonly kind: "InvalidAuthorId"; readonly cause: UserIdError }
| { readonly kind: "InvalidStudyId"; readonly cause: StudyIdError }
| { readonly kind: "InvalidPost"; readonly cause: PostError }


export type PostRow = {
  id: number;
  author_id: string;
  study_id: number;
  title: string;
  content: string;
  image_url: ImageUrl[];
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export type PostInsertRow = {
  author_id: string;
  study_id: number;
  title: string;
  content: string;
  image_url: ImageUrl[];
}
export type PostProps = {
  id: PostId;
  authorId: UserId;
  studyId: StudyId;
  title: string;
  content: string;
  imageUrl: ImageUrl[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
export type CreatePostProps = {
  authorId: UserId;
  studyId: StudyId;
  title: string;
  content: string;
  imageUrl: ImageUrl[];
}
const construct = (params: PostProps): Result<Post, PostError> => {
    if (params.title.trim() === "") return err({ kind: "EmptyValue", cause: "title" });
    if (params.content.trim() === "") return err({ kind: "EmptyValue", cause: "content" });
    return ok(params as Post);
}


export const Post = {
  create: construct,

  toRow:(p: Post): PostRow => ({
    id: p.id,
    author_id: p.authorId,
    study_id: p.studyId,
    title: p.title,
    content: p.content,
    image_url: p.imageUrl,
    likes_count: p.likesCount,
    comments_count: p.commentsCount,
    views_count: p.viewsCount,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }),

  toInsertRow:(p: PostInsert): PostInsertRow => ({
    author_id: p.authorId,
    study_id: p.studyId,
    title: p.title,
    content: p.content,
    image_url: p.imageUrl ?? [],
  }),


  fromRow: (row: PostRow): Result<Post, PostFromRowError> => {
    const idResult = PostId.of(row.id);
    if (!idResult.ok) return err({ kind: "InvalidId", cause: idResult.error });
    const authorIdResult = UserId.of(row.author_id);
    if (!authorIdResult.ok) return err({ kind: "InvalidAuthorId", cause: authorIdResult.error });
    const studyIdResult = StudyId.of(row.study_id);
    if (!studyIdResult.ok) return err({ kind: "InvalidStudyId", cause: studyIdResult.error });
    const postResult = construct({
      id: idResult.value,
      authorId: authorIdResult.value,
      studyId: studyIdResult.value,
      title: row.title,
      content: row.content,
      imageUrl: row.image_url,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      viewsCount: row.views_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
    if (!postResult.ok) return err({ kind: "InvalidPost", cause: postResult.error });
    return postResult;
  },

    // 생서용 Insert 생성
  createNew: (params: CreatePostProps): Result<PostInsert, PostError> => {
    if (params.title.trim() === "")   return err({ kind: "EmptyValue", cause: "title" });
    if (params.content.trim() === "") return err({ kind: "EmptyValue", cause: "content" });
    return ok({
      authorId: params.authorId,
      studyId: params.studyId,
      title: params.title,
      content: params.content,
      imageUrl: params.imageUrl,
    } as PostInsert);
  },

  update: (post: Post, params: PostProps): Result<Post, PostError> => {
    if (params.title.trim() === "") return err({ kind: "EmptyValue", cause: "title" });
    if (params.content.trim() === "") return err({ kind: "EmptyValue", cause: "content" });
    return ok({
      ...post,
      title: params.title,
      content: params.content,
      imageUrl: params.imageUrl,
    } as Post);
  },

  delete: (postId: PostId): Result<DeletePostIntent, PostError> => {
    return ok({ id: postId } as DeletePostIntent);
  },

}