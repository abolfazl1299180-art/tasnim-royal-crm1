export function normalizeIranianMobile(value: string): string {
  const raw = value.trim().replace(/[\s()-]/g, "");
  if (!raw) return "";
  if (raw.startsWith("0098")) return `+98${raw.slice(4)}`;
  if (raw.startsWith("+98")) return `+98${raw.slice(3)}`;
  if (raw.startsWith("98")) return `+98${raw.slice(2)}`;
  if (raw.startsWith("09")) return `+98${raw.slice(1)}`;
  return raw;
}

export function isIranianMobile(value: string): boolean {
  return /^\+989\d{9}$/.test(normalizeIranianMobile(value));
}
