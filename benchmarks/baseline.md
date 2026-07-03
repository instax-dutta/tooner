# Tooner Performance Baselines

**Established:** 2026-07-03
**Environment:** Browser (Chrome/Edge), Netlify deployment

---

## Conversion Pipeline

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time-to-first-chunk (10MB PDF) | < 5s | `benchmarkConversion()` in `src/utils/benchmarks.js` |
| Memory peak (50-sheet XLSX) | < 200MB | Browser DevTools Performance tab |
| Total pipeline (1MB DOCX) | < 2s | `benchmarkConversion()` |

## Bundle Size

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Core JS (gzipped) | < 80KB | `npx vite-bundle-visualizer` |
| Initial JS (main chunk) | < 50KB gzipped | Vite build output |
| Largest lazy chunk | < 150KB gzipped | Vite build output |

## Core Web Vitals

| Metric | Target | How to Measure |
|--------|--------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse, Web Vitals library |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse, Web Vitals library |
| FID (First Input Delay) | < 100ms | Lighthouse, Web Vitals library |

---

## How to Establish Baselines

1. Run `npm run build` and check the Vite output for chunk sizes
2. Open the deployed app, open DevTools Performance tab
3. Drop a 10MB PDF and measure conversion time in the console (benchmarks.js logs timing)
4. Run Lighthouse audit on the landing page for Core Web Vitals
5. Record numbers here and in git commit message for future comparison

## Regression Detection

- Compare against these numbers before each release
- If any metric exceeds 2x the baseline, investigate before shipping
- Add automated benchmark tests in CI if timing becomes critical
