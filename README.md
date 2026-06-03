<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://tooner.sdad.pro/og-dark.png">
  <img alt="Tooner — Optimize any file for AI" src="https://tooner.sdad.pro/og.png">
</picture>

<p align="center">
  <a href="https://tooner.sdad.pro"><strong>tooner.sdad.pro</strong></a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&color=aa2d00" alt="MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square&color=aa2d00" alt="PRs">
  <img src="https://img.shields.io/badge/zero-server-100%25_private-181d26?style=flat-square" alt="Zero Server">
</p>

---

**Tooner** converts any document, data file, or code file into a token-optimized `.toon` format — purpose-built for feeding into LLMs like ChatGPT, Claude, and Gemini. All processing happens in your browser. Zero servers. Zero uploads. 100% lossless.

Stop overpaying for bloated tokens. [Try it now →](https://tooner.sdad.pro)

---

## Features

| | |
|---|---|
| **🔒 100% Private** | Files never leave your machine. No server, no upload, no tracking. |
| **⚡ Token-Optimized** | Reduce token count by 20-60% with smart content extraction and gzip compression. |
| **📁 10+ Formats** | PDF, DOCX, XLSX, CSV, JSON, XML, Markdown, code files, and more. |
| **🎯 LLM-Ready Output** | `.toon` files are directly usable in ChatGPT, Claude, Gemini. Copy text or download. |
| **🧠 Cognitive UX** | Interface designed using mental models (Hick's Law, Peak-End Rule, Loss Aversion, Social Proof, Fitts's Law). |
| **📦 Lazy-Loaded** | Heavy deps (PDF.js, SheetJS, Mammoth, gpt-tokenizer) load on demand. Sub-second initial load. |
| **🌙 Dark Editorial UI** | Airtable-inspired dark palette with GSAP + Framer Motion animations and Lenis smooth scroll. |

## Quick Start

```bash
git clone https://github.com/sdadorp/tooner.git
cd tooner
npm install
npm run dev       # → http://localhost:5173
npm run build     # → dist/
npm run test      # 23 tests, vitest
```

## Architecture

### Converter Pattern

Tooner uses a **priority-sorted converter registry** inspired by MarkItDown. Each file format is a standalone class:

```
DropZone → Registry.convert(file) → [Converter match] → StreamInfo
                                                              ↓
                                                    tokenizer (lazy)
                                                              ↓
                                                    .toon file + stats
```

```
src/converters/
  DocumentConverter.js   # Base class (accepts() + convert())
  Registry.js            # Priority-sorted dispatch
  fileTypeDetector.js    # Magic bytes + MIME + extension
  PlainTextConverter.js  # Fallback (priority 10)
  PdfConverter.js        # priority 0
  DocxConverter.js       # priority 0
  ExcelConverter.js      # priority 0
  CsvConverter.js        # priority 0
  JsonConverter.js       # priority 0
  XmlConverter.js        # priority 0
  StreamInfo.js          # Immutable metadata value object
```

Every converter implements `accepts(filename, mimeType)` and `convert(file, onProgress)`. The registry picks the highest-priority match and falls back to PlainText if nothing specific matches.

### State Machine

```
idle → processing → done → idle
                  ↘ error ↗
```

All four states are animated with `AnimatePresence` (Framer Motion) for smooth transitions.

### Cognitive Psychology UX

The interface was audited and redesigned using these mental models:

| Principle | Application |
|-----------|-------------|
| **Hick's Law** | Single clear CTA, unified stat card (not two separate cards) |
| **Peak-End Rule** | "You saved X%" peak, next-steps LLM badges as satisfying end |
| **Loss Aversion** | Hero copy: "Stop overpaying for bloated tokens" |
| **Social Proof** | Live counter: "1,842 files optimized this week" |
| **Availability Heuristic** | Concrete cost preview: "500-page PDF: ~$1.60 → ~$0.48" |
| **JTBD** | Hero reads "Optimize any file for AI" not "Toonify your docs" |
| **Fitts's Law** | Large drop zone, generous touch targets, keyboard support |
| **Cognitive Load** | Single progress indicator (linear bar), per-stage icons |
| **BJ Fogg Model** | Motivation (token savings) × Ability (drag & drop) × Prompt ("see how much you save") |

See [`DESIGN.md`](./DESIGN.md) for the full visual design system reference.

## Supported Formats

| Category | Formats |
|----------|---------|
| **Documents** | PDF, DOCX, TXT, Markdown, RTF |
| **Data** | CSV, XLSX, XLS, JSON, XML, YAML, TOML |
| **Code** | JS, JSX, TS, TSX, PY, Java, C++, Go, Rust, Ruby, PHP, Swift, HTML, CSS, SQL, and 30+ more |

Files are detected by magic bytes first, MIME type second, and extension as fallback — so renaming a `.pdf` to `.txt` won't fool the detector.

## .toon Format

```json
{
  "version": "2.0",
  "original": {
    "filename": "report.pdf",
    "format": "pdf",
    "size": 1048576,
    "tokens": 25000
  },
  "optimized": {
    "content": "<base64-gzip-compressed>",
    "encoding": "utf-8",
    "compression": "gzip",
    "tokens": 14500,
    "reduction": "42%"
  },
  "metadata": {
    "created": "2026-06-03T16:00:00Z"
  }
}
```

## Tech Stack

| Layer | Libraries |
|-------|-----------|
| **Framework** | React 19, Vite 7 |
| **Styling** | Tailwind CSS 4, CSS custom properties |
| **Animation** | GSAP 3.14, Framer Motion 12, Lenis |
| **Converters** | PDF.js (local worker), Mammoth, SheetJS, PapaParse |
| **Tokenization** | gpt-tokenizer, fflate (gzip) |
| **Testing** | Vitest (23 tests) |
| **Lint** | ESLint 9 with React plugin |
| **Format** | @toon-format/toon 2.1 |

## Performance

- **Initial JS bundle:** ~217 KB (gzipped: ~67 KB) — main app
- **Heavy deps** (PDF.js, SheetJS, Mammoth, gpt-tokenizer) loaded on demand during processing
- **Build output:** Vite code-splits into 17 chunks with manual chunking for `pdfjs-dist`, `xlsx`, `mammoth`, `gpt-tokenizer`, `gsap`, `framer-motion`, `lenis`
- **All static assets** cached immutably via `netlify.toml` (1 year)

## Deployment

### Netlify

```bash
# Push to GitHub, connect to Netlify
# Custom domain: tooner.sdad.pro
# Auto-deploys from main branch
# netlify.toml handles headers, redirects, and caching
```

### Any static host

```bash
npm run build
# Serve dist/ — no server required, it's all static
```

## License

MIT © [sdad.pro](https://sdad.pro)

---

<p align="center">
  <a href="https://tooner.sdad.pro"><strong>tooner.sdad.pro</strong></a>
  ·
  <a href="https://sdad.pro">sdad.pro</a>
</p>
