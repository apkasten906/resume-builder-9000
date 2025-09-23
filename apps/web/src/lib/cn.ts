export function cn(...xs: (string | false | undefined | null)[]): string {
  return xs.filter(Boolean).join(' ');
}
