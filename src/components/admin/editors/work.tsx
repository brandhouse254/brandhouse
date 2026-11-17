"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Briefcase, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { projectFrameLabels, projectFrames, workCategories, workCategoryLabels, type Project, type ProjectFrame, type ProjectImage } from "@/lib/cms/types";
import { youtubeId, youtubeThumbnail } from "@/lib/cms/public";
import { EditorBar, useSectionEditor } from "../editor";
import { ImageField, VideoField } from "../media";
import { Badge, Button, Card, Chips, EmptyState, Grid, IconButton, Repeater, Select, StringList, TextArea, TextField, Toggle } from "../ui";
import { thumb } from "@/lib/cms/thumb";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const blankImage = (): ProjectImage => ({ src: "", alt: "", width: 1600, height: 1200 });

function blankProject(): Project {
  return {
    slug: "",
    title: "",
    published: false,
    client: null,
    isSample: false,
    industry: "",
    categories: [],
    services: [],
    summary: "",
    brief: "",
    objectives: [],
    creativeDirection: "",
    cover: blankImage(),
    gallery: [],
    video: null,
    outcome: null,
    year: String(new Date().getFullYear()),
    featured: false,
    frame: "photo",
    tagline: "",
    link: null,
  };
}

const frameHints: Record<ProjectFrame, string> = {
  photo: "The cover photo, full size.",
  ad: "The cover with a small social ad card on top, using the mock-up line.",
  phone: "The cover inside a phone on an orange card, like an Instagram story.",
  browser: "A website mock-up in a browser window: the mock-up line as the headline, the cover beside it.",
  film: "The cover with a play button. Best when the project has a video.",
};

/* ───────────── List ───────────── */

