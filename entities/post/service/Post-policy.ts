import { Study, StudyError } from "@/entities/study/model/Study";
import { StudyIdError } from "@/entities/study/model/StudyId";
import { ProfileError } from "@/entities/user/model/Profile";
import { UserId, UserIdError } from "@/entities/user/model/UserId";
import { err, Result } from "@/shared/kernel/Result";
import { CreatePostProps, PostProps, DeletePostIntent, Post, PostError, PostInsert } from "../model/Post";

export type PostPolicyError = 
| PostError
| StudyError
| ProfileError
| UserIdError
| StudyIdError
| { readonly kind: "NotActiveStudy" }
| { readonly kind: "NotAuthor"; readonly authorId: UserId, readonly userId: UserId }



export const PostPolicy = {
  createPostIntent: (params: CreatePostProps, study : Study): Result<PostInsert, PostPolicyError> => {
    
    // 스터디가 활성화 되어 있는지 체크
    if (!Study.isActive(study)) return err({ kind: "NotActiveStudy" });
    // 게시글 작성자가 스터디 호스트인지 체크
    if (!UserId.isSelf(params.authorId, study.creatorId)) return err({ kind: "NotAuthor", authorId: params.authorId, userId: study.creatorId });

    return Post.createNew(params);
  },

  updatePostIntent: (post: Post,study: Study, userId: UserId, params: PostProps): Result<Post, PostPolicyError> => {
    if (!Study.isActive(study)) return err({ kind: "NotActiveStudy" });
    if (!UserId.isSelf(userId, post.authorId)) return err({ kind: "NotAuthor", authorId: post.authorId, userId: userId });
    return Post.update(post, params);
  },

  deletePostIntent: (post: Post, userId: UserId): Result<DeletePostIntent, PostPolicyError> => {
    if (!UserId.isSelf(userId, post.authorId)) return err({ kind: "NotAuthor", authorId: post.authorId, userId: userId });
    return Post.delete(post.id);
  }
}