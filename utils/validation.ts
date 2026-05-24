import { ActionResponse } from "@/types/actionType";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

export function validateWithZod<T>(
  schema: z.ZodType<T>,
  data: Record<string, FormDataEntryValue|FormDataEntryValue[]>
): ActionResponse<T> {
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
  const baseResolver = zodResolver(schema as any);

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
