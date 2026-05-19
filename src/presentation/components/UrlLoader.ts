import type { AppState } from "@/application/state/AppState";
import type { PlaybackOrchestrator } from "@/application/services/PlaybackOrchestrator";

export class UrlLoader {
  readonly element: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly button: HTMLButtonElement;

  constructor(private readonly orchestrator: PlaybackOrchestrator) {
    this.element = document.createElement("section");
    this.element.className = "url-loader";
    this.element.setAttribute("aria-label", "Load SWF from URL");

    const label = document.createElement("h3");
    label.className = "url-loader__label";
    label.textContent = "Load from URL";

    this.input = document.createElement("input");
    this.input.type = "url";
    this.input.className = "url-loader__input";
    this.input.placeholder = "https://example.com/game.swf";
    this.input.setAttribute("aria-label", "SWF URL");
    this.input.autocomplete = "off";
    this.input.spellcheck = false;

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "url-loader__button";
    this.button.textContent = "Load URL";

    const row = document.createElement("div");
    row.className = "url-loader__row";

    this.element.append(label, row);
    row.append(this.input, this.button);
    this.bindEvents();
  }

  render(state: AppState): void {
    const loading = state.phase === "loading" || state.phase === "booting";
    this.input.disabled = loading;
    this.button.disabled = loading;
    this.element.classList.toggle("url-loader--loading", loading);
  }

  private bindEvents(): void {
    this.button.addEventListener("click", () => this.submit());
    this.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") this.submit();
    });
  }

  private submit(): void {
    void this.orchestrator.openUrl(this.input.value);
  }
}
