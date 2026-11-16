# Placeholder media

Every image and video in this folder was made for development. None of it is
real Brand House or client work.

- `service-brand.jpg`, `service-web.jpg` and all `<project>-*.jpg` files are
  concept mock-ups for fictional brands (Mlima Motors, Tamu Roastery, Kijani
  Ledger, Mtaa Kicks, Nuru Botanics, Jenga Works).
- `hero-poster.jpg` (the homepage hero still), `service-film.jpg`, `service-marketing.jpg` and `about.jpg`
  are abstract placeholders.

Replace before or soon after launch:

| File | Used for | Suggested replacement |
| --- | --- | --- |
| (none yet) | Homepage hero video | Optional. A calm 6–12 s silent showreel loop, 1920×1080, MP4 under ~3 MB plus a WebM. See the note in `src/components/home/Hero.tsx`. |
| hero-poster.jpg | Hero poster and fallback | First frame of the showreel, 1920×1080 |
| service-*.jpg | Service sections and pages | One strong image per division, ~2000 px wide |
| about.jpg | About page | Team or studio photography |
| <project>-1..3.jpg | Sample projects | Remove with the sample projects (see src/content/projects.ts) |

Keep the same file names to swap without code changes, or update the paths in
`src/content/services.ts`, `src/content/projects.ts` and `src/components/home/Hero.tsx`.
