export function logError(scope: string, error: unknown, ctx?: Record<string, unknown>) {
  console.error(`[${scope}]`, { error, ...ctx }); 
}