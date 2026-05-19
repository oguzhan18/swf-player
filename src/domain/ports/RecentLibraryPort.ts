import type { RecentItem } from "@/domain/entities/RecentItem";
import type { SwfAsset } from "@/domain/entities/SwfAsset";

export interface RecentLibraryPort {
  list(): Promise<RecentItem[]>;
  rememberFile(asset: SwfAsset): Promise<RecentItem>;
  rememberUrl(asset: SwfAsset, url: string): Promise<RecentItem>;
  loadFile(id: string): Promise<SwfAsset | null>;
  remove(id: string): Promise<void>;
}
