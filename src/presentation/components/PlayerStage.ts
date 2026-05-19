import type { AppState } from "@/application/state/AppState";

export class PlayerStage {
  readonly element: HTMLElement;
  readonly viewport: HTMLElement;

  constructor() {
    this.element = document.createElement("section");
    this.element.className = "player-stage player-stage--hidden";
    this.element.setAttribute("aria-label", "Game player");

    this.viewport = document.createElement("div");
    this.viewport.className = "player-stage__viewport";
    this.element.appendChild(this.viewport);
  }

  render(state: AppState): void {
    const visible =
      state.asset !== null &&
      (state.phase === "ready" ||
        state.phase === "playing" ||
        state.phase === "loading");

    this.element.classList.toggle("player-stage--hidden", !visible);
    this.element.classList.toggle("player-stage--loading", state.phase === "loading");
  }
}
