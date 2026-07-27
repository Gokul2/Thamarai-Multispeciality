# Thamarai Multispeciality Hospital — Website

A complete, static, production-ready website for Thamarai Multispeciality Hospital, Erode.
Built from the 13 Stitch designs (project `5266521421571712150`) and welded into one coherent, navigable site.

## Quick start

```bash
npm install       # one-time: installs Tailwind CLI + build deps
npm run build     # assemble pages (build/ -> site/) and compile CSS
npm run serve     # serve the built site at http://localhost:4321
```

`npm run build` = `npm run assemble` (compose pages from the Stitch sources + shared
partials) followed by `npm run css` (compile Tailwind to `site/assets/css/app.css`).
Use `npm run watch:css` while editing markup to recompile the stylesheet on save.

## What ships — `site/` (this is the deployable folder)

12 content pages + a 404, all self-contained:

| File | Page | Nav |
|---|---|---|
| `index.html` | Home | Home |
| `about.html` | About Us | About |
| `departments.html` | Our Departments | Specialities |
| `cardiology.html` | Cardiology (department detail) | Specialities |
| `doctors.html` | Find a Doctor | Doctors |
| `doctor-ramasamy.html` | Dr. K. Ramasamy profile | Doctors |
| `book-appointment.html` | Book Appointment | — |
| `health-packages.html` | Health Checkup Packages | Health Packages |
| `diagnostics.html` | Diagnostics & Laboratory | — |
| `emergency.html` | 24/7 Emergency | — |
| `blog.html` | Health & Wellness Blog | — |
| `contact.html` | Contact Us | Contact |
| `blog-article.html` | Sample blog post (template) | — |
| `404.html` | Not-found page | — |

Plus `robots.txt`, `sitemap.xml`, and `assets/` (compiled `app.css`, `main.js`,
and 41 localized images).

## How it was built (and what was fixed)

The Stitch export was 12 independently-generated Tailwind-CDN pages with inconsistent
navigation and no shared layout. The build pipeline (`build/assemble.mjs`) makes them a site:

- **Shared header + footer** — each page's idiosyncratic top-nav and footer are stripped and
  replaced with one canonical header (with active-state highlighting) and footer. Navigation is
  now consistent and every page is reachable.
- **Compiled Tailwind** — the per-page `cdn.tailwindcss.com` script (and its production console
  warning + runtime dependency) is gone. Tokens come from the Stitch design system
  (`tailwind.config.js`, generated from `design-system/theme.json`); custom utilities live in
  `site/assets/css/input.css`.
- **Localized images** — all 41 Google-hosted images (36 `<img>` + 5 CSS `background-image`)
  are downloaded to `assets/images/` and rewritten, so nothing breaks when Stitch URLs expire.
- **Accessibility** — Stitch's `data-alt` descriptions are promoted to real `alt` attributes;
  images get `loading="lazy"`.
- **Working mobile menu** — a real slide-in drawer with backdrop, Esc-to-close, and body-scroll
  lock (`assets/js/main.js`).
- **Link wiring** — in-content CTAs (home quick-cards, About buttons, etc.) point to real pages.
- **Content completion** — the Health Packages export shipped only a hero; a full package grid
  was added (`build/partials/health-packages-extra.html`).
- **Content normalization** — US-format placeholder phone numbers were replaced with the
  hospital's Indian numbers.

### Verified (see the audit run in the build session)
36 images — **0 broken** · 355 internal links — **0 broken** · **0** images without alt ·
**0** external image leaks · no console errors · no horizontal overflow at desktop **or** mobile ·
mobile drawer open/close working · all pages use compiled CSS (no CDN).

## Interactive functionality

Everything is client-side (no backend); the build wires `data-*` hooks into the markup and
`site/assets/js/main.js` drives the behavior. Verified working (browser-tested):

- **Mobile navigation** — slide-in drawer, backdrop, Esc-to-close, scroll-lock.
- **Doctors directory** (`doctors.html`) — a 12-doctor dataset (`DOCTORS` in `build/assemble.mjs`)
  rendered as cards; live filtering by **name search + Department + Experience**. Deep-linkable:
  `doctors.html?department=Cardiology` pre-filters. "Book Appointment" on each card carries the
  doctor + department into the booking form.
- **Departments** (`departments.html`) — search + Surgical/Medical/Diagnostic chips filter the 12
  cards; "Know More" → Cardiology detail page, others → doctors filtered by that department.
- **Blog** (`blog.html`) — category chips filter posts; every card + "Read Full Article" opens the
  article page (`blog-article.html`, a sample post — duplicate & edit for real posts); newsletter
  validates + confirms.
- **Book Appointment** (`book-appointment.html`) — required-field validation, inline errors, a
  confirmation screen with a summary, and "Book Another" reset. Pre-selects department/doctor from
  the URL (`?doctor=…&department=…`).
- **Contact** (`contact.html`) — a full enquiry form (name/phone/email/subject/message) with
  validation + success state.
