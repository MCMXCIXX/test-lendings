# Test Lendings

Two unique French personality-quiz white pages + a chooser hub for GitHub Pages.

## Live demo

After enabling GitHub Pages (Settings → Pages → Deploy from branch `main` / root):

**https://mcmxcixx.github.io/test-lendings/**

- Hub chooser: `/`
- Site A: `/site-a/`
- Site B: `/site-b/`

## Structure

```
index.html      ← beautiful chooser (pick A or B)
hub.css
site-a/         ← Bondeskovgaard Cleaning ApS (dark elegant)
site-b/         ← Clouds Taking Shape ApS (light airy)
```

## Local preview

```bash
npx serve . -l 5175
```

Open http://localhost:5175

## Stack

Pure HTML + CSS + vanilla JS. No build step.
