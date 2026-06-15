---
name: design-variants
description: >
  When the user asks for any UI to be designed or generated, ALWAYS produce
  3 parallel design variants as standalone HTML files using Tailwind CDN —
  this lets the user compare and iterate faster. Use 4pt/8pt spacing,
  black/white text with subtle shadows, refined rounded corners, card-based
  layouts, and responsive design that looks perfect on mobile/tablet/desktop.
  No images — use CSS placeholders. Each variant should explore a different
  layout direction (e.g., centered hero vs. split layout vs. card grid).
---

# Design Variants Skill

When asked to design or generate any UI, always produce **3 parallel design
variants** so the user can compare and iterate. Do not default to a single
design.

## Rules

1. Always generate 3 variants, not 1 — unless explicitly told otherwise
2. Each variant explores a different layout or composition direction
3. Output standalone `.html` files using Tailwind CSS via CDN
4. Use a 4pt or 8pt spacing system — all margins, padding, line-heights,
   and element sizes must be exact multiples
5. Text should be black or white only — no colored text
6. Use card-based layouts with subtle shadows and refined rounded corners
7. Every design must be responsive and look perfect on mobile, tablet, and desktop
8. Never include real images — use CSS placeholder blocks, SVG shapes, or
   background gradients instead of `<img>` tags or external image services
9. No placeholder services (placehold.co, picsum.photos, etc.) — they won't render

## Output format

```
Output files to the project root or a `designs/` folder:
  design_name_1.html  ← variant 1 (e.g. centered hero)
  design_name_2.html  ← variant 2 (e.g. split layout)
  design_name_3.html  ← variant 3 (e.g. card grid)

When iterating from an existing file:
  current_name_1_1.html  ← new variant
  current_name_1_2.html
```

## Design direction

Each variant should try a meaningfully different approach:

| Variant | Layout style | Best for |
|---------|-------------|----------|
| 1 | Centered hero with single CTA | Landing pages, product launches |
| 2 | Split layout (text + visual) | SaaS, portfolios, about pages |
| 3 | Card grid / dashboard layout | Feature pages, dashboards, listings |

## Technical constraints

- **Framework**: Tailwind CSS via CDN (`https://cdn.tailwindcss.com`)
- **No images**: Use CSS gradients, SVG shapes, or `<div>` placeholders
- **Responsive**: Flexbox/Grid layout that adapts to mobile, tablet, desktop
- **Spacing**: 4pt or 8pt grid system — no arbitrary values
- **Typography**: System fonts or Inter via Google Fonts CDN
- **Colors**: Black, white, and one accent color only
