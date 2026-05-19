import type { AppStore } from "@/application/state/AppStore";
import type { PlaybackOrchestrator } from "@/application/services/PlaybackOrchestrator";
import { ControlBar } from "@/presentation/components/ControlBar";
import { ErrorBanner } from "@/presentation/components/ErrorBanner";
import { PlayerStage } from "@/presentation/components/PlayerStage";
import { SourcePanel } from "@/presentation/components/SourcePanel";

export class AppShell {
  readonly root: HTMLElement;
  private readonly sourcePanel: SourcePanel;
  private readonly playerStage: PlayerStage;
  private readonly controlBar: ControlBar;
  private readonly errorBanner: ErrorBanner;

  constructor(
    private readonly store: AppStore,
    private readonly orchestrator: PlaybackOrchestrator,
  ) {
    this.root = document.createElement("div");
    this.root.className = "app";
    this.root.id = "swf-player-app";

    this.sourcePanel = new SourcePanel(orchestrator);
    this.playerStage = new PlayerStage();
    this.controlBar = new ControlBar(orchestrator);
    this.errorBanner = new ErrorBanner();

    this.root.innerHTML = `
      <header class="app__header">
        <div class="app__brand">
          <div class="app__logo" aria-hidden="true">SWF</div>
          <span class="app__title">SWF Player</span>
          <span class="app__subtitle">Flash games in the browser</span>
        </div>
      </header>
      <main class="app__main">
        <div class="app__workspace"></div>
      </main>
      <footer class="app__footer">
        Powered by <a href="https://ruffle.rs/" target="_blank" rel="noopener noreferrer">Ruffle</a>
        — open source Flash runtime
      </footer>
    `;

    const workspace = this.root.querySelector(".app__workspace");
    if (!workspace) throw new Error("Workspace mount point missing");

    workspace.append(
      this.errorBanner.element,
      this.sourcePanel.element,
      this.playerStage.element,
      this.controlBar.element,
    );

    this.orchestrator.mountPlayer(this.playerStage.viewport);
    this.orchestrator.setFullscreenTarget(this.playerStage.viewport);
    this.orchestrator.bindFullscreenSync();
    this.store.subscribe((state) => this.render(state));
  }

  private render(state: ReturnType<AppStore["getState"]>): void {
    this.sourcePanel.render(state);
    this.playerStage.render(state);
    this.controlBar.render(state);
    this.errorBanner.render(state);
  }
}
