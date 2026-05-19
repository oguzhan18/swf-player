import type { AppState } from "@/application/state/AppState";

export class ErrorBanner {
  readonly element: HTMLElement;
  private messageEl: HTMLElement;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "error-banner error-banner--hidden";
    this.element.setAttribute("role", "alert");

    this.messageEl = document.createElement("p");
    this.messageEl.className = "error-banner__message";
    this.element.appendChild(this.messageEl);
  }

  render(state: AppState): void {
    const visible = state.phase === "error" && state.error !== null;
    this.element.classList.toggle("error-banner--hidden", !visible);
    if (state.error) {
      this.messageEl.textContent = state.error.message;
    }
  }
}
