/**
 * Returns `value` only if it is a same-origin path ("/app", "/app/systems?x=1").
 * Anything else (absolute URLs, protocol-relative "//evil.com", backslash tricks,
 * control characters) falls back, which prevents open redirects after login.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/app"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
