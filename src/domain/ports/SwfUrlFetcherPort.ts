import type { SwfAsset } from "@/domain/entities/SwfAsset";

export interface SwfUrlFetcherPort {
  fetch(url: string): Promise<SwfAsset>;
}
