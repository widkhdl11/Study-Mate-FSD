import { PostResponse } from "@/entities/post/model/types";
import { StudyResponse } from "@/entities/study";
import { ProfileResponse } from "@/entities/user";

export type PostAllStudyCreatorView = Pick<ProfileResponse, "id" | "username" | "email" | "avatarUrl">;
export type PostAllView = PostResponse & {
    study: StudyResponse & {
        creator: PostAllStudyCreatorView
    }
}

export type PostAllViews = PostAllView[]