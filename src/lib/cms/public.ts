import type { Project, Service, SiteContent, WorkCategory } from "./types";

/** Projects visitors may see: published, and samples only while samples are switched on. */
export function visibleProjects(c: SiteContent): Project[] {
  return c.projects.filter((p) => p.published && (!p.isSample || c.settings.showSampleProjects));
}

export function findProject(c: SiteContent, slug: string): Project | undefined {
  return visibleProjects(c).find((p) => p.slug === slug);
}

export function relatedProjects(c: SiteContent, project: Project, count = 2): Project[] {
  return visibleProjects(c)
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({ p, score: p.categories.filter((cat) => project.categories.includes(cat)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ p }) => p);
}

export function projectsByCategory(c: SiteContent, category: WorkCategory): Project[] {
  return visibleProjects(c).filter((p) => p.categories.includes(category));
}

export function findService(c: SiteContent, slug: string): Service | undefined {
  return c.services.find((s) => s.slug === slug);
}

export function activeSocialLinks(c: SiteContent) {
  return c.settings.social.filter((s) => s.href.trim() !== "");
}

const embedPatterns: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/youtube\.com\/watch\?v=([\w-]{6,})/i, (m) => `https://www.youtube-nocookie.com/embed/${m[1]}`],
  [/youtu\.be\/([\w-]{6,})/i, (m) => `https://www.youtube-nocookie.com/embed/${m[1]}`],
  [/youtube\.com\/(?:embed|shorts)\/([\w-]{6,})/i, (m) => `https://www.youtube-nocookie.com/embed/${m[1]}`],
  [/vimeo\.com\/(?:video\/)?(\d+)/i, (m) => `https://player.vimeo.com/video/${m[1]}`],
];

/** YouTube / Vimeo links become embed URLs; anything else is treated as a video file. */
export function videoEmbedUrl(src: string): string | null {
  for (const [re, build] of embedPatterns) {
    const m = src.match(re);
    if (m) return build(m);
  }
  return null;
}
