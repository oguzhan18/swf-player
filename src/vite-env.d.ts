/// <reference types="vite/client" />

interface RufflePlayerGlobal {
  newest?: () => RuffleSourceApi;
  config?: {
    polyfills?: boolean;
    publicPath?: string;
  };
}

interface RufflePlayerWindow {
  RufflePlayer?: RufflePlayerGlobal;
}

interface RuffleSourceApi {
  createPlayer: () => RufflePlayerElement;
}

interface RufflePlayerElement extends HTMLElement {
  ruffle: () => RuffleInstance;
}

interface RuffleInstance {
  load: (options: RuffleLoadOptions) => Promise<void>;
  destroy: () => void;
  pause: () => void;
  play: () => void;
  setVolume: (volume: number) => void;
  isPlaying: () => boolean;
}

interface RuffleLoadOptions {
  url?: string;
  data?: ArrayBuffer | Uint8Array;
  swfFileName?: string;
  autoplay?: boolean;
  letterbox?: "on" | "off" | "fullscreen";
  unmuteOverlay?: "visible" | "hidden";
}

interface Window extends RufflePlayerWindow {}
