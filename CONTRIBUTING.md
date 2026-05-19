# Contributing

Thank you for your interest in SWF Player.

## Development setup

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck
npm run build
```

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep changes focused; match existing code style (TypeScript strict, minimal comments).
3. UI copy stays in English.
4. Describe what changed and how you tested it.

## Reporting issues

Use [GitHub Issues](https://github.com/oguzhan18/swf-player/issues) and include:

- Browser and OS
- Steps to reproduce
- Expected vs actual behavior
- SWF source (local file vs URL) when relevant

## Ruffle compatibility

Not every Flash game works in Ruffle. If playback fails for a specific SWF, check whether [Ruffle](https://github.com/ruffle-rs/ruffle/issues) already tracks the limitation before filing here.
