# SHUISBORED Portfolio — Implementation Plan

Build a single-page Next.js 14 portfolio for Shubham Patil (shuisbored). The design is editorial/typographic — black/white with teal accent, bold uppercase type, and a geometric asterisk `*` logo. All animations use GSAP for precise control.

## Proposed Changes

### Project Initialization

#### [NEW] Next.js 14 App Router project
Initialize via `npx create-next-app@latest ./` inside `shu-portfolio/` with TypeScript, App Router, and no Tailwind. Use `Inter` from Google Fonts via `next/font`.

---

### Global Styles & Tokens

#### [NEW] `app/globals.css`
- CSS custom properties: `--black: #111111`, `--white: #ffffff`, `--teal: #4ECDC4`
- Base reset, font-family Inter
- Utility classes: `.uppercase`, `.bold`, `.italic`, `.teal`
- Keyframe animations for fade-in, curtain panels

#### [NEW] `app/layout.tsx`
Root layout importing Inter font and global styles.

---

### Public Assets

#### Copy hero image
Copy [figma wireframe/hero.png](file:///c:/Users/Shubham%20Patil/Documents/Portfolio/shu-portfolio/figma%20wireframe/hero.png) → `public/hero.jpg` (the red/white abstract photo used in hero + parallax)

---

### Components

#### [NEW] `components/AsteriskLogo.tsx`
Reusable SVG asterisk (6-arm geometric style matching wireframe). Accepts `size`, `color`, and `progress` (0–1) props for the fill animation.

#### [NEW] `components/LoadingScreen.tsx`
- Full-screen black background
- Large centered `AsteriskLogo` with animated SVG stroke `stroke-dashoffset` going from outline → filled as progress goes 0→100%
- Top-left stacked nav links (HOME in teal, others white) and top-right MENU — all inactive
- Simulated loading (2s timeout → progress 100%) then fires `onComplete` callback
- CSS transition: fade out overlay

#### [NEW] `components/Navbar.tsx`
- Fixed top bar: left nav links, center asterisk (small, black on white), right MENU
- Active link highlighted teal
- Receives `logoScale` + `logoY` ref-driven values for the post-load animation (GSAP)

#### [NEW] `components/HeroSection.tsx`
- Tagline paragraph: mixed italic/bold "SHUBHAM PATIL AKA **SHUISBORED** IS A FREELANCE DEVELOPER..."
- Curtain reveal: hero image wrapped in two half-panels; on mount GSAP animates `clipPath` or `translateX` to slide them apart
- Below image: oversized right-aligned **SHUISBORED\*** text

#### [NEW] `components/ParallaxAbout.tsx`
- Uses GSAP ScrollTrigger: hero image starts small, pinned sticky section scales it to full viewport width/height as user scrolls
- White overlay text fades in: **ABOUT ME\*** + tagline in white italic/bold
- `scrub: true` for smooth scroll-linked motion

#### [NEW] `components/FeaturedWork.tsx`
- Header row: "FEATURED WORK" left, "CHECK ALL WORK →" right (small caps)
- 4 project rows with bottom border dividers, large bold uppercase project name left, number right:
  - CODE VISUALIZER / 01
  - PROJECT TWO / 02
  - AUTOPHARMA X / 03
  - RANDOM GEN / 04
- Hover: subtle underline or text color shift on row

---

### Pages

#### [MODIFY] `app/page.tsx`
Assemble all sections. Manage loading state: show `<LoadingScreen>` until complete, then reveal main content with GSAP asterisk fly-up-to-navbar animation.

---

### Dependencies

```
gsap          — animations + ScrollTrigger plugin
```

---

## Verification Plan

### Automated Tests
None (visual/animation-focused portfolio page; Next.js build check serves as smoke test).

```bash
# From shu-portfolio/
npm run build
```
Should complete with no errors.

### Manual Verification (Browser)
```bash
npm run dev
# Open http://localhost:3000
```

1. **Loading screen**: Black screen with centered asterisk that fills/strokes progressively. Nav text visible top-left/right. After ~2s, loading completes.
2. **Asterisk transition**: The large asterisk smoothly shrinks and animates up into the center of the navbar.
3. **Hero**: White page, nav visible, tagline text shown. Hero image has curtain-open reveal (two panels sliding apart). "SHUISBORED*" large text below, right-aligned.
4. **Parallax**: Scrolling down causes the hero image to scale up and eventually fill the full viewport. "ABOUT ME*" + bio text overlays appear on the image.
5. **Featured Work**: White background, "FEATURED WORK" / "CHECK ALL WORK →" header, then 4 bold project rows with dividers.
