export type RecentSource = "file" | "url";

export interface RecentItem {
  readonly id: string;
  readonly source: RecentSource;
  readonly name: string;
  readonly size: number;
  readonly openedAt: number;
  readonly url?: string;
  readonly storedLocally: boolean;
  readonly pinned?: boolean;
}
