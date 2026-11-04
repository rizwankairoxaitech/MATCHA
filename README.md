# more — Matcha meets protein

A complete reference-inspired matcha landing page, built with React, Three.js, GSAP ScrollTrigger, Lenis, and Tailwind CSS.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```sh
npm run build
npm run preview
```

The production build is in `dist/` and can be served by any static hosting provider.

## What is included

- A custom lightweight, genuinely three-dimensional container with a cylindrical wrapped label, modeled lid, and studio lighting.
- One persistent product canvas throughout the hero, lifestyle transition, and pinned benefits story.
- A centered, progressively drawn logo introduction that moves into the hero before its content appears. Scrolling or keyboard navigation can skip the introduction immediately.
- A curved, scrolling text ribbon that forms the actual green-to-cream section boundary, followed by the centered reference statement.
- A coordinated, reversible GSAP scroll timeline controlling position, scale, tilt, and a full 360° rotation. The bottle remains still after scroll smoothing settles.
- Authentic More packshots and wordmark, with the front label unwrapped from the actual product photograph and reattached to the 3D cylinder. The reverse label is reconstructed from the visible reference.
- Generated, locally hosted WebP lifestyle and ingredient photography. Fonts are hosted locally as well.
- Responsive layouts, reduced-motion presentation, and a static product fallback if WebGL is unavailable.
- Three working flavor options, review navigation, and a cart saved to local storage. Native dialogs support keyboard focus containment and Escape.

## Editing

- `src/content.js`: product information, price, reference nutrition values, flavors, and clearly labeled sample reviews.
- `src/ProductScene.jsx`: model geometry, UV label artwork, lighting, and the master scroll timeline. Timeline durations are derived from the real section dimensions.
- `src/ProductModel.js`: realistic container geometry, inverse cylindrical label projection, fine surface texture, and studio environment lighting.
- `src/ReferenceSections.jsx`: flavor reveal, authentic Chunky Flavour pairings, payment composition, and closing product panel.
- `src/style.css`: design tokens, layouts, breakpoints, and reduced-motion rules.
- `src/landing.css`: reference-specific hero alignment, curved section transition, and responsive landing layout.
- `src/useLandingMotion.js`: opening logo choreography and smooth-scrolling integration.
- `src/reference.css`: full-frame section proportions, four benefit panels, responsive product compositions, and footer alignment.
- `public/`: generated photography, the transparent drink cutout, and favicon.
- `public/asset-sources.json`: original URLs for authentic packaging, wordmark, and payment icon artwork.

The full sequence is: logo intro → hero → curved ribbon → community imagery → four scrolling benefits with genuine product rotation → three-container flavor reveal → comparison → photographic reviews → Chunky Flavour pairings → closing statement and payment composition → oversized wordmark footer.

Desktop and mobile browser checks cover the intro, sequential panels, 360° rotation and reversal, stationary pose, scene exit, carousel keyboard focus, flavor selection, saved cart, 768/390/320 px reflow, reduced motion, and asset errors.

This is an independent visual concept, not an official brand storefront. The cart is local; payments, real orders, email subscriptions, and shipping are not connected. Replace the reference nutrition claims, sample reviews, and policy copy with verified production content before a commercial launch.
