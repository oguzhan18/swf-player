# Publish to GitHub (oguzhan18)

Run these commands from the project root after [creating an empty repository](https://github.com/new) named `swf-player` under **oguzhan18** (do not add a README on GitHub).

```bash
git init
git add .
git commit -m "Initial release: SWF Player"
git branch -M main
git remote add origin https://github.com/oguzhan18/swf-player.git
git push -u origin main
```

Then enable **Settings → Pages**:

- **Source:** Deploy from a branch  
- **Branch:** `gh-pages`  
- **Folder:** `/ (root)`

After the first workflow run completes, your demo will be at: **https://oguzhan18.github.io/swf-player/**
