import type { SwfAsset } from "@/domain/entities/SwfAsset";

export interface FlashEnginePort {
  initialize(): Promise<void>;
  mount(container: HTMLElement): void;
  load(asset: SwfAsset): Promise<void>;
  unload(): void;
  play(): void;
  pause(): void;
  setVolume(level: number): void;
  isPlaying(): boolean;
  destroy(): void;
}
