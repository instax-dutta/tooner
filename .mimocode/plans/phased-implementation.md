# Tooner — Phased Implementation Plan

**Date:** 2026-07-03
**Scope:** Full roadmap from UI polish through distribution
**Stack:** React 19 + Vite 7 + Tailwind 4 + GSAP/Framer Motion + MarkItDownJS + @toon-format/toon

---

## Cross-Cutting Concerns (addressed upfront)

### State Management — Zustand

**Verdict: Yes, add Zustand in Phase 1.**

The current `App.jsx` uses 6 `useState` calls that create a fragile state machine (`state`/`file`/`progress`/`results`/`error`). As Phase 3 adds batch processing and model selection, this will become unmanageable. Zustand adds ~1.2KB gzipped and has zero boilerplate.

**Store shape:**
```
src/store/
  useAppStore.js        — core state machine (state, file, progress, results, error, actions)
  useSettingsStore.js   — model selector, chunk overlap config, UI prefs
```

**Migration path:**
1. Create `useAppStore` mirroring existing useState fields + actions (`handleFileSelect`, `handleCancel`, `handleReset`)
2. Replace useState calls in `App.jsx` with store selectors
3. Components read from store directly (no prop drilling through ResultsView/ProcessingView for state)
4. Phase 3 adds `useSettingsStore` for model/chunk config

### MarkItDownJS Dependency Timing

MarkItDownJS (`@markitdownjs/*`) is already the primary converter (P0). Phase 2 doesn't introduce the dependency — it removes the fallback converters that duplicate what MarkItDownJS already handles. The key timing insight:

- **Phase 1**: Keep both MarkItDown and fallbacks. No dependency changes.
- **Phase 2**: Delete fallback converters + replace tokenizer's custom optimizers with MarkItDownJS `@markitdownjs/chunking` for chunk creation. Replace `gpt-tokenizer` with MarkItDownJS's token counting if available, or keep gpt-tokenizer.
- **Risk**: If MarkItDownJS `chunking` or `ast` packages don't expose the APIs we need for .toon chunk creation, fall back to keeping the custom chunker from tokenizer.js but simplified.

### Test Coverage

Current test state: 6 test files in `src/converters/__tests__/`, all converter-focused. No component tests, no tokenizer tests, no integration tests.

**Target coverage by phase:**
- Phase 1: Add tokenizer tests (optimizeContent, createChunks, generateToonFile), add component smoke tests
- Phase 2: Refactor converter tests as fallbacks are deleted, add MarkItDown integration tests
- Phase 3: Feature tests for model selector, batch processing, chunk inspector
- Phase 4: Extension-specific tests

---

## Phase 1: UI Polish (Weeks 1–4)

**Goal:** Ship a polished, error-resilient UI with performance baselines. Score 15/24 → 20+/24.

### 1.1 Fix UI-REVIEW.md Issues

**Files to modify:**

| File | Changes |
|------|---------|
| `index.html` | Add Google Fonts link for Space Grotesk (display) + DM Sans (body) |
| `src/index.css` (or Tailwind config) | Replace `--font-family` from Inter to Space Grotesk + DM Sans; set `font-sans` to DM Sans, add `font-display` utility for Space Grotesk |
| `src/components/DropZone.jsx` | Fix aspect ratio: already `aspect-[2.5/1] sm:aspect-[3/1]` — good; soften copy ("Stop overpaying" → "Convert PDFs, docs, and data to .toon — lossless, private, free."); consolidate `text-[11px]` → `text-xs`; add hover bg tint on drop zone (`bg-accent/5`); add `title={file.name}` tooltip on truncation |
| `src/components/ResultsView.jsx` | Replace generic checkmark SVG with custom animated SVG or CSS animation; consolidate `text-[9px]` → `text-[10px]`; increase stat values `text-lg sm:text-xl` → `text-2xl sm:text-3xl`; make LLM badges functional (copy prompt snippet per model) or remove them; make "Process Another" ghost → secondary button |
| `src/components/ProcessingView.jsx` | Fix `w-5.5 h-5.5` → `w-6 h-6` (invalid Tailwind); add visual hierarchy — larger stage icon, dimmer filename; add subtle shimmer animation on progress bar |
| All components | Establish spacing rhythm: `mb-4` → `mb-2` → `mb-1` → `mb-4` pattern; reduce `py-6` → `py-4` on all views; standardize `mt-5` → `mt-4` |

