import { FileMetadata } from "@/shared/lib/file";
import { TablesInsert } from "@/types_db";
import { CreatePostCommand } from "@/entities/post/model/postFormSchema";
type PostInsert = TablesInsert<"posts">;

export function buildPostInsert(
  validated: CreatePostCommand,
  userId: string,
  imageData: FileMetadata[]
):PostInsert  {
  return {
    title: validated.title,
    content: validated.content,
    study_id: validated.studyId,
    image_url: imageData,
    author_id: userId,
  }
}