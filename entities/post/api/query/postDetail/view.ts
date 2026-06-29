import { PostResponse } from "@/entities/post/model/types";
import { StudyDetailCreatorView } from "@/entities/study/api/query/studyDetail/view";
import { StudyResponse } from "@/entities/study/model/types";
import { ProfileResponse } from "@/entities/user/model/types";


export type PostDetailStudyView = Pick<StudyResponse, 
"id" | "title" | "description" | "studyCategory" | "region" | "maxParticipants" | "currentParticipants" | "status" | "createdAt">;


export type PostDetailCreatorView = Pick<ProfileResponse, 
"id" | "username" | "email" | "avatarUrl">;

export type PostDetailView =
PostResponse &
{
    study: PostDetailStudyView,
    author: StudyDetailCreatorView,
}