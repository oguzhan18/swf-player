export function ensureRuffleLoaded(): Promise<void> {
  const player = (window.RufflePlayer ??= {});
  player.config = {
    polyfills: false,
    publicPath: `${import.meta.env.BASE_URL}ruffle/`,
  };

  if (player.newest?.()) {
    return Promise.resolve();
  }

  return injectScript(`${import.meta.env.BASE_URL}ruffle/ruffle.js`);
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-ruffle="true"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Ruffle script failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.ruffle = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Ruffle script failed"));
    document.head.appendChild(script);
  });
}
