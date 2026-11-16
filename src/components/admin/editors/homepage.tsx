"use client";

import { useState } from "react";
import type { DifferenceContent, HeroContent, IntroContent } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { EditorBar, useSectionEditor } from "../editor";
import { ImageField, VideoField } from "../media";
import { Card, Grid, Repeater, TextArea, TextField } from "../ui";

type Tab = "hero" | "intro" | "difference";

export function HomepageEditor({ hero, intro, difference }: { hero: HeroContent; intro: IntroContent; difference: DifferenceContent }) {
  const [tab, setTab] = useState<Tab>("hero");
  const heroEd = useSectionEditor("hero", hero);
  const introEd = useSectionEditor("intro", intro);
  const diffEd = useSectionEditor("difference", difference);

  const tabs: { id: Tab; label: string; dirty: boolean }[] = [
    { id: "hero", label: "Hero", dirty: heroEd.dirty },
    { id: "intro", label: "Introduction", dirty: introEd.dirty },
    { id: "difference", label: "Why Brand House", dirty: diffEd.dirty },
  ];

  const tabBar = (
    <div role="tablist" aria-label="Homepage sections" className="mb-6 inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={tab === t.id}
          onClick={() => setTab(t.id)}
          className={cn(
            "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
            tab === t.id ? "bg-ink text-white" : "text-ink/65 hover:text-ink",
          )}
        >
          {t.label}
          {t.dirty ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-amber-500" aria-label="(unsaved)" /> : null}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div hidden={tab !== "hero"}>
        <EditorBar title="Homepage" description="The first thing visitors see. Changes go live when you publish." editor={heroEd} viewHref="/" />
        {tabBar}
        <HeroForm ed={heroEd} />
      </div>
      <div hidden={tab !== "intro"}>
        <EditorBar title="Homepage" description="The section right after the hero." editor={introEd} viewHref="/#intro-title" />
        {tabBar}
        <IntroForm ed={introEd} />
      </div>
      <div hidden={tab !== "difference"}>
        <EditorBar title="Homepage" description="The dark section explaining what makes Brand House different." editor={diffEd} viewHref="/#difference-title" />
        {tabBar}
        <DifferenceForm ed={diffEd} />
      </div>
    </>
  );
}

function HeroForm({ ed }: { ed: ReturnType<typeof useSectionEditor<HeroContent>> }) {
  const v = ed.value;
  const set = (patch: Partial<HeroContent>) => ed.setValue({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <HeroPreview hero={v} />
      <Card title="Headline & text">
        <TextField label="Small heading above the headline" value={v.eyebrow} onChange={(eyebrow) => set({ eyebrow })} max={120} />
        <Grid>
          <TextField label="Headline, line 1" value={v.line1} onChange={(line1) => set({ line1 })} max={60} />
          <TextField label="Headline, line 2" value={v.line2} onChange={(line2) => set({ line2 })} max={60} hint="Optional. Each line animates in separately." />
        </Grid>
        <TextArea label="Intro paragraph" value={v.lead} onChange={(lead) => set({ lead })} max={400} />
      </Card>
      <Card title="Buttons">
        <Grid>
          <TextField label="Main button text" value={v.primaryCta.label} onChange={(label) => set({ primaryCta: { ...v.primaryCta, label } })} max={60} />
          <TextField label="Main button link" value={v.primaryCta.href} onChange={(href) => set({ primaryCta: { ...v.primaryCta, href } })} hint="A page on this site like /contact, or a full https:// link." />
          <TextField label="Second button text" value={v.secondaryCta.label} onChange={(label) => set({ secondaryCta: { ...v.secondaryCta, label } })} max={60} />
          <TextField label="Second button link" value={v.secondaryCta.href} onChange={(href) => set({ secondaryCta: { ...v.secondaryCta, href } })} />
        </Grid>
      </Card>
      <Card title="Background image & video" description="The image shows straight away. If you add a video, it fades in over the image and loops silently. Visitors who prefer less motion or are saving data keep the still image.">
        <ImageField label="Background image" value={v.image} onChange={(image) => set({ image })} hint="Landscape, at least 2400px wide. This is also the video's first frame." />
        <VideoField
          label="Background video (optional)"
          value={v.video?.src ?? ""}
          onChange={(src, type) => set({ video: src ? { src, type: type === "video/webm" ? "video/webm" : "video/mp4" } : null })}
          hint="MP4 works everywhere. Keep it short (15–30 seconds), without sound, ideally under 15 MB."
        />
        <TextField label="Timecode in the corner" value={v.timecode} onChange={(timecode) => set({ timecode })} max={20} hint="A decorative film timecode, top right. Leave empty to hide it." />
      </Card>
    </div>
  );
}

function HeroPreview({ hero }: { hero: HeroContent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink text-white shadow-[0_10px_40px_-12px_rgba(17,17,17,0.45)]">
      <div className="relative aspect-[16/8] min-h-64">
        {hero.video?.src ? (
          <video key={hero.video.src} src={hero.video.src} poster={hero.image.src} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
        ) : hero.image.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.image.src} alt="" className="absolute inset-0 size-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.45)_0%,rgba(17,17,17,0.1)_35%,rgba(17,17,17,0.85)_100%)]" />
        <span className="absolute left-4 top-4 rounded-full bg-white/15 px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.12em] backdrop-blur">Live preview</span>
        {hero.timecode ? <span className="absolute right-5 top-4 font-display text-xs tabular-nums text-white/60">{hero.timecode}</span> : null}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          {hero.eyebrow ? <p className="font-display text-sm text-white/80">{hero.eyebrow}</p> : null}
          <p className="mt-2 font-display text-[clamp(1.8rem,4.2vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            {hero.line1}
            {hero.line2 ? (
              <>
                <br />
                {hero.line2}
              </>
            ) : null}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-md text-sm text-white/75">{hero.lead}</p>
            <div className="flex gap-2">
              <span className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink">{hero.primaryCta.label}</span>
              <span className="rounded-full px-4 py-2 text-xs font-medium ring-1 ring-white/40">{hero.secondaryCta.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntroForm({ ed }: { ed: ReturnType<typeof useSectionEditor<IntroContent>> }) {
  const v = ed.value;
  const set = (patch: Partial<IntroContent>) => ed.setValue({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <Card title="Introduction">
        <TextField label="Heading" value={v.title} onChange={(title) => set({ title })} max={160} />
        <TextArea label="Statement" value={v.statement} onChange={(statement) => set({ statement })} max={600} />
      </Card>
      <Card title="Three key facts" description="Short points shown in columns under the statement.">
        <Repeater
          items={v.facts}
          onChange={(facts) => set({ facts })}
          create={() => ({ title: "", body: "" })}
          itemLabel={(f) => f.title}
          addLabel="Add a fact"
          max={6}
          render={(f, update) => (
            <>
              <TextField label="Title" value={f.title} onChange={(title) => update({ title })} max={160} />
              <TextArea label="Text" value={f.body} onChange={(body) => update({ body })} max={600} />
            </>
          )}
        />
      </Card>
    </div>
  );
}

function DifferenceForm({ ed }: { ed: ReturnType<typeof useSectionEditor<DifferenceContent>> }) {
  const v = ed.value;
  const set = (patch: Partial<DifferenceContent>) => ed.setValue({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <Card title="Section heading">
        <TextField label="Heading" value={v.title} onChange={(title) => set({ title })} max={160} />
        <TextArea label="Intro text" value={v.lead} onChange={(lead) => set({ lead })} max={600} />
      </Card>
      <Card title="Points">
        <Repeater
          items={v.points}
          onChange={(points) => set({ points })}
          create={() => ({ title: "", body: "" })}
          itemLabel={(p) => p.title}
          addLabel="Add a point"
          max={10}
          render={(p, update) => (
            <>
              <TextField label="Title" value={p.title} onChange={(title) => update({ title })} max={160} />
              <TextArea label="Text" value={p.body} onChange={(body) => update({ body })} max={600} />
            </>
          )}
        />
      </Card>
    </div>
  );
}
