import { FileMetadata } from "@/types/file";
import { TablesInsert } from "@/types_db";
import { PostFormValues } from "../zod/schemas/postSchema";
type PostInsert = TablesInsert<"posts">;

export function buildPostInsert(
  validated: PostFormValues,
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