**Key implementation details:**
- Font swap is CSS-only — load via `<link>` in `index.html`, update Tailwind's `font-family` theme
- Spacing refactor: create a small spacing guide as a comment or doc, then mechanically apply across DropZone, ProcessingView, ResultsView
- Drop zone hover: add `onMouseEnter`/`onMouseLeave` toggling a state for bg color, or use CSS `group-hover` with a wrapper

### 1.2 Result UX with Chunk Preview

**Files to create:**
- `src/components/ChunkPreview.jsx` — expandable chunk viewer showing each chunk's heading, token count, and first 200 chars of content

**Files to modify:**
- `src/components/ResultsView.jsx` — add "View Chunks" toggle button, render ChunkPreview when expanded

**Key implementation details:**
- Chunks are already computed in `stats.chunks` (index, tokens, heading) but content is not passed through from tokenizer
- Need to thread chunk content from `generateToonFile` → `stats.chunks` (add `content` field to chunk objects in stats)
- ChunkPreview renders in a scrollable container, each chunk as a card with heading, token count badge, and truncated content
- Lazy-render chunks (only render visible ones) if chunk count > 20

### 1.3 Performance Baselines

**Files to create:**
- `src/__tests__/tokenizer.test.js` — unit tests for `optimizeContent`, `createChunks`, `compressContent`, `generateToonFile`
- `src/__tests__/integration.test.js` — end-to-end: file → converter → tokenizer → .toon output
- `src/utils/benchmarks.js` — simple performance measurement utility (measure conversion time, token counting time, compression ratio)

**Files to modify:**
- `vite.config.js` — add benchmark script configuration

**Key implementation details:**
- Benchmark against 3 file sizes: 10KB, 100KB, 1MB
- Measure: conversion time, optimization time, token counting time, chunking time, compression time, total end-to-end
- Store baseline numbers; add to CI as a smoke test (warn if >2x regression)
- Use `performance.now()` for timing, not Date

### 1.4 Error Boundaries

**Files to create:**
- `src/components/ErrorBoundary.jsx` — class component error boundary with fallback UI
- `src/components/ChunkErrorBoundary.jsx` — wraps chunk preview specifically

**Files to modify:**
- `src/App.jsx` — wrap `<AnimatePresence>` in ErrorBoundary; add Zustand store (see cross-cutting above)
- `src/components/ResultsView.jsx` — wrap ChunkPreview in ChunkErrorBoundary

