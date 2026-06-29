export const GENDERS = ["male", "female"] as const  
export type Gender = (typeof GENDERS)[number]        

// 런타임 가드 (신뢰경계에서 unknown string → Gender)
export const isGender = (v: string): v is Gender =>
  (GENDERS as readonly string[]).includes(v)

export const GENDER_LABEL: Record<Gender, string> = {
    male: "남성",
    female: "여성" 
}
