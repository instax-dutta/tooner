# UI-REVIEW.md — Tooner 6-Pillar Visual Audit

**Audit Date:** 2026-06-03
**Scope:** All views (DropZone, ProcessingView, ResultsView, Error)
**Context:** Compaction pass — subtle spacing, no cramping, no stretching

---

## Overall Score: 15/24

| Pillar | Score | Verdict |
|--------|-------|---------|
| Copywriting | 3/4 | Strong but some copy is aggressive |
| Visuals | 2/4 | Stretched drop zone, generic checkmark |
| Color | 3/4 | Good palette, accent may be too saturated |
| Typography | 2/4 | Uses Inter (anti-pattern), too many micro-sizes |
| Spacing | 2/4 | Inconsistent rhythm across views |
| Experience Design | 3/4 | Smooth transitions, some dead-end elements |

---

## Pillar 1: Copywriting — 3/4

### What Works
- **"Optimize any file for AI"** — clear, benefit-first h1
- **"Drop a file to see how much you save"** — outcome-driven CTA, not instructional
- **Cost preview** ("500-page PDF: ~$1.60 → ~$0.48") — concrete, memorable
- **Error titles** contextual to error type — not generic "Something went wrong"

### Issues

| Finding | Severity | Location |
|---------|----------|----------|
| "Stop overpaying for bloated tokens" reads as aggressive/shaming | Medium | DropZone subtitle |
| Social proof cycles randomly between 3 labels — feels gimmicky | Low | DropZone footer |
| "Feed to" label is unclear — should specify what "feeding" means | Medium | ResultsView bottom |
| LLM badges (ChatGPT, Claude, Gemini) are decorative only — no action | Medium | ResultsView bottom |

### Recommendations
1. Soften subtitle: "Convert PDFs, docs, and data files to .toon — lossless, private, free." (remove "Stop overpaying")
2. Fix social proof: use a single label ("files optimized this week") or rotate on a timer, not randomly
3. Change "Feed to" → "Works with" or remove the section entirely if badges don't do anything
4. Either make LLM badges clickable (copy for that LLM) or remove them

---

## Pillar 2: Visuals — 2/4

