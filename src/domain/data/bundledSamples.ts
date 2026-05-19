import type { RecentItem } from "@/domain/entities/RecentItem";

export interface BundledSample {
  readonly id: string;
  readonly name: string;
  readonly file: string;
  readonly size: number;
}

export const BUNDLED_SAMPLES: BundledSample[] = [
  { id: "hobo-1", name: "Hobo", file: "hobo.swf", size: 4_915_712 },
  { id: "hobo-2", name: "Hobo 2 — Prison Brawl", file: "hobo-2-prison-brawl.swf", size: 5_138_816 },
  { id: "hobo-3", name: "Hobo 3 — Wanted", file: "hobo-3-wanted.swf", size: 5_660_672 },
  { id: "hobo-4", name: "Hobo 4 — Total War", file: "hobo-4-total-war.swf", size: 6_291_456 },
  {
    id: "hobo-5",
    name: "Hobo 5 — Space Brawl",
    file: "hobo-5-space-brawl.swf",
    size: 8_077_312,
  },
  { id: "hobo-6", name: "Hobo 6 — Hell", file: "hobo-6-hell.swf", size: 6_815_744 },
  { id: "hobo-7", name: "Hobo 7 — Heaven", file: "hobo-7-heaven.swf", size: 7_127_040 },
];

export function resolveBundledSwfUrl(file: string): string {
  const path = `${import.meta.env.BASE_URL}samples/${file}`.replace(/\/{2,}/g, "/");
  return new URL(path, window.location.origin).href;
}

export function getBundledRecentItems(): RecentItem[] {
  return BUNDLED_SAMPLES.map((sample) => ({
    id: `bundled:${sample.id}`,
    source: "url" as const,
    name: sample.name,
    size: sample.size,
    openedAt: 0,
    url: resolveBundledSwfUrl(sample.file),
    storedLocally: false,
    pinned: true,
  }));
}

export function isBundledRecentId(id: string): boolean {
  return id.startsWith("bundled:");
}
