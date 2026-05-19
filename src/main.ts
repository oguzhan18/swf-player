import "@/presentation/styles/global.css";
import "@/presentation/styles/app.css";
import "@/presentation/styles/drop-zone.css";
import "@/presentation/styles/source-panel.css";
import "@/presentation/styles/player.css";

import { PlaybackOrchestrator } from "@/application/services/PlaybackOrchestrator";
import { AppStore } from "@/application/state/AppStore";
import { BrowserSwfFileReader } from "@/infrastructure/files/BrowserSwfFileReader";
import { HttpSwfFetcher } from "@/infrastructure/files/HttpSwfFetcher";
import { RecentLibrary } from "@/infrastructure/persistence/RecentLibrary";
import { RuffleFlashEngine } from "@/infrastructure/ruffle/RuffleFlashEngine";
import { AppShell } from "@/presentation/AppShell";

async function bootstrap(): Promise<void> {
  const mount = document.getElementById("app");
  if (!mount) throw new Error("#app mount point not found");

  const store = new AppStore();
  const orchestrator = new PlaybackOrchestrator(
    store,
    new BrowserSwfFileReader(),
    new HttpSwfFetcher(),
    new RecentLibrary(),
    new RuffleFlashEngine(),
  );

  const shell = new AppShell(store, orchestrator);
  mount.replaceChildren(shell.root);

  await orchestrator.bootstrap();
  await orchestrator.consumeLocationUrl();

  window.addEventListener("beforeunload", () => orchestrator.destroy());
}

void bootstrap();
