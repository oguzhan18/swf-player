import type { AppState } from "@/application/state/AppState";
import type { PlaybackOrchestrator } from "@/application/services/PlaybackOrchestrator";

export class DropZone {
  readonly element: HTMLElement;
  private readonly fileInput: HTMLInputElement;
  private hidden = false;

  constructor(private readonly orchestrator: PlaybackOrchestrator) {
    this.element = document.createElement("section");
    this.element.className = "drop-zone";
    this.element.setAttribute("role", "region");
    this.element.setAttribute("aria-label", "SWF file drop zone");

    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = ".swf,application/x-shockwave-flash";
    this.fileInput.hidden = true;
    this.fileInput.addEventListener("change", () => this.handlePicker());

    this.element.innerHTML = `
      <div class="drop-zone__inner">
        <div class="drop-zone__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4v16M10 14l6-6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 22v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h2 class="drop-zone__title">Drop your SWF file here</h2>
        <p class="drop-zone__hint">or click to browse — classic Flash games run in your browser</p>
        <button type="button" class="drop-zone__button">Choose file</button>
      </div>
    `;

    this.element.appendChild(this.fileInput);
    this.bindEvents();
  }

  render(state: AppState): void {
    const hasGame = state.asset !== null && state.phase !== "error";
    this.hidden = hasGame;
    this.element.classList.toggle("drop-zone--active", state.isDragActive);
    this.element.classList.toggle("drop-zone--loading", state.phase === "loading" || state.phase === "booting");

    const title = this.element.querySelector(".drop-zone__title");
    if (title) {
      if (state.phase === "loading") {
        title.textContent = "Loading SWF…";
      } else if (state.phase === "booting") {
        title.textContent = "Starting player…";
      } else {
        title.textContent = "Drop your SWF file here";
      }
    }
  }

  openPicker(): void {
    this.fileInput.click();
  }

  private bindEvents(): void {
    const button = this.element.querySelector(".drop-zone__button");
    button?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openPicker();
    });

    this.element.addEventListener("click", () => {
      if (!this.hidden) this.openPicker();
    });

    ["dragenter", "dragover"].forEach((event) => {
      this.element.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.orchestrator.setDragActive(true);
      });
    });

    ["dragleave", "drop"].forEach((event) => {
      this.element.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (event === "dragleave" && !this.element.contains((e as DragEvent).relatedTarget as Node)) {
          this.orchestrator.setDragActive(false);
        }
      });
    });

    this.element.addEventListener("drop", (e) => {
      this.orchestrator.setDragActive(false);
      const file = (e as DragEvent).dataTransfer?.files.item(0);
      if (file) void this.orchestrator.openFile(file);
    });
  }

  private handlePicker(): void {
    const file = this.fileInput.files?.item(0);
    this.fileInput.value = "";
    if (file) void this.orchestrator.openFile(file);
  }
}
