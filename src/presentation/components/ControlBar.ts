import type { AppState } from "@/application/state/AppState";
import type { PlaybackOrchestrator } from "@/application/services/PlaybackOrchestrator";

export class ControlBar {
  readonly element: HTMLElement;
  private readonly fileNameEl: HTMLElement;
  private readonly metaEl: HTMLElement;
  private readonly playBtn: HTMLButtonElement;
  private readonly volumeInput: HTMLInputElement;
  private readonly fullscreenBtn: HTMLButtonElement;
  private readonly closeBtn: HTMLButtonElement;

  constructor(private readonly orchestrator: PlaybackOrchestrator) {
    this.element = document.createElement("div");
    this.element.className = "control-bar control-bar--hidden";
    this.element.setAttribute("role", "toolbar");
    this.element.setAttribute("aria-label", "Playback controls");

    this.fileNameEl = document.createElement("span");
    this.fileNameEl.className = "control-bar__name";

    this.metaEl = document.createElement("span");
    this.metaEl.className = "control-bar__meta";

    this.playBtn = document.createElement("button");
    this.playBtn.type = "button";
    this.playBtn.className = "control-bar__btn";
    this.playBtn.setAttribute("aria-label", "Play or pause");
    this.playBtn.textContent = "Pause";

    this.volumeInput = document.createElement("input");
    this.volumeInput.type = "range";
    this.volumeInput.min = "0";
    this.volumeInput.max = "100";
    this.volumeInput.value = "100";
    this.volumeInput.className = "control-bar__volume";
    this.volumeInput.setAttribute("aria-label", "Volume");

    this.fullscreenBtn = document.createElement("button");
    this.fullscreenBtn.type = "button";
    this.fullscreenBtn.className = "control-bar__btn control-bar__btn--ghost";
    this.fullscreenBtn.textContent = "Fullscreen";
    this.fullscreenBtn.setAttribute("aria-label", "Enter fullscreen");

    this.closeBtn = document.createElement("button");
    this.closeBtn.type = "button";
    this.closeBtn.className = "control-bar__btn control-bar__btn--ghost";
    this.closeBtn.textContent = "Close";
    this.closeBtn.setAttribute("aria-label", "Unload game");

    const group = document.createElement("div");
    group.className = "control-bar__group";
    group.append(this.playBtn, this.volumeInput, this.fullscreenBtn, this.closeBtn);

    const info = document.createElement("div");
    info.className = "control-bar__info";
    info.append(this.fileNameEl, this.metaEl);

    this.element.append(info, group);
    this.bindEvents();
  }

  render(state: AppState): void {
    const visible = state.asset !== null && state.phase !== "error" && state.phase !== "booting";
    this.element.classList.toggle("control-bar--hidden", !visible);

    if (!state.asset) return;

    this.fileNameEl.textContent = state.asset.name;
    this.metaEl.textContent = formatBytes(state.asset.size);
    this.playBtn.textContent = state.phase === "playing" ? "Pause" : "Play";
    this.volumeInput.value = String(Math.round(state.volume * 100));

    const fullscreenActive = state.isFullscreen;
    this.fullscreenBtn.textContent = fullscreenActive ? "Exit fullscreen" : "Fullscreen";
    this.fullscreenBtn.setAttribute(
      "aria-label",
      fullscreenActive ? "Exit fullscreen" : "Enter fullscreen",
    );
    this.fullscreenBtn.disabled = !this.orchestrator.canUseFullscreen();
  }

  private bindEvents(): void {
    this.playBtn.addEventListener("click", () => this.orchestrator.togglePlay());
    this.volumeInput.addEventListener("input", () => {
      const level = Number(this.volumeInput.value) / 100;
      this.orchestrator.setVolume(level);
    });
    this.fullscreenBtn.addEventListener("click", () => {
      void this.orchestrator.toggleFullscreen();
    });
    this.closeBtn.addEventListener("click", () => {
      void this.orchestrator.unload();
    });
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
