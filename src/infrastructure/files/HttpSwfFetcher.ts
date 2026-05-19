import { createSwfAssetFromBuffer, type SwfAsset } from "@/domain/entities/SwfAsset";
import type { SwfUrlFetcherPort } from "@/domain/ports/SwfUrlFetcherPort";

const MAX_BYTES = 100 * 1024 * 1024;
const TIMEOUT_MS = 60_000;

export class HttpSwfFetcher implements SwfUrlFetcherPort {
  async fetch(url: string): Promise<SwfAsset> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal, mode: "cors" });
    } catch {
      throw new Error(
        "Could not download the SWF. The host may block cross-origin requests (CORS).",
      );
    } finally {
      window.clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}.`);
    }

    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_BYTES) {
      throw new Error("The remote file exceeds the 100 MB limit.");
    }

    const data = await response.arrayBuffer();
    if (data.byteLength > MAX_BYTES) {
      throw new Error("The remote file exceeds the 100 MB limit.");
    }

    const name = fileNameFromUrl(url);
    return createSwfAssetFromBuffer(name, data, url);
  }
}

function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").pop();
    if (segment && /\.swf$/i.test(segment)) return decodeURIComponent(segment);
  } catch {
    /* use fallback */
  }
  return "remote.swf";
}
