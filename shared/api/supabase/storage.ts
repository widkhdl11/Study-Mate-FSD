export function getImageUrl(path?: string | null) {
  if (!path) return '/placeholder.svg'
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.NEXT_PUBLIC_STORAGE_BUCKET_POST}/${path}`;
}

export function getProfileImageUrl(path?: string | null) {
  if (!path) return '/default-profile.png' // 프로필 사진 미등록 시 기본 이미지
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.NEXT_PUBLIC_STORAGE_BUCKET_PROFILE}/${path}`;
}
