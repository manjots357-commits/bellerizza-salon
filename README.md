# THE BOHO SALON website

Cinematic, editorial single-page site built with Next.js 16 (App Router), React 19,
TypeScript, Tailwind CSS 4, GSAP 3 (ScrollTrigger + SplitText), Lenis and a small
React Three Fiber layer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

## Before launch — client details required

Everything client-facing lives in **`src/content/site.ts`**.

| What | Where | Status |
| --- | --- | --- |
| Studio name, tagline, description | `brand` | Set to "THE BOHO SALON" — verify spelling/casing with client |
| Production URL (canonical / OG) | `brand.url` or `NEXT_PUBLIC_SITE_URL` | **Placeholder** |
| WhatsApp, phone, email, Maps link, Instagram, TikTok | `contact` | **Empty** — booking buttons render only for filled fields |
| Address and opening hours | `contact.address`, `contact.hours` | **Empty** — hidden until filled |
| Services | `services` | Taken from the reference material — **verify with client** |
| Photography | all `SiteImage` entries | Unsplash stock (free licence) — replace with the studio's own |

Nothing on the site invents prices, reviews, awards, statistics or team members.
Add them only when the client supplies them.

The primary "Book" action automatically resolves to WhatsApp → phone → email,
falling back to the Visit section.

## Structure

```
src/
  app/                 layout (fonts, metadata, JSON-LD), page, robots, sitemap, icon
  content/site.ts      all copy, services, contact channels, imagery
  lib/                 gsap setup, image loader (Unsplash CDN), intro sequencing
  hooks/               useMagnetic, useTilt
  components/
    providers/         SmoothScroll (Lenis ↔ ScrollTrigger)
    cursor/            Cursor (contextual orb + ring)
    ui/                MagneticButton, RollText, AnimatedText, RevealImage, Orb, Icons
    layout/            Nav, MobileMenu, Footer
    sections/          Preloader, Hero, Manifesto, Services, Ritual, Story, Gallery, Lightbox, Booking
    three/             GoldDust (WebGL particles, desktop only, lazy-loaded)
```

## Interaction system

The custom cursor is controlled declaratively with data attributes:

| Attribute | Cursor |
| --- | --- |
| `data-cursor="media"` (+ `data-cursor-label`) | Champagne lens with label, e.g. "View" |
| `data-cursor="service"` + `data-cursor-label` | Larger lens showing the service name |
| `data-cursor="text"` | Slim editorial caret over display type |
| `data-cursor="button"` | Steps aside for magnetic buttons |
| `data-cursor="drag"` | Lens with "Drag" |
| any other link / button | Ring tightens around the pointer |

It only mounts on fine pointers (mouse / trackpad), writes transforms from a
single rAF loop, and drops trailing for `prefers-reduced-motion`.

## Motion & accessibility

- `prefers-reduced-motion`: no Lenis, no preloader, no pinning or parallax;
  the services and ritual sections fall back to static, fully readable layouts.
- Keyboard: skip link, visible focus rings, focus-trapped menu and lightbox
  (Esc / ← / →), focus returned on close.
- WebGL is desktop-only, loaded after idle, and paused when the hero is off-screen.
