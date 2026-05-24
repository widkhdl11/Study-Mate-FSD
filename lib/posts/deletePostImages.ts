import { FileMetadata } from "@/types/file";
import { SupabaseClient } from "@supabase/supabase-js";


export async function deletePostImages(
    supabase: SupabaseClient,
    images: FileMetadata[]
):Promise<void> {
  
  const deleteImages = images.map(image => image.url);
  console.log("deleteImages : ", deleteImages)
  if (deleteImages.length === 0) {
    return;
  }
  const { data, error } = await supabase.storage.from("post-images").remove(deleteImages);
  if (error || !data) {
    console.error("Storage 삭제 실패 (고아 파일):", error);
  }
  return;
}