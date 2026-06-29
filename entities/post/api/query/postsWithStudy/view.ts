import { PostResponse } from "@/entities/post/model/types";
import { StudyResponse } from "@/entities/study";


type PostWithStudyView = PostResponse & {
    study: StudyResponse
}

export type PostsWithStudyView = PostWithStudyView[]