- **Every button navigates or acts** — a build-time sweep guarantees zero dead buttons across all
  14 pages (each is a form submit, nav control, filter chip, reset, or a wired link).

> Forms are front-end only. To receive real submissions, point the `<form>`s at a backend or a
> service like Formspree/Web3Forms (see `initContactForm` / `initBookingForm` in `main.js`).

## Accessibility & UX quality

Audited against the UI/UX priority checklist (accessibility → touch → performance → responsive → forms).
Fixes applied:

- **Dark-mode contrast bug (root cause)** — `tailwind.config.js` was missing `darkMode: 'class'`, so
  Stitch's leftover `dark:` variants activated on dark-mode devices and produced dark-on-dark text.
  Set to `'class'` so the light-only design renders consistently everywhere.
- **Colour contrast** — all body text meets WCAG AA 4.5:1 (large text 3:1); `text-outline` (a
  border tone) is upgraded to `on-surface-variant` wherever it was used as text.
- **Reduced motion** — `@media (prefers-reduced-motion: reduce)` neutralises animations/transitions.
- **Keyboard** — a "Skip to main content" link and a consistent `:focus-visible` outline on all
  interactive elements.
- **CLS** — every `<img>` carries intrinsic `width`/`height` (from `build/image-dims.json`) so space
  is reserved before load.
- **Touch targets** — department cards are fully clickable (≈300×396px) instead of a 20px text link;
  primary buttons/inputs are ≥44px.
- Verified: 447 internal links (0 broken), 37 images (0 broken, 0 missing alt, 0 missing dimensions),
  one `<h1>` per page, 0 dead buttons, 0 invalid nested anchors, no console errors, no horizontal
  scroll (mobile + desktop), mobile drawer + all filters/forms working.

## SEO (local — Erode)

On-page and technical SEO is built into every page by the assembler:

- **Local-keyword titles & meta descriptions** — every page targets "… in Erode" (e.g. "Best
  Multispeciality Hospital in Erode", "24/7 Emergency Hospital in Erode | Call 1066").
- **Structured data (JSON-LD)** — `Hospital` LocalBusiness node (home + contact) with full NAP,
  Erode geo-coordinates (11.3410, 77.7172), `areaServed` (Erode + 7 nearby towns), medical
  specialties, opening hours and bed count; `WebSite`, `Physician` (doctor page), `FAQPage`
  (health packages, matched to a visible FAQ), and `BreadcrumbList` on every interior page.
- **Geo meta tags** — `geo.region`, `geo.placename`, `geo.position`, `ICBM` on all pages.
- **Open Graph + Twitter cards** with per-page image, `canonical` URLs, `robots` directives,
  `theme-color`, `lang="en-IN"`.
- **One `<h1>` per page** (the assembler promotes a stray `<h2>` when a page lacks one),
  descriptive `alt` on all images, visible breadcrumbs.
- **`sitemap.xml`** (with `lastmod` + priorities) and **`robots.txt`** (explicitly welcomes
  Google/Bing + AI crawlers).

All 16 JSON-LD blocks validate as parseable; test them at
[Rich Results Test](https://search.google.com/test/rich-results) once live.

### Ranking #1 in Erode also needs OFF-SITE work (code alone can't do this)

On-page SEO is necessary but not sufficient. For local map-pack / "hospital in Erode" ranking,
the dominant factors are off-site and must be done by the client:

1. **Google Business Profile** — the single biggest local ranking factor. Claim/verify it with
   the exact same Name, Address, Phone as the site, correct category ("Hospital"), photos,
   services and hours.
2. **Real NAP** — replace the placeholder address/phone/postcode in `build/assemble.mjs`
   (`BUSINESS`) with the registered details, and keep them identical everywhere (site, GBP,
   directories like Justdial/Practo/Sulekha).
3. **Reviews** — steady, responded-to Google reviews.
4. **Real HTTPS domain** — set `BASE_URL` in `build/assemble.mjs`, then rebuild.
5. **Backlinks & citations** — local directories, associations, press.
6. **Content freshness** — publish the blog regularly with Erode-relevant health topics.
7. Submit `sitemap.xml` in Google Search Console and monitor.

## Before going live

- **Domain** — update `BASE_URL` in `build/assemble.mjs` (used by `robots.txt` + `sitemap.xml`),
  then rebuild.
- **Placeholder content** — health-package prices are marked indicative; sample doctor names,
  emails (`@thamarai.com`), and the address (`123 Healthcare Way`) are Stitch placeholders to
  confirm with the client.
- **Forms** — the appointment/contact forms are front-end only; wire them to a backend or form
  service (e.g. Formspree) before launch.

## Source & tooling (not deployed)

- `screens/` — original Stitch HTML + screenshots per screen (`03-departments-requirements`
  is a Markdown brief, not a design).
- `design-system/` — extracted Stitch design system (tokens, theme, style guide).
- `build/` — `assemble.mjs` (page composer), `partials/`, `serve.mjs` (dev server), image maps.
- `.stitch/` — raw Stitch API responses.
