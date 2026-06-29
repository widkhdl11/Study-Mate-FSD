
export function parseFormData(
    formData: FormData,  
    options?: { arrayKeys: string[] }
): Record<string, FormDataEntryValue|FormDataEntryValue[]> 
{
 // 폼 객체 key 값을 순회.
const result: Record<string, FormDataEntryValue|FormDataEntryValue[]> = {}
const entries = formData.entries()

// for (const pair of entries) {
//   const key = pair[0]
//   const value = pair[1]
//  if (options?.arrayKeys?.includes(key)) {
//     const arr = (result[key] as FormDataEntryValue[]) ?? []
//     arr.push(value)
//     result[key] = arr
//   } else {
//     result[key] = value
//   }
// }
for (const [key, value] of formData.entries()) {
    const prev = result[key];
    const forceArray = value instanceof File || options?.arrayKeys?.includes(key);

    if (forceArray) {
      // File은 항상 배열 (단일이어도) — 네 아이디어
      result[key] = Array.isArray(prev) ? [...prev, value] : [value];
    } else if (prev !== undefined) {
      // 같은 키가 반복되면 자동 배열 (멀티셀렉트/체크박스 등)
      result[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      result[key] = value;
    }
  }
  return result
}