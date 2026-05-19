import {
  parseRemoteSwfUrl,
  readSwfUrlFromLocation,
  writeSwfUrlToLocation,
} from "@/application/routing/locationSwfUrl";
import type { AppStore } from "@/application/state/AppStore";
import type { SwfAsset } from "@/domain/entities/SwfAsset";
import type { FlashEnginePort } from "@/domain/ports/FlashEnginePort";
import type { RecentLibraryPort } from "@/domain/ports/RecentLibraryPort";
import type { SwfFileReaderPort } from "@/domain/ports/SwfFileReaderPort";
import type { SwfUrlFetcherPort } from "@/domain/ports/SwfUrlFetcherPort";
import type { PlaybackError } from "@/domain/value-objects/PlaybackPhase";
import {
  exitDocumentFullscreen,
  isElementFullscreen,
  isFullscreenSupported,
  requestElementFullscreen,
} from "@/infrastructure/browser/fullscreen";
import { getBundledRecentItems, isBundledRecentId } from "@/domain/data/bundledSamples";
import { ensureRuffleLoaded } from "@/infrastructure/ruffle/loadRuffle";

const SWF_EXTENSION = /\.swf$/i;

type RememberMode = { kind: "file" } | { kind: "url"; url: string };

export class PlaybackOrchestrator {
  private fullscreenTarget: HTMLElement | null = null;

  constructor(
    private readonly store: AppStore,
    private readonly reader: SwfFileReaderPort,
    private readonly urlFetcher: SwfUrlFetcherPort,
    private readonly recentLibrary: RecentLibraryPort,
    private readonly engine: FlashEnginePort,
  ) {}

  async bootstrap(): Promise<void> {
    this.store.patch({ phase: "booting", error: null });
    try {
      await ensureRuffleLoaded();
      await this.engine.initialize();
      await this.refreshRecent();
      this.store.patch({ phase: "idle" });
    } catch {
      this.fail("engine_failed", "Failed to initialize the Flash runtime.");
    }
  }

  async refreshRecent(): Promise<void> {
    const bundled = getBundledRecentItems();
    const bundledUrls = new Set(bundled.map((item) => item.url));
    const saved = (await this.recentLibrary.list()).filter(
      (item) => !item.url || !bundledUrls.has(item.url),
    );
    this.store.patch({ recentItems: [...bundled, ...saved] });
  }

  async consumeLocationUrl(): Promise<void> {
    const url = readSwfUrlFromLocation();
    if (!url) return;
    await this.openUrl(url, { syncLocation: false });
  }

  mountPlayer(container: HTMLElement): void {
    this.engine.mount(container);
  }

  setFullscreenTarget(element: HTMLElement): void {
    this.fullscreenTarget = element;
  }

