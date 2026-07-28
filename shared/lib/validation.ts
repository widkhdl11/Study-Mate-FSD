import { ActionError } from "@/shared/kernel/actionType";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

export function validateWithZod<T>(
  schema: z.ZodType<T>,
  // safeParse는 미검증 입력(unknown)을 받아 검증 후 T로 좁힌다. 검증 전 값을 T로 강제하면 parseFormData의 loose Record가 들어가지 못함.
  data: unknown
  // 성공 시 항상 data를 반환 → kernel ActionResponse<T>의 조건부 타입(제네릭 T 미해결) 대신 명시 union
): { success: true; data: T } | { success: false; error: ActionError } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: {
        message: firstError.message,
        field: firstError.path[0] as string,
      },
    };
  }
  return { success: true, data: result.data };
}

export function zodResolverFirstError<T extends z.ZodType>(schema: T) {
  // 폼별 타입에 무관하게 동작해야 하는 RHF resolver 어댑터 — any가 의도적(제네릭 escape hatch).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseResolver = zodResolver(schema as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (values: any, context: any, options: any) => {
    const result = await baseResolver(values, context, options);

    if (result.errors && Object.keys(result.errors).length > 0) {
      const firstKey = Object.keys(result.errors)[0];
      return {
        values: result.values,
        errors: { [firstKey]: result.errors[firstKey] },
      };
    }

    return result;
  };
}