**Key implementation details:**
- ErrorBoundary catches render errors, shows a recovery UI ("Something went wrong rendering results — try again")
- Must be class component (React 19 doesn't add hooks-based error boundaries)
- Log error to console.error with file context for debugging
- Boundary should offer reset (clear store state) and "Copy error" for bug reports

### Phase 1 Dependencies
- No new npm packages except Google Fonts (CDN, no package change)
- Zustand: `npm install zustand` (~1.2KB gzipped)
- Test infrastructure: vitest already configured

### Phase 1 Testing
- Unit tests for tokenizer (optimizeContent, createChunks, compressContent)
- Component smoke tests for ErrorBoundary
- Visual regression: manual check against UI-REVIEW.md scorecard
- Performance benchmarks as baseline

---

## Phase 2: MarkItDownJS Migration (Weeks 5–10)

**Goal:** Remove 6 fallback converters, replace custom optimizer with MarkItDownJS-native pipeline where possible. Simplify tokenizer.js from 701 lines to ~300.

### 2.1 Delete 6 Fallback Converters

**Files to delete:**
- `src/converters/PdfConverter.js`
- `src/converters/DocxConverter.js`
- `src/converters/ExcelConverter.js`
- `src/converters/CsvConverter.js`
- `src/converters/JsonConverter.js`
- `src/converters/XmlConverter.js`

**Files to modify:**
- `src/converters/index.js` — remove 6 imports, remove 6 `registry.register(new XxxConverter(), PRIORITY_FALLBACK)` calls
- `src/converters/MarkItDownConverter.js` — enhance to handle all formats MarkItDownJS supports; add a single try/catch fallback to PlainTextConverter if MarkItDown fails

**Files to modify:**
- `src/converters/__tests__/index.test.js` — remove tests for deleted converters
- `src/converters/__tests__/PlainTextConverter.test.js` — update (PlainTextConverter becomes the only fallback)
- `src/converters/__tests__/Registry.test.js` — simplify to MarkItDown + PlainText only

**Key implementation details:**
- MarkItDownConverter already handles .pdf, .docx, .pptx, .xlsx, .html, .csv, .json, .xml, .epub
- After deletion, the registry has 2 entries: MarkItDownConverter (P0) + PlainTextConverter (P10)
- Remove mammoth, pdfjs-dist, xlsx, papaparse from package.json (MarkItDownJS replaces them)
- Remove `pdf`, `excel`, `docx`, `csv` manual chunks from vite.config.js
- **Critical**: Test every format that MarkItDownConverter claims to support before deleting fallbacks

### 2.2 Replace Optimizer

**Files to modify:**
- `src/utils/tokenizer.js` — remove `optimizeMarkdown`, `optimizeCode`, `optimizeJson`, `optimizeXml`, `optimizeData`, `optimizeHtml` (6 functions, ~250 lines)

**Files to create:**
- `src/utils/optimizer.js` — simplified optimizer that delegates to MarkItDownJS `@markitdownjs/ast` for semantic analysis if available, or falls back to basic whitespace normalization

**Key implementation details:**
- MarkItDownJS already normalizes content to Markdown — the custom optimizers are redundant for MarkItDown-converted content
- Keep `normalizeText` as the universal fallback
- Keep `optimizeJson` for raw JSON input (MarkItDownJS may not optimize JSON for TOON encoding)
- The `@toon-format/toon` encode call stays — it's the core value prop
- New optimizer is format-aware: MarkItDown output → minimal cleanup; raw JSON → TOON encode; everything else → normalizeText

### 2.3 Replace Token Counting

**Files to modify:**
- `src/utils/tokenizer.js` — evaluate replacing `gpt-tokenizer` with `@markitdownjs/chunking`'s token counting if it provides GPT-compatible counts

**Decision point:**
- If `@markitdownjs/chunking` uses a GPT-4 compatible tokenizer → replace gpt-tokenizer with it
- If it uses a different tokenizer → keep gpt-tokenizer for accuracy (users expect GPT token counts)
- If keeping gpt-tokenizer, at minimum consolidate the dynamic import pattern

### 2.4 Migrate .toon Serialization

**Files to modify:**
- `src/utils/tokenizer.js` — keep `generateToonFile` and `decodeToonFile` but simplify the .toon file structure
- Evaluate using `@markitdownjs/chunking` for chunk creation instead of custom `createChunks`

**Key implementation details:**
- If MarkItDownJS chunking provides heading-aware chunking with token limits, use it
- If not, keep the custom chunker but remove the format-specific branching (since everything is Markdown now)
- The .toon file format (`version`, `format`, `original`, `optimized`, `chunks`, `metadata`) stays — it's the product spec
- Compression (fflate gzip) stays — it's independent of MarkItDownJS

### Phase 2 Dependencies
- **Remove**: mammoth, pdfjs-dist, xlsx, papaparse (4 packages, ~1.5MB savings)
- **Remove from vite.config.js manualChunks**: pdf, excel, docx, csv
- **Keep**: gpt-tokenizer (unless MarkItDownJS chunking replaces it)
- **Keep**: @toon-format/toon, fflate, gsap, framer-motion, lenis

### Phase 2 Testing
- Format-by-format conversion test: for each MarkItDown-supported extension, create a test file and verify conversion
- Token counting accuracy test: compare gpt-tokenizer vs any replacement
- Compression roundtrip test: compress → decompress → verify content integrity
- Performance regression test: compare Phase 2 benchmarks against Phase 1 baselines
- Bundle size test: verify package removal reduces bundle

---

## Phase 3: Features (Weeks 11–16)

**Goal:** Ship model selector, batch processing, chunk inspector, overlap config, and shareable links.

### 3.1 Model Selector

**Files to create:**
- `src/components/ModelSelector.jsx` — dropdown/card selector for target LLM (GPT-4, Claude 3.5, Gemini 1.5, Llama 3, custom)
- `src/utils/models.js` — model definitions (name, token limit, cost per 1K tokens, tokenizer variant)

**Files to modify:**
- `src/store/useSettingsStore.js` — add `selectedModel`, `setSelectedModel`
- `src/utils/tokenizer.js` — `countTokens` accepts model parameter, uses model-specific tokenizer
- `src/components/ResultsView.jsx` — display model-specific cost savings ("$1.60 → $0.48 on GPT-4")

**Key implementation details:**
- Model selector shows on DropZone before conversion, pre-selects "GPT-4" as default
- Each model has a `maxTokens` and `costPer1kTokens` — used for cost calculation display
- Tokenizer switches: GPT-4 uses cl100k_base (gpt-tokenizer default), Claude uses similar, Gemini uses different → may need multiple tokenizer WASMs or approximate
- Start simple: 3-4 presets + custom input for token limit and cost

### 3.2 Batch Processing

**Files to create:**
- `src/components/BatchDropZone.jsx` — drop zone accepting multiple files
- `src/components/BatchProgress.jsx` — aggregate progress across files
- `src/components/BatchResults.jsx` — results table with per-file stats + total savings

**Files to modify:**
- `src/store/useAppStore.js` — add batch state: `files[]`, `batchProgress`, `batchResults[]`
- `src/components/DropZone.jsx` — accept multiple files via `multiple` attribute
- `src/App.jsx` — route to BatchProgress/BatchResults when batch mode

**Key implementation details:**
- Process files sequentially (avoid memory issues with large files) with a concurrency limit of 2-3
- Each file goes through the same converter → tokenizer pipeline
- Batch results show a table: filename, original size, .toon size, tokens saved, status
- "Download All" creates a .zip of .toon files (use fflate for zip)
- Maximum 50 files per batch, 100MB total

### 3.3 Chunk Inspector

**Files to create:**
- `src/components/ChunkInspector.jsx` — full-page/chunk view with prev/next navigation, heading tree, token distribution chart

**Files to modify:**
- `src/components/ChunkPreview.jsx` (from Phase 1.2) — add "Open in Inspector" button per chunk
- `src/store/useAppStore.js` — add `inspectorChunkIndex`, `openInspector`, `closeInspector`

**Key implementation details:**
- Inspector shows: full chunk content, token count, position in document, heading hierarchy
- Navigation: prev/next chunk, jump to heading in tree
- Token distribution: simple bar chart showing tokens per chunk (using CSS bars, no chart library)
- Keyboard: ←/→ for navigation, Esc to close
- Can be a modal or a slide-in panel

### 3.4 Overlap Configuration

**Files to modify:**
- `src/store/useSettingsStore.js` — add `chunkOverlap` (default: 0 tokens)
- `src/utils/tokenizer.js` — `createChunks` respects overlap parameter (overlap last N tokens of previous chunk into next)
- `src/components/ModelSelector.jsx` — add "Chunk Overlap" slider (0, 50, 100, 200 tokens)

**Key implementation details:**
- Overlap = repeat the last N tokens of each chunk at the beginning of the next chunk
- Use the heading-aware splitting from `createChunks`, add overlap after splitting
- Display: show overlap regions with a visual indicator in ChunkInspector
- Default 0 (current behavior), options: 0, 50, 100, 200

### 3.5 Shareable Links

**Files to create:**
- `src/utils/share.js` — encode .toon data into URL-safe string (base64url of compressed JSON)
- `src/components/ShareModal.jsx` — modal with shareable URL, copy button, QR code (optional)

**Files to modify:**
- `src/components/ResultsView.jsx` — add "Share" button next to Download/Copy
- `src/store/useAppStore.js` — add `shareUrl`, `generateShareLink`

**Key implementation details:**
- Encode: toonFile JSON → compress with fflate → base64url encode → append to URL as `#data=...`
- Decode: `src/utils/share.js` reads from `window.location.hash` on load, offers to restore session
- URL length limit: ~2MB (browsers support ~2MB hash). For larger files, show "File too large to share" with option to download
- Add to DropZone: if hash has data, auto-load and convert from the shared link
- **Security note**: Shared content is in the URL (client-side only, no server). Add a warning "Don't share URLs containing sensitive documents"

### Phase 3 Dependencies
- No new npm packages (zip via fflate, QR via canvas or skip for now)
- May need a lightweight chart library for token distribution (or use pure CSS bars)

### Phase 3 Testing
- Model selector: verify token counts match expected for each model preset
- Batch processing: test with 5, 10, 50 files; test failure handling (unsupported format in batch)
- Chunk inspector: test navigation, keyboard shortcuts
- Overlap: verify overlapping tokens appear in both chunks
- Shareable links: roundtrip encode/decode test, URL length limits

---

## Phase 4: Distribution (Weeks 17–22)

**Goal:** Ship Chrome extension, VS Code extension, and API mode.

### 4.1 Chrome Extension

**Files to create:**
- `chrome-extension/manifest.json` — Manifest V3
- `chrome-extension/popup.html` — popup UI (mini version of DropZone)
- `chrome-extension/popup.jsx` — React popup component
- `chrome-extension/background.js` — service worker for file processing
- `chrome-extension/content.js` — content script for right-click "Convert to .toon"
- `chrome-extension/icons/` — extension icons (16, 48, 128px)

**Files to modify:**
- `vite.config.js` — add `build.rollupOptions` for Chrome extension build (separate entry point)
- `package.json` — add `build:extension` script

**Key implementation details:**
- Popup: file drop zone, model selector (simplified), download .toon button
- Right-click context menu: "Convert to .toon" on any selected text or page
- Service worker: import MarkItDownConverter + tokenizer from the main app (shared code)
- Manifest V3: no background pages, use service worker
- Bundle: share converter/tokenizer code via imports, popup is a React app
- Chrome Web Store: need developer account ($5), follow Chrome Web Store policies

### 4.2 VS Code Extension

**Files to create:**
- `vscode-extension/package.json` — extension manifest with commands
- `vscode-extension/src/extension.js` — activation, command registration
- `vscode-extension/src/convert.js` — Node.js version of converter pipeline (no browser APIs)
- `vscode-extension/media/` — icons for sidebar
- `vscode-extension/.vscodeignore` — exclude dev files

**Files to modify:**
- `package.json` — add `build:vscode` script

**Key implementation details:**
- Commands: "Tooner: Convert Current File", "Tooner: Convert Selected Files"
- Sidebar panel: shows conversion results, download button
- Node.js side: use `@markitdownjs/core` in Node (it supports both browser and Node)
- No browser APIs: use Node.js `fs` for file reading, Node.js `crypto` for hashing
- Tokenizer: gpt-tokenizer works in Node.js — reuse directly
- VS Code Marketplace: use `vsce` for packaging/publishing

### 4.3 API Mode

**Files to create:**
- `src/api/server.js` — Express/Hono server exposing conversion API
- `src/api/routes/convert.js` — POST /api/convert endpoint
- `src/api/routes/health.js` — GET /api/health
- `src/api/middleware/` — rate limiting, file size validation
- `api/` — OpenAPI spec for the API

**Files to modify:**
- `package.json` — add `start:api` script, add server dependencies

**Key implementation details:**
- POST /api/convert: accepts file upload (multipart/form-data), returns .toon file
- POST /api/convert/json: accepts raw text content + format, returns .toon
- GET /api/health: returns { status: "ok", version, supportedFormats }
- Rate limiting: 10 requests/minute per IP
- File size limit: 100MB (matches current client-side limit)
- **Deployment options**: Vercel serverless, Cloudflare Workers (need to adapt for Workers runtime), or self-hosted
- **Decision**: Start with Hono (lightweight, runs on Vercel/Cloudflare/Node.js)

### Phase 4 Dependencies
- **Chrome Extension**: no new npm packages, Chrome Web Store developer account
- **VS Code Extension**: `@types/vscode` (dev), `vsce` (dev), no runtime deps
- **API Mode**: `hono` (~14KB) or `express` (~200KB), `@hono/node-server` for Node.js

### Phase 4 Testing
- Chrome extension: test on Chrome/Edge, test popup, test context menu, test manifest V3 compliance
- VS Code extension: test activation, test conversion, test in VS Code Insiders
- API mode: test endpoints with curl/Postman, test rate limiting, test file size limits, test concurrent requests

---

## File Summary by Phase

### Phase 1 (UI Polish)
| Action | Files |
|--------|-------|
| Create | `src/store/useAppStore.js`, `src/store/useSettingsStore.js`, `src/components/ErrorBoundary.jsx`, `src/components/ChunkErrorBoundary.jsx`, `src/components/ChunkPreview.jsx`, `src/__tests__/tokenizer.test.js`, `src/__tests__/integration.test.js`, `src/utils/benchmarks.js` |
| Modify | `index.html`, `src/index.css`, `src/App.jsx`, `src/components/DropZone.jsx`, `src/components/ResultsView.jsx`, `src/components/ProcessingView.jsx`, `src/components/Footer.jsx`, `vite.config.js` |
| Delete | (none) |
| Add | `zustand` |

### Phase 2 (MarkItDownJS Migration)
| Action | Files |
|--------|-------|
| Create | `src/utils/optimizer.js` |
| Modify | `src/converters/index.js`, `src/converters/MarkItDownConverter.js`, `src/utils/tokenizer.js`, `src/converters/__tests__/index.test.js`, `src/converters/__tests__/Registry.test.js`, `vite.config.js`, `package.json` |
| Delete | `src/converters/PdfConverter.js`, `src/converters/DocxConverter.js`, `src/converters/ExcelConverter.js`, `src/converters/CsvConverter.js`, `src/converters/JsonConverter.js`, `src/converters/XmlConverter.js`, `src/converters/__tests__/JsonConverter.test.js` |
| Remove | `mammoth`, `pdfjs-dist`, `xlsx`, `papaparse` |

### Phase 3 (Features)
| Action | Files |
|--------|-------|
| Create | `src/components/ModelSelector.jsx`, `src/components/BatchDropZone.jsx`, `src/components/BatchProgress.jsx`, `src/components/BatchResults.jsx`, `src/components/ChunkInspector.jsx`, `src/components/ShareModal.jsx`, `src/utils/models.js`, `src/utils/share.js` |
| Modify | `src/store/useAppStore.js`, `src/store/useSettingsStore.js`, `src/components/DropZone.jsx`, `src/components/ResultsView.jsx`, `src/components/ChunkPreview.jsx`, `src/utils/tokenizer.js`, `src/App.jsx` |
| Delete | (none) |

### Phase 4 (Distribution)
| Action | Files |
|--------|-------|
| Create | `chrome-extension/` (manifest.json, popup.html, popup.jsx, background.js, content.js, icons/), `vscode-extension/` (package.json, src/extension.js, src/convert.js, media/), `src/api/server.js`, `src/api/routes/convert.js`, `src/api/routes/health.js`, `src/api/middleware/` |
| Modify | `vite.config.js`, `package.json` |
| Delete | (none) |
| Add | `hono` (or `express`), `@types/vscode` (dev), `vsce` (dev) |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| MarkItDownJS chunking API doesn't meet .toon chunk requirements | High | Keep custom chunker, simplify for Markdown-only input |
| MarkItDownJS doesn't support a format that fallback converters currently handle | Medium | Test all formats before deleting fallbacks; keep PlainTextConverter as universal fallback |
| gpt-tokenizer accuracy differs across models | Medium | Keep gpt-tokenizer for GPT-4 default; document approximation for other models |
| Chrome extension bundle size too large | Medium | Tree-shake aggressively; lazy-load MarkItDownJS converters; consider on-demand loading |
| VS Code extension Node.js compatibility | Low | MarkItDownJS supports Node.js; gpt-tokenizer supports Node.js; test early |
| Shareable link URLs exceed browser length limits | Low | Show warning + fallback to download for large files |
| Zustand migration introduces regressions | Low | Mirror existing state shape exactly; test all state transitions |

---

**Plan complete.** 4 phases, 22 weeks, clear file-level action items per phase.
