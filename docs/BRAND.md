# ClawCoach Brand Guide

---

## Logo

- **Primary mark**: Agent bot head (SVG — add to `public/logo.svg`)
- **Text treatment**: `🦞 ClawCoach` — "Coach" in primary green
- **HTML pattern**: `🦞 Claw<span class="text-primary">Coach</span>`
- **Favicon**: Agent bot head (add `public/favicon.ico` + `public/favicon.svg`)

---

## Colors

### Primary Palette

| Name | Hex | OKLCh | Tailwind | Usage |
|------|-----|-------|----------|-------|
| **Lime (primary)** | `#7CCF00` | `oklch(0.768 0.233 130.85)` | `text-primary` / `bg-primary` | CTAs, links, highlights, "Coach" text |
| **Lime dark** | `#437F00` | `oklch(0.532 0.178 131.589)` | — | Light mode primary (unused — site is dark-only) |

### Neutral Palette (Zinc)

| Name | Hex | OKLCh | Tailwind | Usage |
|------|-----|-------|----------|-------|
| **Background** | `#09090B` | `oklch(0.141 0.005 285.823)` | `bg-background` | Page background |
| **Card** | `#18181B` | `oklch(0.21 0.006 285.885)` | `bg-card` | Cards, popovers |
| **Secondary** | `#27272A` | `oklch(0.274 0.006 286.033)` | `bg-secondary` | Muted surfaces, badges |
| **Muted text** | `#9F9FA9` | `oklch(0.705 0.015 286.067)` | `text-muted-foreground` | Secondary text, labels |
| **Foreground** | `#FAFAFA` | `oklch(0.985 0 0)` | `text-foreground` | Primary text (white) |

### Semantic Colors

| Name | Hex | OKLCh | Usage |
|------|-----|-------|-------|
| **Destructive** | `#FF6467` | `oklch(0.704 0.191 22.216)` | Errors, delete actions |
| **Border** | `rgba(255,255,255,0.10)` | `oklch(1 0 0 / 10%)` | Dividers, card borders |
| **Input** | `rgba(255,255,255,0.15)` | `oklch(1 0 0 / 15%)` | Form field borders |
| **Base blue** | `#0000FF` | — | Base chain pill (filled bg, white text, 5% radius) |

---

## Typography

| Role | Font | Source | CSS Variable |
|------|------|--------|--------------|
| **Body / UI** | Geist | Google Fonts | `--font-geist-sans` |
| **Code / Data** | Geist Mono | Google Fonts | `--font-geist-mono` |

- **Antialiased** rendering enabled globally
- No custom font sizes — use Tailwind defaults (`text-sm`, `text-base`, `text-lg`, etc.)

---

## Design System

| Property | Value |
|----------|-------|
| **Component library** | shadcn/ui (New York variant) |
| **Base color** | Zinc |
| **Icon library** | lucide-react |
| **Border radius** | `0.625rem` (10px) base |
| **Color format** | OKLCh (perceptually uniform) |
| **Theme** | Dark mode only (`html class="dark"`) |
| **Responsive** | Mobile-first (`sm:` → `md:` → `lg:`) |

---

## Brand Elements

### Chain Identity
- **Network**: Base (Coinbase L2)
- **Chain pill**: Filled `#0000FF` background, white text, rounded square logo with 5% border-radius
- **Reference**: [base.org/brand/core-identifiers](https://base.org/brand/core-identifiers)

### Tone
- Dark, techy, coaching-forward
- Lime green accents on near-black zinc
- Clean, minimal UI — no gradients, no shadows on cards
- Hero uses animated glowing orbs (lime green, breathing animation)

### Emoji Usage
- 🦞 — Brand mark (navbar, footer, loading states)
- Used sparingly, not in body copy

---

## Asset Checklist

- [ ] `public/logo.svg` — Agent bot head (primary mark)
- [ ] `public/favicon.ico` — 32x32 from bot head
- [ ] `public/favicon.svg` — Scalable favicon
- [ ] `public/og-image.png` — 1200x630 Open Graph image
- [ ] `public/apple-touch-icon.png` — 180x180
- [ ] Logo on dark background variant
- [ ] Logo on light background variant (if needed)

---

*Last updated: Feb 12, 2026 — Session 33*
