export function formatGender(gender: string): string {
  if (gender === "male") {
    return "남자";
  } else if (gender === "female") {
    return "여자";
  } else {
    return "미지정";
  }
}

export function isRedirect(error: Error): boolean {
  return error.message === "NEXT_REDIRECT";
}

export function formatDateToInput(date: Date | undefined): string {
  if (!date) return "";
  return date.toISOString().split('T')[0];
}

export function parseInputToDate(value: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value);
}
