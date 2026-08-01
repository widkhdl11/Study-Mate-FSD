/**
 * entities/post — Public API (cross-slice 진입점)
 *
 * 외부 슬라이스(features/widgets/app)는 *이 파일만* import 한다.
 * 내부 조립 부품(Post.createNew/construct/fromRow, 매퍼, Row/Insert 타입, row.ts/toView.ts)은
 * 노출하지 않는다 — 같은 슬라이스(api/service) 안에서만 직접 사용.
 */

// ── 읽기 (Query) ──
export { queryPostDetail } from "./api/query/postDetail/queryPostDetail";
export { usePostDetail } from "./api/query/postDetail/usePostDetail";
export type { PostDetailView } from "./api/query/postDetail/types";
export { queryAllPosts } from "./api/query/postsAll/queryPostsAll";
export type { PostWithStudyView } from "./api/query/postsAll/types";
export { queryMyPostsWithStudy } from "./api/query/myPostsWithStudy/queryMyPostsWithStudy";
export { useIsLiked } from "./api/query/isLiked/useIsLiked";

// ── UI (표현) ──
export { default as PostListItem } from "./ui/PostListItem";
export { default as PostImageSection } from "./ui/PostImageSection";

// ── 공개 타입 ──
export type { MyPostWithStudyRow } from "./api/query/myPostsWithStudy/types";
export type { MyPostWithStudyView } from "./api/query/myPostsWithStudy/types";
export type { PostError } from "./model/Post"; // action 에러 번역(ACL)용
export type { PostCardView, PostResponse, PostWithRelationResponse, PostRecommendedResponse } from "./model/types";
// ── 쓰기 (Command, use-case 진입) ──  ※ policy finalize 후 추가
export { PostId } from "./model/PostId";
export { PostPolicy } from "./service/Post-policy"; // createPost / updatePost / deletePost (완전 연산)
export type { PostPolicyError } from "./service/Post-policy";
// export { Post } from "./model/Post";                  // isAuthor 등 query만 필요하면 선별 노출

// ── 내부(노출 X) ──
// Post.createNew/construct/fromRow, toInsertRow/toRow/toRow, PostRow/PostInsert/PostProps,
// api/query/postDetail/{row,toView}, PostId, postFormSchema(폼은 features가 직접 쓰면 추가)

export { createPostSchema, updatePostSchema, type CreatePostCommand, type UpdatePostCommand } from "./model/postFormSchema";


// ㅡ Repository ㅡ
export { createPost, deletePost, findPostById, updatePost } from "./api/PostRepository";

// ── lib (이미지 스토리지 헬퍼 — features가 사용) ──
export { uploadPostImages } from "./lib/uploadPostImages";
export { deletePostImages } from "./lib/deletePostImages";

