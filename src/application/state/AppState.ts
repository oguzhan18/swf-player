import type { RecentItem } from "@/domain/entities/RecentItem";
import type { SwfAsset } from "@/domain/entities/SwfAsset";
import type { PlaybackError, PlaybackPhase } from "@/domain/value-objects/PlaybackPhase";

export interface AppState {
  readonly phase: PlaybackPhase;
  readonly asset: SwfAsset | null;
  readonly error: PlaybackError | null;
  readonly isDragActive: boolean;
  readonly volume: number;
  readonly isFullscreen: boolean;
  readonly recentItems: RecentItem[];
}

export const initialAppState: AppState = {
  phase: "idle",
  asset: null,
  error: null,
  isDragActive: false,
  volume: 1,
  isFullscreen: false,
  recentItems: [],
};
