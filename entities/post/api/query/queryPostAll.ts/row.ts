import { PostRow } from "@/entities/post/model/Post";
import { StudyRow } from "@/entities/study/model/Study";
import { ProfileRow } from "@/entities/user/model/Profile";

export type PostAllStudyCreatorRow = Pick<ProfileRow, "id" | "username" | "email" | "avatar_url">;

export type PostAllStudyRow = PostRow & {
    study: StudyRow & {
        creator: PostAllStudyCreatorRow
    }
}
export type PostAllQueryRow = PostAllStudyRow[]