export function WorkList({ initial, showSamples }: { initial: Project[]; showSamples: boolean }) {
  const ed = useSectionEditor("projects", initial);
  const items = ed.value;
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "sample">("all");

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    ed.setValue(next);
  };

  const featuredCount = items.filter((p) => p.featured && p.published).length;
  const counts = useMemo(
    () => ({
      all: items.length,
      published: items.filter((p) => p.published && !p.isSample).length,
      draft: items.filter((p) => !p.published).length,
      sample: items.filter((p) => p.isSample).length,
    }),
    [items],
  );

  const shown = items
    .map((p, i) => ({ p, i }))
    .filter(({ p }) =>
      filter === "all" ? true : filter === "published" ? p.published && !p.isSample : filter === "draft" ? !p.published : p.isSample,
    );

  return (
    <>
      <EditorBar
        title="Portfolio"
        description="Everything on /work. Star up to six projects to feature them on the homepage, in this order (six fills the full showcase)."
        editor={ed}
        viewHref="/work"
        extra={
          <Link href="/admin/work/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-ink hover:bg-accent-deep hover:text-white">
            <Plus className="size-4" /> New project
          </Link>
        }
      />

      <p className="mb-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-ink/10">
        <Star className="size-4 shrink-0 fill-accent text-accent" aria-hidden />
        <span>
          <strong className="font-semibold">{featuredCount} of 6</strong> featured on the homepage.
          {featuredCount > 6 ? " Only the first six (top of this list) are shown." : featuredCount === 0 ? " None starred, so the first six published projects are shown." : ""}
        </span>
      </p>

      {!showSamples && counts.sample > 0 ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-600/15">
          Showcase pieces are switched off in Contact &amp; social, so they&apos;re hidden on the site even if published.
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "published", "draft", "sample"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm ring-1 ring-inset ${filter === f ? "bg-ink text-white ring-ink" : "bg-white text-ink/70 ring-ink/15 hover:ring-ink/30"}`}
          >
            {{ all: "All", published: "Client work", draft: "Drafts", sample: "Showcase" }[f]} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Briefcase className="size-6" />} title="No projects yet" body="Add your first case study." action={<Link href="/admin/work/new" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">New project</Link>} />
      ) : (
        <ul className="space-y-3">
          {shown.map(({ p, i }) => (
            <li key={`${p.slug}-${i}`} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 rounded-2xl bg-white p-3 ring-1 ring-ink/10 transition hover:ring-ink/20 sm:flex">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-paper sm:h-20 sm:w-32">
                {p.cover.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(p.cover.src, 384)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/work/${p.slug}`} className="line-clamp-2 font-display font-semibold leading-snug hover:underline">
                  {p.title || "Untitled project"}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {p.published ? <Badge tone="green">Published</Badge> : <Badge tone="amber">Draft</Badge>}
                  {p.featured ? <Badge tone="orange">Featured</Badge> : null}
                  {p.isSample ? <Badge>Showcase</Badge> : null}
                </div>
                <p className="mt-1 truncate text-sm text-mute-2">
                  {[p.client, p.industry, p.categories.map((c) => workCategoryLabels[c]).join(", ")].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="col-span-2 flex shrink-0 items-center justify-end border-t border-ink/8 pt-1.5 sm:border-0 sm:pt-0">
                <IconButton
                  label={p.featured ? "Remove from homepage" : "Feature on homepage"}
                  onClick={() => ed.setValue(items.map((x, j) => (j === i ? { ...x, featured: !x.featured } : x)))}
                >
                  <Star className={p.featured ? "size-4 fill-accent text-accent" : "size-4"} />
                </IconButton>
                <IconButton label="Move up" disabled={i === 0} onClick={() => moveItem(i, i - 1)}>
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => moveItem(i, i + 1)}>
                  <ArrowDown className="size-4" />
                </IconButton>
                <IconButton
                  label={p.published ? "Unpublish (make draft)" : "Publish"}
                  onClick={() => ed.setValue(items.map((x, j) => (j === i ? { ...x, published: !x.published } : x)))}
                >
                  {p.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </IconButton>
                <Link href={`/admin/work/${p.slug}`} aria-label="Edit" title="Edit" className="inline-flex size-8 items-center justify-center rounded-full text-ink/55 hover:bg-ink/6 hover:text-ink">
                  <Pencil className="size-4" />
                </Link>
                <IconButton
                  label="Delete"
                  className="hover:text-red-600"
                  onClick={() => {
                    if (confirm(`Delete "${p.title}"?`)) ed.setValue(items.filter((_, j) => j !== i));
                  }}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ───────────── Single project ───────────── */

export function ProjectEditor({ projects, slug, serviceNames }: { projects: Project[]; slug: string | null; serviceNames: string[] }) {
  const router = useRouter();
  const isNew = slug === null;
  const [initial] = useState(() => (isNew ? [blankProject(), ...projects] : projects));
  const [index] = useState(() => (isNew ? 0 : projects.findIndex((p) => p.slug === slug)));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const deleting = useRef(false);
  const ed = useSectionEditor("projects", initial, {
    stored: projects,
    onDiscard: isNew ? () => router.push("/admin/work") : undefined,
    onSaved: (stored) => {
      if (deleting.current) return;
      const saved = stored[index];
      if (saved && (isNew || saved.slug !== slug)) router.replace(`/admin/work/${saved.slug}`);
    },
  });
  const p = ed.value[index];

  if (!p) {
    return <EmptyState title="Project not found" body="It may have been deleted or renamed." action={<Link href="/admin/work" className="underline">Back to all projects</Link>} />;
  }

  const set = (patch: Partial<Project>) => ed.setValue(ed.value.map((x, i) => (i === index ? { ...x, ...patch } : x)));

  const remove = async () => {
    if (!confirm(`Delete "${p.title || "this project"}"?`)) return;
    if (isNew) return router.push("/admin/work");
    deleting.current = true;
    const remaining = ed.value.filter((_, i) => i !== index);
    if (await ed.save(remaining)) router.push("/admin/work");
    else deleting.current = false;
  };

  return (
    <>
      <EditorBar
        title={isNew ? "New project" : p.title || "Untitled project"}
        description={
          <Link href="/admin/work" className="hover:underline">
            ← All projects
          </Link>
        }
        editor={ed}
        viewHref={p.slug ? `/work/${p.slug}` : "/work"}
        extra={
          <Button variant="danger" onClick={remove}>
            <Trash2 className="size-4" /> <span className="hidden sm:inline">Delete</span>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-6">
          <Card title="Basics">
            <TextField
              label="Project title"
              value={p.title}
              onChange={(title) => set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) })}
              max={160}
            />
            <TextField
              label="Web address"
              prefix="/work/"
              value={p.slug}
              onChange={(v) => {
                setSlugTouched(true);
                set({ slug: slugify(v) });
              }}
              hint="Lowercase words joined by dashes. Changing it later breaks links people have saved."
            />
            <TextArea label="Summary" value={p.summary} onChange={(summary) => set({ summary })} max={600} hint="One or two sentences. Shown at the top of the case study and in Google results." />
            <Grid cols={3}>
              <TextField label="Client name" value={p.client ?? ""} onChange={(client) => set({ client: client || null })} hint="Only if the client agreed to be named." />
              <TextField label="Industry" value={p.industry} onChange={(industry) => set({ industry })} placeholder="e.g. Hospitality" />
              <TextField label="Year" value={p.year ?? ""} onChange={(year) => set({ year })} />
            </Grid>
            <Chips
              label="Disciplines"
              value={p.categories}
              onChange={(categories) => set({ categories })}
              options={workCategories.map((c) => ({ value: c, label: workCategoryLabels[c] }))}
              hint="Used for the filters on /work and to show related work on service pages."
            />
            <StringList
              label="Services delivered"
              value={p.services}
              onChange={(services) => set({ services })}
              addLabel="Add a service"
              max={10}
              placeholder={serviceNames[0] ? `e.g. ${serviceNames[0]}` : undefined}
            />
          </Card>

          <Card title="Cover & presentation" description="The cover shows on project cards and at the top of the project page. Choose how it is presented.">
            <ImageField label="Cover" value={p.cover} onChange={(cover) => set({ cover })} aspect="aspect-[4/5]" hint="Portrait photos (4:5) fill the cards best." />
            <Select
              label="Presentation"
              value={p.frame}
              onChange={(frame) => set({ frame })}
              options={projectFrames.map((f) => ({ value: f, label: projectFrameLabels[f] }))}
              hint={frameHints[p.frame]}
            />
            {p.frame === "ad" || p.frame === "browser" ? (
              <TextField
                label="Mock-up line"
                value={p.tagline}
                onChange={(tagline) => set({ tagline })}
                max={80}
                hint={p.frame === "ad" ? "The ad text, e.g. The new drop lands Friday." : "The website headline, e.g. Made in Nairobi. Worn everywhere."}
              />
            ) : null}
          </Card>

          <Card title="Link (optional)" description="A button on the project page: the live website, a YouTube video, an Instagram post, a press article.">
            <Grid>
              <TextField
                label="Button text"
                value={p.link?.label ?? ""}
                onChange={(label) => set({ link: label || p.link?.href ? { label, href: p.link?.href ?? "" } : null })}
                max={40}
                placeholder="e.g. Visit the website"
              />
              <TextField
                label="Link"
                value={p.link?.href ?? ""}
                onChange={(href) => set({ link: href || p.link?.label ? { label: p.link?.label ?? "", href } : null })}
                placeholder="https://"
              />
            </Grid>
          </Card>

          <Card title="The story">
            <TextArea label="Brief" value={p.brief} onChange={(brief) => set({ brief })} max={1500} rows={4} hint="What the client needed and why." />
            <StringList label="Objectives" value={p.objectives} onChange={(objectives) => set({ objectives })} addLabel="Add an objective" max={10} />
            <TextArea label="Creative direction" value={p.creativeDirection} onChange={(creativeDirection) => set({ creativeDirection })} max={1500} rows={4} />
            <TextArea
              label="Outcome"
              value={p.outcome ?? ""}
              onChange={(outcome) => set({ outcome: outcome || null })}
              max={1200}
              hint="Only results the client has confirmed. Leave empty to hide this section."
            />
          </Card>

          <Card title="Gallery" description="Extra images shown on the case study, in this order. The first one is shown largest.">
            <Repeater
              items={p.gallery}
              onChange={(gallery) => set({ gallery })}
              create={blankImage}
              itemLabel={(g, i) => g.alt.slice(0, 60) || `Image ${i + 1}`}
              addLabel="Add an image"
              max={24}
              render={(g, update) => <ImageField label="Image" value={g} onChange={(img) => update(img)} aspect="aspect-[4/3]" />}
            />
          </Card>

          <Card title="Video (optional)" description="Paste a YouTube or Vimeo link (recommended: it plays smoothly everywhere and doesn't use your storage), or upload a video file.">
            <VideoField
              label="Video"
              value={p.video?.src ?? ""}
              allowLinks
              warnAboveBytes={80 * 1024 * 1024}
              onChange={(src) => set({ video: src ? { src, poster: p.video?.poster ?? p.cover.src, title: p.video?.title ?? p.title } : null })}
              extra={
                p.video && youtubeId(p.video.src) ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      set({
                        cover: { src: youtubeThumbnail(youtubeId(p.video!.src)!), alt: p.cover.alt || `Still from ${p.title || "the project video"}`, width: 480, height: 360 },
                      })
                    }
                  >
                    Use the video thumbnail as the cover image
                  </Button>
                ) : null
              }
            />
            {p.video ? (
              <TextField label="Video title (for screen readers)" value={p.video.title} onChange={(title) => set({ video: { ...p.video!, title } })} />
            ) : null}
          </Card>
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-28 xl:self-start">
          <Card title="Visibility">
            <Toggle
              label="Published"
              checked={p.published}
              onChange={(published) => set({ published })}
              hint={p.published ? "Visible on the website." : "Draft: only visible here in the admin."}
            />
            <Toggle
              label="Featured on the homepage"
              checked={p.featured}
              onChange={(featured) => set({ featured })}
              hint="Shown in the homepage showcase. Up to six, in the order of the project list."
            />
            <Toggle
              label="Showcase piece (not client work)"
              checked={p.isSample}
              onChange={(isSample) => set({ isSample })}
              hint="For pieces that show what we make rather than a named client's project. Real client work should have this off."
            />
          </Card>
          <div className="rounded-2xl bg-white p-4 text-sm text-mute-2 ring-1 ring-ink/10">
            <p className="font-medium text-ink">Tip</p>
            <p className="mt-1">Press Ctrl+S (⌘S on Mac) to save at any time.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
