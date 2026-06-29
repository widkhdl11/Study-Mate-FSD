import { File as FileType } from "@/shared/lib/file";
import { logError } from "@/shared/lib/logError";
import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadPostImages( 
  supabase: SupabaseClient,
  images: File[]
): Promise<FileType[]> {
  const imageData  : FileType[] = []
  
  for (const image of images) {
    if (image instanceof File && image.size > 0) {
      const uuid = crypto.randomUUID();
      const extension = image.name.split('.').pop() || '';
      const fileName = `${uuid}.${extension}`;
      
      const { data, error } = await supabase.storage
        .from("post-images")
        .upload(fileName, image);

      if (data) {
        imageData.push({
          id: uuid,
          url: data.path,
          originalName: image.name,
          size: image.size,
        });
      } 

      if (error) {
        await supabase.storage.from("post-images").remove(imageData.map(d => d.url));
        logError('uploadPostImages', error)
        throw new Error("이미지 업로드에 실패했습니다.");
      }
    }
    console.log('imageData', imageData)
  }
  return imageData;
}
