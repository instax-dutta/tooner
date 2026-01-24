# Tooner ⚡

> Lightning-fast, privacy-focused document tokenization platform

[![Netlify Status](https://api.netlify.com/api/v1/badges/placeholder/deploy-status)](https://tooner.sdad.pro)

**[Live Demo →](https://tooner.sdad.pro)**

Tooner converts any document format into token-optimized `.toon` files. Perfect for feeding documents into AI models with minimal token usage.

## ✨ Features

- **🔒 100% Private** - All processing happens in your browser. No data ever leaves your device.
- **⚡ Lightning Fast** - Optimized for speed with lazy-loaded libraries and efficient algorithms.
- **📁 30+ Formats** - Support for PDF, DOCX, Excel, CSV, JSON, Markdown, code files, and more.
- **🎯 Token Optimization** - Reduce token count by 20-40% with smart optimization.
- **📦 Fast Loading** - Aggressive code splitting ensures quick initial load.
- **🌙 Premium UI** - Dark monochrome design with smooth GSAP + Framer Motion animations.
- **🧈 Smooth Scroll** - Lenis smooth scrolling for buttery UX.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Supported Formats

| Category | Formats |
|----------|---------|
| **Documents** | `.pdf`, `.docx`, `.txt`, `.md`, `.rtf` |
| **Data** | `.csv`, `.xlsx`, `.xls`, `.json`, `.xml`, `.yaml`, `.toml` |
| **Code** | `.js`, `.jsx`, `.ts`, `.tsx`, `.py`, `.java`, `.cpp`, `.go`, `.rs`, `.rb`, `.php`, `.swift`, `.html`, `.css`, `.sql` |

## 📦 .toon File Format

```json
{
  "version": "1.0",
  "original": {
    "filename": "document.pdf",
    "format": "pdf",
    "size": 1048576,
    "tokens": 25000
  },
  "optimized": {
    "content": "base64_gzip_compressed_content",
    "encoding": "utf-8",
    "compression": "gzip",
    "tokens": 18000,
    "reduction": "28%"
  },
  "metadata": {
    "created": "2026-01-24T12:00:00Z",
    "settings": {
      "optimizationLevel": "balanced"
    }
  }
}
```

## ⚙️ Optimization Levels

| Level | Description |
|-------|-------------|
| **Minimal** | Preserve formatting, minimal changes |
| **Balanced** | Default - good token reduction while maintaining readability |
| **Aggressive** | Maximum token reduction, strips metadata |

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool with instant HMR
- **Tailwind CSS** - Utility-first styling
- **GSAP** - High-performance animations
- **Framer Motion** - Declarative animations
- **Lenis** - Smooth scrolling
- **PDF.js** - PDF parsing
- **Mammoth.js** - DOCX extraction
- **PapaParse** - CSV processing
- **SheetJS** - Excel support
- **gpt-tokenizer** - Token counting
- **fflate** - Compression

## 🔐 Privacy

Tooner is designed with privacy as a core principle:

- ✅ **Zero server processing** - Everything runs client-side
- ✅ **No analytics** - No tracking whatsoever
- ✅ **No external requests** - All libraries are bundled
- ✅ **No data storage** - Files are processed in memory only

## 📈 Performance Targets

- First Contentful Paint: < 1.2s
- Time to Interactive: < 2.5s
- File Processing: < 500ms per MB
- Lighthouse Score: 95+

## 🚢 Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect repo to Netlify
3. Set custom domain to `tooner.sdad.pro`
4. Deploy automatically with included `netlify.toml`

### Manual

```bash
npm run build
# Serve the `dist` folder with any static host
```

## 📄 License

MIT © [sdad.pro](https://sdad.pro)

---

⚡ **Toonify your documents. Save tokens. Ship faster.**

Made with ❤️ by [sdad.pro](https://sdad.pro)
