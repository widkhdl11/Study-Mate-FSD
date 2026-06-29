import { PostRow } from "@/entities/post/model/Post";
import { StudyRow } from "@/entities/study/model/Study";
import { ProfileRow } from "@/entities/user/model/Profile";

export type PostDetailStudyRow = Pick<StudyRow,
 "id" 
 | "title" 
 | "description" 
 | "study_category" 
 | "region" 
 | "status" 
 | "max_participants" 
 | "current_participants" 
 | "created_at">


export type PostDetailCreatorRow = Pick<ProfileRow, 
"id" 
| "username" 
| "email" 
| "avatar_url">


// PostRow와 PostDetailStudyRow, PostDetailCreatorRow를 조인한 타입
export type PostDetailQueryRow = PostRow & {
    study :PostDetailStudyRow;
    author :PostDetailCreatorRow;
}