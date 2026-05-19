import type { SwfAsset } from "@/domain/entities/SwfAsset";
import type { FlashEnginePort } from "@/domain/ports/FlashEnginePort";

export class RuffleFlashEngine implements FlashEnginePort {
  private player: RufflePlayerElement | null = null;
  private container: HTMLElement | null = null;
  private ready = false;

  async initialize(): Promise<void> {
    await waitForRuffleReady();
    this.ready = true;
  }

  mount(container: HTMLElement): void {
    this.container = container;
  }

  async load(asset: SwfAsset): Promise<void> {
    this.ensureReady();
    const api = window.RufflePlayer?.newest?.();
    if (!api) {
      throw new Error("Ruffle is not available");
    }

    this.unload();
    const player = api.createPlayer();
    player.className = "ruffle-player";
    this.container?.appendChild(player);
    this.player = player;

    await player.ruffle().load({
      data: asset.data,
      swfFileName: asset.name,
      autoplay: true,
      letterbox: "on",
      unmuteOverlay: "visible",
    });
  }

  unload(): void {
    if (this.player) {
      this.player.ruffle().destroy();
      this.player.remove();
      this.player = null;
    }
  }

  play(): void {
    this.player?.ruffle().play();
  }

  pause(): void {
    this.player?.ruffle().pause();
  }

  setVolume(level: number): void {
    this.player?.ruffle().setVolume(level);
  }

  isPlaying(): boolean {
    return this.player?.ruffle().isPlaying() ?? false;
  }

  destroy(): void {
    this.unload();
    this.ready = false;
  }

  private ensureReady(): void {
    if (!this.ready) {
      throw new Error("Engine not initialized");
    }
    if (!this.container) {
      throw new Error("Player container not mounted");
    }
  }
}

function waitForRuffleReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 30_000;

    const tick = (): void => {
      if (window.RufflePlayer?.newest?.()) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error("Ruffle failed to load"));
        return;
      }
      requestAnimationFrame(tick);
    };

    tick();
  });
}
