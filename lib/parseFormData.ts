
export function parseFormData(
    formData: FormData,  
    options?: { arrayKeys: string[] }
): Record<string, FormDataEntryValue|FormDataEntryValue[]> 
{
 // 폼 객체 key 값을 순회.
const result: Record<string, FormDataEntryValue|FormDataEntryValue[]> = {}
const entries = formData.entries()

for (const pair of entries) {
  const key = pair[0]
  const value = pair[1]
 if (options?.arrayKeys?.includes(key)) {
  const arr = (result[key] as FormDataEntryValue[]) ?? []
  arr.push(value)
  result[key] = arr
} else {
  result[key] = value
}

}
  return result
}