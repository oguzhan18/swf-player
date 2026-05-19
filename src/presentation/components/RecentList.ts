import type { AppState } from "@/application/state/AppState";
import type { PlaybackOrchestrator } from "@/application/services/PlaybackOrchestrator";
import type { RecentItem } from "@/domain/entities/RecentItem";

export class RecentList {
  readonly element: HTMLElement;
  private readonly list: HTMLUListElement;
  private readonly empty: HTMLElement;

  constructor(private readonly orchestrator: PlaybackOrchestrator) {
    this.element = document.createElement("section");
    this.element.className = "recent-list";
    this.element.setAttribute("aria-label", "Recently opened");

    const heading = document.createElement("h3");
    heading.className = "recent-list__label";
    heading.textContent = "Recent";

    this.empty = document.createElement("p");
    this.empty.className = "recent-list__empty";
    this.empty.textContent = "Opened files and URLs appear here.";

    this.list = document.createElement("ul");
    this.list.className = "recent-list__items";

    this.element.append(heading, this.empty, this.list);
  }

  render(state: AppState): void {
    const items = state.recentItems;
    this.empty.hidden = items.length > 0;
    this.list.hidden = items.length === 0;
    this.list.replaceChildren(...items.map((item) => this.createRow(item, state)));
  }

  private createRow(item: RecentItem, state: AppState): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "recent-list__item";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "recent-list__open";
    openBtn.disabled = state.phase === "loading" || state.phase === "booting";

    const name = document.createElement("span");
    name.className = "recent-list__name";
    name.textContent = item.name;

    const meta = document.createElement("span");
    meta.className = "recent-list__meta";
    meta.textContent = formatMeta(item);

    const text = document.createElement("span");
    text.className = "recent-list__text";
    text.append(name, meta);
    openBtn.append(text);

    openBtn.addEventListener("click", () => {
      void this.orchestrator.openRecent(item.id);
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "recent-list__remove";
    removeBtn.setAttribute("aria-label", `Remove ${item.name}`);
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      void this.orchestrator.removeRecent(item.id);
    });

    row.append(openBtn, removeBtn);
    return row;
  }
}

function formatMeta(item: RecentItem): string {
  const size = formatBytes(item.size);
  if (item.source === "url") return `${size} · URL`;
  if (item.storedLocally) return `${size} · Local`;
  return `${size} · Re-select required`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
