type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

export function isFullscreenSupported(): boolean {
  const doc = document as FullscreenDocument;
  return Boolean(document.fullscreenEnabled ?? doc.webkitExitFullscreen);
}

export function isElementFullscreen(element: HTMLElement): boolean {
  const doc = document as FullscreenDocument;
  const active = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
  return active === element;
}

export async function requestElementFullscreen(element: HTMLElement): Promise<void> {
  const el = element as FullscreenElement;
  if (el.requestFullscreen) {
    await el.requestFullscreen();
    return;
  }
  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen();
  }
}

export async function exitDocumentFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (doc.fullscreenElement && doc.exitFullscreen) {
    await doc.exitFullscreen();
    return;
  }
  if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  }
}
