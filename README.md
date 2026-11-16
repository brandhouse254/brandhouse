# Brand House — brandhouse.co.ke

Website for **Brand House, a creative, media & digital agency**. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Motion, ready to deploy on Vercel.

## Status

| Item | State |
| --- | --- |
| All pages, routes, SEO, sitemap, robots | Built and tested |
| Production build, lint, type-check | Passing |
| Accessibility (axe, WCAG 2.1 AA rules) | No violations on any page |
| Contact form | Built and tested. **Sends only once Resend is configured** (see below). Until then it tells visitors plainly that the message was not sent. |
| Hero video, images, portfolio | **Placeholders.** Abstract visuals and clearly labelled sample concepts for fictional brands. |
| Contact details | Email brandhouse254@gmail.com, phone and WhatsApp +254 740 953007 are live in `src/config/site.ts`. Social links are still empty and hidden. |
| Deployment / domain | **Not done yet.** Follow the steps below. |

---

## 1. Run it locally

Requires Node.js 22.18 or newer (Vercel's default Node 22 runtime works).

```bash
npm install
cp .env.example .env.local   # then fill in what you have
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run build       # production build
npm run start       # serve the production build on :3000
npm run check       # lint + typecheck + build in one go
```

## 2. Edit content

| What | Where |
| --- | --- |
| Business details: email, phone, location, social links, nav, CTA labels, enquiry budget/timeline options | `src/config/site.ts` |
| Service divisions (copy, capabilities, deliverables, SEO titles) | `src/content/services.ts` |
| Portfolio projects and case studies | `src/content/projects.ts` |
| Testimonials (hidden until you add real ones) | `src/content/testimonials.ts` |
| Hero, images and video | `public/media/` (see `public/media/README.md`) |
| Logo files (SVG, PNG) | `public/brand/`; the site logo itself is drawn from `src/components/logo-art.ts` |
| Privacy policy (items marked `[CONFIRM]`) | `src/app/privacy/page.tsx` |

Empty values in `site.ts` are hidden rather than shown as fake details.

**Replacing the sample portfolio:** add real projects with `isSample: false`, put images in `public/work/<slug>/`, only name clients who have approved it, and only fill `outcome` with results the client has verified. Then set `showSampleProjects: false` in `src/config/site.ts`.

## 3. Environment variables

All variables are listed in `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | For the form | Resend API key (server-only) |
| `CONTACT_TO_EMAIL` | For the form | Inbox that receives enquiries (comma-separate several) |
| `CONTACT_FROM_EMAIL` | For the form | Verified sender, e.g. `Brand House <enquiries@brandhouse.co.ke>` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Overrides the public email (default brandhouse254@gmail.com) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Leave empty on Vercel: the site uses the project's production domain automatically (vercel.app now, brandhouse.co.ke once connected) |
| `NEXT_PUBLIC_VERCEL_ANALYTICS` | Optional | `1` to enable Vercel Web Analytics (cookieless) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional | Enables Plausible (cookieless) |
| `SITE_INDEXABLE` | Only off Vercel | `true` on a non-Vercel production server |

`NEXT_PUBLIC_*` values are visible in the browser. Never put secrets in them.

### Setting up the contact form (Resend)

1. Create an account at [resend.com](https://resend.com).
2. **Domains → Add domain** → `brandhouse.co.ke`. Add the DNS records Resend shows at your DNS provider and wait for "Verified".
3. **API Keys → Create** with sending access. Copy it.
4. Add `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` in Vercel (step 4) for Production (and Preview if you want to test there), then redeploy.

How the form behaves:

- Validates in the browser and again on the server with the same rules (`src/lib/contact-schema.ts`).
- Spam protection without CAPTCHAs: a hidden honeypot field, a minimum fill time of 3 seconds, and a basic per-instance rate limit.
- Shows **success only when Resend accepts the email**. Missing configuration returns a clear "not sent" message (HTTP 503); a delivery failure returns HTTP 502.
- The visitor's address is set as reply-to, so you can answer straight from your inbox.

## 4. Deploy to Vercel

**Option A: GitHub (recommended)**

1. Push this folder to a new GitHub repository (the included `.gitignore` excludes `node_modules`, `.next` and `.env*`).
2. In Vercel: **Add New → Project → Import** the repository. The framework is detected as Next.js; keep the default build settings.
3. Add the environment variables from step 3 before the first deploy.
4. Deploy. Every push to `main` deploys to production; other branches get preview URLs.

**Option B: Vercel CLI**

```bash
npm i -g vercel
vercel          # first run links the project and creates a preview
vercel --prod   # production deploy
```

Preview deployments are automatically `noindex`, disallowed in `robots.txt`, and their canonical URLs point to `brandhouse.co.ke`, so they never compete with the live site.

## 5. Connect brandhouse.co.ke

Once the domain is registered and you can edit its DNS (e.g. in your registrar's or host's DNS zone editor):

1. Vercel → Project → **Settings → Domains** → add `brandhouse.co.ke` and `www.brandhouse.co.ke`. Choose to redirect `www` to the apex (or the other way round).
2. Vercel shows the exact DNS records to create. Typically an **A record** for `@` and a **CNAME** for `www`. Use the values Vercel displays for your project.
3. At your DNS provider, remove any conflicting A/AAAA/CNAME records for `@` and `www`, then add Vercel's records. Leave MX and the Resend records untouched.
4. Wait for Vercel to show **Valid Configuration**. HTTPS certificates are issued automatically.

## 6. Verify the live site

- [ ] `https://brandhouse.co.ke` loads over HTTPS; `www` redirects.
- [ ] `https://brandhouse.co.ke/robots.txt` shows `Allow: /` and the sitemap line.
- [ ] `https://brandhouse.co.ke/sitemap.xml` lists all pages.
- [ ] View source on any page: `<meta name="robots" content="index, follow">` and a canonical on `brandhouse.co.ke`.
- [ ] Send a test enquiry from `/contact` and confirm it arrives in `CONTACT_TO_EMAIL`. If it fails, check Vercel → Project → **Logs** for lines starting with `[contact]`.
- [ ] Share a page link in WhatsApp or LinkedIn and check the preview card.
- [ ] Submit the sitemap in Google Search Console.

## Project structure

```
src/
  app/                  routes (App Router)
    api/contact/        enquiry endpoint (Resend)
    services/[slug]/    service pages
    work/[slug]/        case studies (unknown slugs → 404)
    sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg, apple-icon.png
  components/           UI components (home/ holds homepage sections)
  config/site.ts        central business configuration
  content/              services, projects, testimonials
  lib/                  SEO, structured data, form schema, env helpers
  fonts/                self-hosted Space Grotesk + Inter (OFL)
public/
  brand/                logo SVG/PNG
  media/                placeholder images and hero video
```

## SEO and social sharing

- Every page has its own title, description, canonical link and breadcrumb data; the sitemap lists all pages.
- Social previews (WhatsApp, LinkedIn, Facebook, X) show `public/og/brand-house-social.jpg`, a 1200×630 capture of the homepage hero. Replace that file to change the card; keep the size.
- Structured data describes Brand House as an organisation serving Kenya, with phone, email and logo, plus a Service entry for each division.
- Preview deployments are never indexed. After connecting brandhouse.co.ke, submit `https://brandhouse.co.ke/sitemap.xml` in Google Search Console.
- WhatsApp and Facebook cache previews. If an old preview shows, refresh it at developers.facebook.com/tools/debug.

## Design notes

- **Palette:** charcoal `#111111`, off-white `#F5F2EC`, white, accent `#FD5019`, grey `#888888` (a darker `#66625C` is used for small text on light backgrounds to meet contrast). Orange buttons use dark text for contrast.
- **Type:** Space Grotesk for display, Inter for body. Tokens live in `src/app/globals.css`.
- **Logo:** the supplied BRAND HOUSE wordmark and B monogram, traced to vector (`src/components/logo-art.ts`). Ready-made files for print and social are in `public/brand/` (dark and light versions of the logo, mark and app icon). The browser-tab icon follows the visitor's light or dark theme.
- **Signature:** the viewfinder frame. Orange corner marks around the hero and key moments, tying the brand to film.
- **Motion:** one orchestrated hero reveal; CSS scroll-driven entrances (no JavaScript, fully visible in browsers without support); Motion is used only for the portfolio filter. Everything respects `prefers-reduced-motion`, and the hero video has a pause control and never loads with Data Saver or reduced motion on.
