# SWF Player

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Ruffle](https://img.shields.io/badge/Flash-Ruffle-663399)](https://ruffle.rs/)

Play classic **Flash (`.swf`)** games in the browser — no plugin, no install. Drag and drop a file, paste a URL, or reopen something from your recent list.

**Live demo:** [oguzhan18.github.io/swf-player](https://oguzhan18.github.io/swf-player/)

## Features

- Drag & drop or file picker for local `.swf` files
- Load SWF from a remote URL (shareable `?url=` links)
- Recent files and URLs (local files up to 30 MB cached in IndexedDB)
- Playback controls: play / pause, volume, fullscreen, unload
- Runs on Windows, macOS, Linux, and mobile browsers
- Built with TypeScript, Vite, and [Ruffle](https://ruffle.rs/) (WebAssembly)

## Quick start

```bash
git clone https://github.com/oguzhan18/swf-player.git
cd swf-player
npm install
npm run dev
```

Open the URL from the terminal (usually `http://localhost:5173`).

### Deep link

```
https://oguzhan18.github.io/swf-player/?url=https://example.com/game.swf
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check |

## GitHub Pages

1. Fork or push this repo to [github.com/oguzhan18/swf-player](https://github.com/oguzhan18/swf-player).
2. In the repo: **Settings → Pages → Build and deployment → Source:** GitHub Actions.
3. Push to `main`. The workflow deploys to `https://oguzhan18.github.io/swf-player/`.

Local Pages build:

```bash
VITE_BASE_PATH=/swf-player/ npm run build
npm run preview
```

## Architecture

```
src/
  domain/          Entities, value objects, ports
  application/     State, orchestrator, routing
  infrastructure/  Ruffle, HTTP fetch, persistence
  presentation/    UI components and styles
```

## Third-party software

Flash playback is provided by [**Ruffle**](https://ruffle.rs/) (`@ruffle-rs/ruffle`), licensed under MIT OR Apache-2.0. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Author

**Oğuzhan ÇART** — [@oguzhan18](https://github.com/oguzhan18)

- Website: [oguzhancart.dev](https://oguzhancart.dev/)
- LinkedIn: [Oğuzhan ÇART](https://www.linkedin.com/in/o%C4%9Fuzhan-%C3%A7art-b73405199)

## License

[MIT](LICENSE) © 2026 Oğuzhan ÇART
