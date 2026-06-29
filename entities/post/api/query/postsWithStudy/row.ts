import { PostRow } from "@/entities/post/model/Post"
import { StudyRow } from "@/entities/study/model/Study"


type PostWithStudyRow = PostRow & {
    study: StudyRow
}

export type PostsWithStudyRow = PostWithStudyRow[]