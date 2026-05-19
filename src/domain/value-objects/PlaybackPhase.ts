export type PlaybackPhase =
  | "idle"
  | "booting"
  | "loading"
  | "ready"
  | "playing"
  | "error";

export interface PlaybackError {
  readonly code:
    | "invalid_file"
    | "read_failed"
    | "engine_failed"
    | "unsupported"
    | "fetch_failed"
    | "recent_unavailable";
  readonly message: string;
}
