export function readSwfUrlFromLocation(): string | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("url") ?? params.get("swf");
  if (!value) return null;
  return value.trim() || null;
}

export function writeSwfUrlToLocation(url: string | null): void {
  const next = new URL(window.location.href);
  next.searchParams.delete("url");
  next.searchParams.delete("swf");

  if (url) {
    next.searchParams.set("url", url);
  }

  window.history.replaceState({}, "", next);
}

export function parseRemoteSwfUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}