### What Works
- Dark theme is distinctive and memorable
- Accent color (#B84A2B-ish warm rust) is unique in the AI tool space
- Flat Airtable-style cards avoid generic shadow/glass patterns

### Issues

| Finding | Severity | Location |
|---------|----------|----------|
| Drop zone `aspect-[3/1]` on mobile is too wide and flat — looks stretched | High | DropZone |
| Success checkmark is generic — same as every other app | Medium | ResultsView |
| `w-13` is not a valid Tailwind class — renders as `w-11` on mobile | Low | ProcessingView |
| LLM badges at `text-[9px]` are nearly unreadable | Medium | ResultsView |
| ProcessingView card has no visual hierarchy — icon, title, filename, progress all same weight | Medium | ProcessingView |

### Recommendations
1. Drop zone: change to `aspect-[2.5/1] sm:aspect-[3/1]` — less stretched on mobile
2. Replace generic checkmark with a custom SVG or animated reveal
3. Fix `w-13` → `w-12` (valid Tailwind class)
4. LLM badges: increase to `text-[10px]` minimum or remove entirely
5. ProcessingView: add visual weight to the stage icon (larger, more contrast)

---

## Pillar 3: Color — 3/4

### What Works
- Consistent HSL-based palette with CSS custom properties
- Good contrast: `--foreground: 88%` on `--background: 7%` = 15:1 ratio
- Accent color is warm and distinctive

### Issues

| Finding | Severity | Location |
|---------|----------|----------|
| `--accent: 12 65% 42%` is highly saturated — can feel aggressive in large doses | Medium | Global |
| `--muted-foreground: 46%` may be too low contrast on `--card: 10%` | Low | Global |
| No dark/light mode toggle — locked to dark | Low | Global |
| Drop zone hover only changes border color — no background shift | Low | DropZone |

### Recommendations
1. Consider reducing accent saturation to `12 55% 38%` for less visual fatigue
2. Bump `--muted-foreground` to `50%` for better readability
3. Add subtle background tint on drop zone hover (e.g., `bg-accent/5`)

---

## Pillar 4: Typography — 2/4

### What Works
- Clear scale: h1 (3xl-5xl) → h3 (xl-2xl) → body (sm-base) → meta (xs)
- Monospace for file names and stats — good differentiation

### Issues

| Finding | Severity | Location |
|---------|----------|----------|
| **Uses Inter font** — violates "Avoid system fonts and AI-defaults" rule | High | Global |
| Too many micro-sizes: `text-[9px]`, `text-[10px]`, `text-[11px]` | Medium | Global |
| No clear hierarchy between h1 and h3 — both "font-medium" | Medium | DropZone, ProcessingView |
| Stat values `text-lg sm:text-xl` feel small for emphasis | Low | ResultsView |

### Recommendations
1. **Replace Inter** with a distinctive font pair:
   - Display: "Space Grotesk" (geometric, techy) or "Instrument Sans" (editorial)
   - Body: "DM Sans" or "Satoshi" (clean, modern)
2. Consolidate micro-sizes: use `text-[10px]` and `text-xs` only — eliminate `text-[9px]` and `text-[11px]`
3. Make h3 bolder or use a different weight to distinguish from h1
4. Increase stat values to `text-2xl sm:text-3xl` for visual impact

---

## Pillar 5: Spacing — 2/4

### What Works
- Consistent `gap-2` between buttons
- Card padding `p-4 sm:p-5` is reasonable

### Issues

| Finding | Severity | Location |
|---------|----------|----------|
| **No consistent spacing rhythm** — mb values jump randomly | High | All views |
| DropZone: `mb-4` → `mb-4 sm:mb-6` → `mt-4 sm:mt-5` → `mt-5` — no pattern | High | DropZone |
| ProcessingView: `mb-4` → `mb-1` → `mb-0.5` → `mb-5` → `mb-3` → `mb-5` — chaotic | High | ProcessingView |
| ResultsView: `mb-3` → `mb-1` → `mb-4` → `mb-5` → `mt-5` — inconsistent | High | ResultsView |
| `py-6` on all views + `h-full` creates awkward centering when content is short | Medium | All views |
| Bottom section `mt-5` is too much separation from buttons | Low | ResultsView |

### Recommendations
1. Establish a spacing scale: `4px / 8px / 12px / 16px / 24px / 32px`
2. Use consistent vertical rhythm:
   - **DropZone**: `mb-4` hero → `mb-4` drop zone → `mt-4` formats → `mt-4` footer
   - **ProcessingView**: `mb-4` icon → `mb-2` title → `mb-1` filename → `mb-4` progress → `mb-4` status
   - **ResultsView**: `mb-4` checkmark → `mb-2` title → `mb-1` filename → `mb-4` card → `mt-4` actions
3. Change `py-6` to `py-4` on all views — less padding, more content
4. Reduce bottom section `mt-5` → `mt-4`

---

## Pillar 6: Experience Design — 3/4

### What Works
- Smooth GSAP + Framer Motion transitions between states
- Keyboard support (Enter to upload, paste support)
- Contextual error messages with specific guidance
- Progress stages with icons — not just a spinning loader

### Issues

| Finding | Severity | Location |
|---------|----------|----------|
| Drop zone hover feedback is minimal — only border color changes | Medium | DropZone |
| Filename truncation on long names — no tooltip or expand option | Low | ProcessingView, ResultsView |
| "Process Another" button is visually weak (ghost style) | Low | ResultsView |
| No loading skeleton or shimmer while processing | Low | ProcessingView |
| LLM badges are decorative — clicking does nothing | Medium | ResultsView |

### Recommendations
1. Add background tint on drop zone hover (`bg-accent/5`)
2. Add `title={file.name}` attribute for filename tooltip on truncation
3. Make "Process Another" a secondary button instead of ghost
4. Add a subtle shimmer animation during processing stages
5. Either make LLM badges functional or remove them

---

## Priority Fixes

### HIGH (Must Fix)
1. **Replace Inter font** with distinctive pair (Space Grotesk + DM Sans)
2. **Fix drop zone aspect ratio** — `aspect-[2.5/1]` on mobile
3. **Establish consistent spacing rhythm** — use 4px scale across all views
4. **Fix invalid `w-13` class** → `w-12`

### MEDIUM (Should Fix)
1. Soften aggressive copy ("Stop overpaying")
2. Consolidate micro-sizes (remove `text-[9px]`, `text-[11px]`)
3. Increase LLM badge readability or remove them
4. Add drop zone hover background tint
5. Make "Process Another" more prominent

### LOW (Nice to Have)
1. Replace generic checkmark with custom animation
2. Add filename tooltips on truncation
3. Reduce accent saturation slightly
4. Add processing shimmer animation

---

## Compaction Assessment

**User context:** "compaction should be subtle not sooo strict that tons of empty spaces remains and still components cramp up with each other"

**Current state:** The compaction pass went too far in some areas:
- **Drop zone** is now too flat (`aspect-[3/1]`) — looks stretched, not compact
- **Bottom sections** have inconsistent gaps — some too tight (`mb-0.5`), some too loose (`mt-5`)
- **Views** use `py-6` which is fine, but combined with `h-full` and `justify-center`, it creates awkward centering when content is short

**Recommendation:** The compaction should focus on **consistent rhythm** rather than reducing all values. Use a 4px spacing scale and apply it uniformly. The drop zone should be `aspect-[2.5/1]` not `aspect-[3/1]`. Bottom sections should use `mt-4` consistently, not `mt-5`.

---

## Differentiation Callout

> "This avoids generic AI UI by using a warm rust accent on a muted dark palette instead of the typical purple/blue gradient. The flat Airtable-style cards and monospace stats create a distinctive editorial feel. However, the Inter font and inconsistent spacing undermine this differentiation."

---

**Audit complete.** Score: 15/24 — needs typography and spacing work to reach 18+.
