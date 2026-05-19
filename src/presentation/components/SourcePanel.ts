import type { AppState } from "@/application/state/AppState";
import type { PlaybackOrchestrator } from "@/application/services/PlaybackOrchestrator";
import { DropZone } from "@/presentation/components/DropZone";
import { RecentList } from "@/presentation/components/RecentList";
import { UrlLoader } from "@/presentation/components/UrlLoader";

export class SourcePanel {
  readonly element: HTMLElement;
  private readonly dropZone: DropZone;
  private readonly urlLoader: UrlLoader;
  private readonly recentList: RecentList;

  constructor(orchestrator: PlaybackOrchestrator) {
    this.element = document.createElement("section");
    this.element.className = "source-panel";
    this.element.setAttribute("aria-label", "Load SWF");

    this.dropZone = new DropZone(orchestrator);
    this.urlLoader = new UrlLoader(orchestrator);
    this.recentList = new RecentList(orchestrator);

    this.element.append(this.dropZone.element, this.urlLoader.element, this.recentList.element);
  }

  render(state: AppState): void {
    const hasGame = state.asset !== null && state.phase !== "error";
    this.element.classList.toggle("source-panel--hidden", hasGame);
    this.dropZone.render(state);
    this.urlLoader.render(state);
    this.recentList.render(state);
  }
}