  bindFullscreenSync(): void {
    const sync = (): void => {
      const active = this.fullscreenTarget
        ? isElementFullscreen(this.fullscreenTarget)
        : false;
      this.store.patch({ isFullscreen: active });
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
  }

  canUseFullscreen(): boolean {
    return isFullscreenSupported();
  }

  async toggleFullscreen(): Promise<void> {
    if (!this.fullscreenTarget || !this.store.getState().asset) return;

    if (isElementFullscreen(this.fullscreenTarget)) {
      await exitDocumentFullscreen();
      return;
    }
    await requestElementFullscreen(this.fullscreenTarget);
  }

  setDragActive(active: boolean): void {
    this.store.patch({ isDragActive: active });
  }

  async openFile(file: File): Promise<void> {
    if (!SWF_EXTENSION.test(file.name)) {
      this.fail("invalid_file", "Only .swf files are supported.");
      return;
    }

    this.store.patch({ phase: "loading", error: null, isDragActive: false });
    writeSwfUrlToLocation(null);

    let asset: SwfAsset;
    try {
      asset = await this.reader.read(file);
    } catch {
      this.fail("read_failed", "Could not read the selected file.");
      return;
    }

    await this.playAsset(asset, { kind: "file" });
  }

  async openUrl(
    input: string,
    options: { syncLocation?: boolean } = { syncLocation: true },
  ): Promise<void> {
    const url = parseRemoteSwfUrl(input);
    if (!url) {
      this.fail("fetch_failed", "Enter a valid http(s) URL to a .swf file.");
      return;
    }

    this.store.patch({ phase: "loading", error: null, isDragActive: false });

    let asset: SwfAsset;
    try {
      asset = await this.urlFetcher.fetch(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not download the SWF.";
      this.fail("fetch_failed", message);
      return;
    }

    if (options.syncLocation !== false) {
      writeSwfUrlToLocation(url);
    }

    await this.playAsset(asset, { kind: "url", url });
  }

  async openRecent(id: string): Promise<void> {
    const item = this.store.getState().recentItems.find((entry) => entry.id === id);
    if (!item) return;

    this.store.patch({ phase: "loading", error: null });

    if (item.source === "url" && item.url) {
      await this.openUrl(item.url);
      return;
    }

    if (item.source === "file") {
      const asset = await this.recentLibrary.loadFile(id);
      if (!asset) {
        this.fail(
          "recent_unavailable",
          "This file is no longer cached. Choose it again from your device.",
        );
        return;
      }
      writeSwfUrlToLocation(null);
      await this.playAsset(asset, { kind: "file" });
    }
  }

  async removeRecent(id: string): Promise<void> {
    if (isBundledRecentId(id)) return;
    await this.recentLibrary.remove(id);
    await this.refreshRecent();
  }

  async unload(): Promise<void> {
    await this.exitFullscreenIfNeeded();
    this.engine.unload();
    writeSwfUrlToLocation(null);
    this.store.patch({
      phase: "idle",
      asset: null,
      error: null,
      isFullscreen: false,
    });
  }

  togglePlay(): void {
    if (this.engine.isPlaying()) {
      this.engine.pause();
      this.store.patch({ phase: "ready" });
    } else {
      this.engine.play();
      this.store.patch({ phase: "playing" });
    }
  }

  setVolume(level: number): void {
    const volume = clamp(level, 0, 1);
    this.engine.setVolume(volume);
    this.store.patch({ volume });
  }

  destroy(): void {
    this.engine.destroy();
  }

  private async playAsset(asset: SwfAsset, remember: RememberMode): Promise<void> {
    if (!isSwfBuffer(asset.data)) {
      this.fail("unsupported", "The file does not appear to be a valid SWF.");
      return;
    }

    try {
      await this.exitFullscreenIfNeeded();
      this.engine.unload();
      await this.engine.load(asset);
      this.store.patch({
        phase: "ready",
        asset,
        error: null,
      });
      this.engine.play();
      this.store.patch({ phase: "playing" });

      if (remember.kind === "file") {
        await this.recentLibrary.rememberFile(asset);
      } else {
        await this.recentLibrary.rememberUrl(asset, remember.url);
      }
      await this.refreshRecent();
    } catch {
      this.fail("engine_failed", "Failed to load the SWF into the player.");
    }
  }

  private fail(code: PlaybackError["code"], message: string): void {
    void this.exitFullscreenIfNeeded();
    this.engine.unload();
    this.store.patch({
      phase: "error",
      asset: null,
      error: { code, message },
      isDragActive: false,
      isFullscreen: false,
    });
  }

  private async exitFullscreenIfNeeded(): Promise<void> {
    if (this.fullscreenTarget && isElementFullscreen(this.fullscreenTarget)) {
      await exitDocumentFullscreen();
    }
  }
}

function isSwfBuffer(buffer: ArrayBuffer): boolean {
  const view = new Uint8Array(buffer);
  if (view.length < 3) return false;
  const tag = String.fromCharCode(view[0], view[1], view[2]);
  return tag === "FWS" || tag === "CWS" || tag === "ZWS";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
