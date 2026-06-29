# Graph Report - tooner  (2026-06-30)

## Corpus Check
- 33 files · ~24,956 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 203 nodes · 297 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e9eb8938`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `DocumentConverter` - 13 edges
2. `UI-REVIEW.md — Tooner 6-Pillar Visual Audit` - 11 edges
3. `createStreamInfo()` - 9 edges
4. `ConverterRegistry` - 8 edges
5. `detectFileType()` - 8 edges
6. `scripts` - 7 edges
7. `JsonConverter` - 6 edges
8. `PlainTextConverter` - 6 edges
9. `getExtension()` - 6 edges
10. `isSupported()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `DropZone()` --calls--> `getAcceptedTypes()`  [EXTRACTED]
  src/components/DropZone.jsx → src/converters/fileTypeDetector.js
- `ProcessingView()` --calls--> `formatSize()`  [EXTRACTED]
  src/components/ProcessingView.jsx → src/utils/format.js
- `ResultsView()` --calls--> `formatSize()`  [EXTRACTED]
  src/components/ResultsView.jsx → src/utils/format.js
- `ResultsView()` --calls--> `formatTokens()`  [EXTRACTED]
  src/components/ResultsView.jsx → src/utils/format.js
- `detectFileType()` --calls--> `createStreamInfo()`  [EXTRACTED]
  src/converters/fileTypeDetector.js → src/converters/StreamInfo.js

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (32): Compaction Assessment, Differentiation Callout, HIGH (Must Fix), Issues, Issues, Issues, Issues, Issues (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (19): DropZone(), FORMAT_BADGES, SOCIAL_PROOF_LABELS, useSocialProof(), DATA_EXTENSIONS, detectFileType(), EXT_TO_MIME, extToMime() (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (10): CsvConverter, DocumentConverter, DocxConverter, readAsArrayBuffer(), ExcelConverter, readAsArrayBuffer(), PdfConverter, readAsArrayBuffer() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (26): dependencies, fflate, framer-motion, gpt-tokenizer, gsap, lenis, mammoth, papaparse (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (9): getCurrentStage(), ProcessingView(), STATUS_STAGES, ResultsView(), registerBuiltinConverters(), createToonBlob(), formatSize(), formatTokens() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (6): ConversionError, ConverterRegistry, registry, FailingConverter, MockPdfConverter, MockTextConverter

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (13): Architecture, Code Splitting, Converter Registry, Deployment, Features, File Detection, License, Netlify (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (10): compressContent(), convertToToon(), countTokens(), decodeToonFile(), decompressContent(), generateToonFile(), normalizeText(), optimizeContent() (+2 more)

## Knowledge Gaps
- **80 isolated node(s):** `enabled`, `name`, `private`, `version`, `type` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ConverterRegistry` connect `Community 5` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `enabled`, `name`, `private` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10887096774193548 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11397849462365592 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.12418300653594772 - nodes in this community are weakly interconnected._