
export interface ActionError {
  message: string;
  field?: string;
}

export type ActionResponse<T = void> =
  | (T extends void
      ? { success: true }
      : { success: true; data: T })
  | { success: false; error: ActionError };