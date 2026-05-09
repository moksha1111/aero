# Aero — Apple-style drone landing with scroll-tied canvas video

> Apple-flagship-style drone landing page. Every video frame is pre-decoded to an `ImageBitmap` during the loader; scrolling plays the cached frames on a canvas — no `currentTime` scrubbing, ever.

**[Live demo →](https://aero-hnpd.onrender.com)**

![preview](docs/preview.gif)

## What it does

A landing page where the hero drone disassembles as the user scrolls through a sticky 4-viewport-tall section, with fade-in spec cards for propulsion, imaging, intelligence, and airframe. Frame playback is canvas-based to dodge the lag of seeking a `<video>` element on production hardware.

## Tech

React 18 · Vite · Tailwind CSS v3 · Canvas 2D · `requestVideoFrameCallback`

## Highlights

- **Frame extractor** (`src/lib/frameExtractor.js`) downloads the source video as a blob, plays it muted at 4× into a hidden `<video>`, and grabs each decoded frame via `requestVideoFrameCallback` as an `ImageBitmap`
- Scroll handler is rAF-throttled and writes directly to refs / styles — **zero React re-renders during scroll**
- DPR-aware canvas sizing (capped at 2) for crisp output without wasted pixel work on retina mobile
- Cards use opaque dark fills instead of `backdrop-filter` so the compositor isn't repainting blurred surfaces during scroll
- Specs cards fade-in / slide-in across staggered scroll ranges so the disassembly reads as a guided tour

## Run locally

```bash
npm install
npm run dev    # http://localhost:5198
```
