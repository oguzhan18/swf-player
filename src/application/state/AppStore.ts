import type { AppState } from "@/application/state/AppState";
import { initialAppState } from "@/application/state/AppState";

type Listener = (state: AppState) => void;

export class AppStore {
  private state: AppState = initialAppState;
  private readonly listeners = new Set<Listener>();

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  patch(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  reset(): void {
    this.state = initialAppState;
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
